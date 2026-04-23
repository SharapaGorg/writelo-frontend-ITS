import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useContentEditorStore } from '../stores/contentEditorStore'
import { useContentProjectStore, useContentCalendarApi } from '~/lib-modules/content-calendar'
import type {
  CalendarPost,
  ContentType as CalendarContentType,
  PostMediaDto,
  PostStatus,
} from '~/lib-modules/content-calendar'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import type { ContentDraft, ContentType, DraftImage } from '../types'

function splitScheduledDate(scheduledDate: string | null): { date: string; time?: string } {
  if (scheduledDate) {
    // Format from datetime-local input: 'YYYY-MM-DDTHH:MM' (optionally with seconds).
    const [datePart, timePart] = scheduledDate.split('T')
    if (datePart) {
      const hhmm = timePart?.slice(0, 5)
      return { date: datePart, time: hhmm || undefined }
    }
  }
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return { date: `${y}-${m}-${d}` }
}

function draftToCalendarPostInput(draft: ContentDraft): Omit<CalendarPost, 'id'> {
  // Editor ContentType ('post' | 'story' | 'reel') → Calendar ContentType ('post' | 'story' | 'reels' | 'article')
  const type: CalendarContentType = draft.type === 'reel' ? 'reels' : draft.type
  const { date, time } = splitScheduledDate(draft.scheduledDate)
  // Media is persisted via the separate /posts/uploads/* pipeline — not through upsert.
  return {
    title: draft.title,
    // Editor's single main textarea maps to backend contentText (CalendarPost.content).
    content: draft.description,
    type,
    status: draft.status as PostStatus,
    accountId: draft.accountId,
    tags: [],
    date,
    time,
  }
}

