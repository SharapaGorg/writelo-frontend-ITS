<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  PostPreviewPanel,
  useContentEditor
} from '~/lib-modules/content-editor'
import type { ContentType as EditorContentType, DraftImage } from '~/lib-modules/content-editor'
import { useContentProjectStore } from '~/lib-modules/content-calendar'
import type { CalendarPost } from '~/lib-modules/content-calendar'
import { ApiController } from '~/scripts/shared/api/controller'
import { useWorkspaceContext, useWorkspaces } from '~/lib-modules/workspaces'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const router = useRouter()
const apiController = new ApiController()
const {
  currentDraft,
  createNewDraft,
  editorMode,
  conversationId,
  setConversationId,
  loadChatMessages,
  loadDraft,
  setPostId
} = useContentEditor()

const projectStore = useContentProjectStore()
const { currentProjectAccounts } = storeToRefs(projectStore)

function toEditorDraftInput(post: CalendarPost) {
  const type: EditorContentType =
    post.type === 'reels' ? 'reel' : post.type === 'article' ? 'post' : post.type
  const scheduledDate = post.time ? `${post.date}T${post.time}` : post.date

  let images: DraftImage[]
  if (post.mediaItems && post.mediaItems.length > 0) {
    images = post.mediaItems
      .map((m): DraftImage | null => {
        const url = m.asset?.downloadUrl
        if (!url) return null
        return {
          previewUrl: url,
          fileType: m.fileType,
          mediaId: m.id,
          storageObjectId: m.storageObjectId,
        }
      })
      .filter((x): x is DraftImage => x !== null)
  } else {
    // Demo data and legacy fallback: URLs without backend media metadata.
    const urls = post.images ?? (post.image ? [post.image] : [])
    images = urls.map(url => ({ previewUrl: url, fileType: 'image' }))
  }

  return {
    id: post.id,
    type,
    accountId: post.accountId,
    title: post.title,
    description: post.content ?? post.description ?? '',
    images,
    scheduledDate,
    status: post.status,
  }
}

onMounted(async () => {
  // Ensure workspace context is initialized. On hard reload of /app/editor/{id}
  // nothing else kicks off the workspaces fetch (the calendar page does it in
  // its own onMounted), so requireWorkspaceId() would otherwise throw.
  const { initialize, workspaces, currentWorkspaceId } = useWorkspaces()
  if (workspaces.value.length === 0) {
    await initialize()
  }
  if (!currentWorkspaceId.value) {
    router.replace('/app/workspaces')
    return
  }

  const postId = route.params.postId as string | undefined
  const chatId = route.query.chat as string | undefined

  if (postId) {
    const { requireWorkspaceId } = useWorkspaceContext()
    const workspaceId = requireWorkspaceId()
    let post = projectStore.currentProject?.posts.find(p => p.id === postId)
    if (!post) {
      await projectStore.fetchProjectData(workspaceId)
      post = projectStore.currentProject?.posts.find(p => p.id === postId)
    }
    if (post) {
      loadDraft(toEditorDraftInput(post))
      setPostId(postId)
    } else {
      router.replace('/app/calendar')
      return
    }
  } else if (!currentDraft.value) {
    const defaultAccountId = currentProjectAccounts.value[0]?.id || ''
    createNewDraft('post', defaultAccountId)
  }

  // Load existing chat if chat ID in URL
  if (chatId && chatId !== conversationId.value) {
    try {
      const {requireWorkspaceId} = useWorkspaceContext()
      const conversation = await apiController.getWorkspaceConversation(requireWorkspaceId(), chatId)
      if (conversation?.messages?.length) {
        setConversationId(chatId)
        loadChatMessages(conversation.messages.map(m => ({
          id: m.id,
          role: m.role === 'assistant' ? 0 : 1,
          text: m.text ?? '',
          createdAt: m.createdAt,
        })))
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
      // Remove invalid chat ID from URL
      router.replace({ query: { ...route.query, chat: undefined } })
    }
  }
})
</script>

<template>
  <ContentEditorLayout>
    <template #left-panel>
      <EditorChatPanel v-if="editorMode === 'chat'" />
      <EditorImagesPanel v-else />
    </template>

    <template #right-panel>
      <PostPreviewPanel />
    </template>
  </ContentEditorLayout>
</template>