export const useContentEditor = () => {
  const store = useContentEditorStore()
  const projectStore = useContentProjectStore()
  const { currentProjectAccounts } = storeToRefs(projectStore)
  const {
    currentDraft,
    originalDraftSnapshot,
    editorMode,
    isSaving,
    isReel,
    isEditMode,
    chatMessages,
    isChatProcessing,
    activePanel,
    conversationId,
    postId,
    selectedAccountId
  } = storeToRefs(store)

  /**
   * Start creating new content and navigate to editor
   */
  const startNewContent = (type: ContentType, accountId: string) => {
    store.createNewDraft(type, accountId)
    navigateTo('/app/editor')
  }

  /**
   * Open existing content for editing
   */
  const openExistingContent = (postId: string) => {
    navigateTo(`/app/editor/${postId}`)
  }

  const saveDraft = async () => {
    if (!currentDraft.value) return
    const draft = currentDraft.value
    const original = originalDraftSnapshot.value
    const payload = draftToCalendarPostInput(draft)
    const api = useContentCalendarApi()
    const { requireWorkspaceId } = useWorkspaceContext()

    store.setIsSaving(true)
    try {
      // 1) Persist text fields; obtain postId.
      let targetPostId = postId.value
      if (targetPostId) {
        await projectStore.updatePost(targetPostId, payload)
      } else {
        const created = await projectStore.createPost(payload)
        if (!created) throw new Error('createPost returned null')
        targetPostId = created.id
        store.setPostId(targetPostId)
        navigateTo(`/app/editor/${targetPostId}`, { replace: true })
      }

      // 2) Only hit the media pipeline once we actually have a workspace (skip in demo).
      if (!projectStore.isDemo) {
        const workspaceId = requireWorkspaceId()

        // Delete media that were present last save but got removed in the UI.
        const keptMediaIds = new Set(
          draft.images.filter(i => i.mediaId).map(i => i.mediaId!)
        )
        const toDelete = (original?.images ?? [])
          .filter(i => i.mediaId && !keptMediaIds.has(i.mediaId))
          .map(i => i.mediaId!)
        for (const mediaId of toDelete) {
          try {
            await api.deletePostMedia(workspaceId, targetPostId, mediaId)
          } catch (e) {
            console.error('[useContentEditor] deletePostMedia failed:', mediaId, e)
          }
        }

        // Upload new files (those without mediaId) and attach.
        const nextImages: DraftImage[] = []
        for (let i = 0; i < draft.images.length; i++) {
          const img = draft.images[i]
          if (img.mediaId) {
            nextImages.push(img)
            continue
          }
          if (!img.file) continue

          const finalized = await api.uploadPostMedia(workspaceId, img.file)
          const attached = await api.createPostMedia(workspaceId, targetPostId, {
            storageObjectId: finalized.storageObjectId,
            fileType: img.fileType,
            sortOrder: i,
          })
          const persistedUrl = attached.asset?.downloadUrl
          // If the backend already handed us a signed URL, the blob can go; otherwise
          // keep it as the session preview (next reload picks up the persisted URL).
          if (persistedUrl && img.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(img.previewUrl)
          }
          nextImages.push({
            previewUrl: persistedUrl || img.previewUrl,
            fileType: img.fileType,
            mediaId: attached.id,
            storageObjectId: attached.storageObjectId,
          })
        }

        // Reflect persisted media in the draft + in the calendar store.
        store.updateDraft({ images: nextImages })

        const freshMedia: PostMediaDto[] = nextImages
          .filter(i => i.mediaId && i.storageObjectId)
          .map((i, idx) => ({
            id: i.mediaId!,
            storageObjectId: i.storageObjectId!,
            fileType: i.fileType,
            sortOrder: idx,
            asset: i.previewUrl.startsWith('http') ? { downloadUrl: i.previewUrl } : null,
          }))
        const freshImageUrls = nextImages
          .filter(i => i.fileType === 'image')
          .map(i => i.previewUrl)
        projectStore.updatePostLocal(targetPostId, {
          mediaItems: freshMedia,
          image: freshImageUrls[0],
          images: freshImageUrls.length > 1 ? freshImageUrls : undefined,
        })
      }

      store.markAsSaved()
      toast.success('Сохранено', { position: getToasterPosition() })
    } catch (e) {
      console.error('[useContentEditor] saveDraft failed:', e)
      toast.error('Не удалось сохранить', { position: getToasterPosition() })
    } finally {
      store.setIsSaving(false)
    }
  }

  /**
   * Navigate back to calendar
   */
  const goBackToCalendar = () => {
    navigateTo('/app/calendar')
  }

  /**
   * Create a new draft without navigation (for internal use)
   */
  const createNewDraft = (type: ContentType, accountId: string) => {
    return store.createNewDraft(type, accountId)
  }

  /**
   * Copy text to description field
   */
  const copyToDescription = (text: string) => {
    store.updateDraft({ description: text })
  }

  /**
   * Append text to existing description
   */
  const appendToDescription = (text: string) => {
    const currentDescription = currentDraft.value?.description || ''
    const newDescription = currentDescription
      ? `${currentDescription}\n\n${text}`
      : text
    store.updateDraft({ description: newDescription })
  }

  /**
   * Switch to images panel for generation
   */
  const goToImagesPanel = () => {
    store.setEditorMode('images')
    store.setActivePanel('left')
  }

  return {
    // State from store
    currentDraft,
    editorMode,
    isSaving,
    isReel,
    isEditMode,
    chatMessages,
    isChatProcessing,
    activePanel,
    conversationId,
    postId,
    selectedAccountId,
    currentProjectAccounts,

    // Store actions
    setEditorMode: store.setEditorMode,
    updateDraft: store.updateDraft,
    addImage: store.addImage,
    removeImage: store.removeImage,
    updateFrame: store.updateFrame,
    addFrame: store.addFrame,
    removeFrame: store.removeFrame,
    setDuration: store.setDuration,
    clearDraft: store.clearDraft,
    addChatMessage: store.addChatMessage,
    updateChatMessage: store.updateChatMessage,
    appendToChatMessage: store.appendToChatMessage,
    setChatMessageError: store.setChatMessageError,
    updateChatMessageId: store.updateChatMessageId,
    setChatProcessing: store.setChatProcessing,
    setConversationId: store.setConversationId,
    setPostId: store.setPostId,
    loadDraft: store.loadDraft,
    getLastMessage: store.getLastMessage,
    loadChatMessages: store.loadChatMessages,
    setActivePanel: store.setActivePanel,
    selectAccount: store.selectAccount,

    // Composable actions
    startNewContent,
    openExistingContent,
    saveDraft,
    goBackToCalendar,
    createNewDraft,
    copyToDescription,
    appendToDescription,
    goToImagesPanel
  }
}
