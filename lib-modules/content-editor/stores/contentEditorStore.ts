import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentDraft, ContentType, ContentStatus, DraftImage, EditorMode, ReelFrame, EditorChatMessage } from '../types'
import { generateUUID } from '~/scripts/features/utils'

function revokeBlobUrl(url: string | undefined) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export type ActivePanel = 'left' | 'right'

export const useContentEditorStore = defineStore('contentEditor', () => {
  // State
  const currentDraft = ref<ContentDraft | null>(null)
  const editorMode = ref<EditorMode>('chat')
  const isSaving = ref(false)
  const originalDraft = ref<ContentDraft | null>(null)
  const chatMessages = ref<EditorChatMessage[]>([])
  const isChatProcessing = ref(false)
  const activePanel = ref<ActivePanel>('right')
  const conversationId = ref<string | null>(null)
  const postId = ref<string | null>(null)
  const selectedAccountId = ref<string | null>(null)

  // Getters
  const isReel = computed(() => currentDraft.value?.type === 'reel')
  const isEditMode = computed(() => postId.value !== null)

  // Actions
  const createNewDraft = (type: ContentType, accountId: string): ContentDraft => {
    // Default to today's date/time in local timezone (datetime-local format)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const defaultDate = `${year}-${month}-${day}T${hours}:${minutes}`

    const draft: ContentDraft = {
      id: generateUUID(),
      type,
      accountId,
      title: '',
      description: '',
      hashtags: [],
      images: [],
      scheduledDate: defaultDate,
      status: 'idea',
      script: type === 'reel' ? { duration: 0, frames: [] } : undefined
    }

    currentDraft.value = draft
    originalDraft.value = JSON.parse(JSON.stringify(draft))
    chatMessages.value = []
    selectedAccountId.value = accountId

    return draft
  }

  const setEditorMode = (mode: EditorMode) => {
    editorMode.value = mode
  }

  const updateDraft = (updates: Partial<ContentDraft>) => {
    if (!currentDraft.value) return
    currentDraft.value = { ...currentDraft.value, ...updates }
  }

  const addImage = (image: DraftImage) => {
    if (!currentDraft.value) return
    currentDraft.value.images = [...currentDraft.value.images, image]
  }

  const removeImage = (index: number) => {
    if (!currentDraft.value) return
    const removed = currentDraft.value.images[index]
    // Only safe to revoke if the blob isn't referenced elsewhere (originalDraft clone
    // drops File refs but keeps previewUrl strings). We rely on the fact that local
    // unsaved items never appear in originalDraft.
    if (removed && !removed.mediaId) {
      revokeBlobUrl(removed.previewUrl)
    }
    currentDraft.value.images = currentDraft.value.images.filter((_, i) => i !== index)
  }

  const updateFrame = (index: number, frame: Partial<ReelFrame>) => {
    if (!currentDraft.value?.script) return
    const frames = [...currentDraft.value.script.frames]
    frames[index] = { ...frames[index], ...frame }
    currentDraft.value.script.frames = frames
  }

  const addFrame = (frame: ReelFrame) => {
    if (!currentDraft.value?.script) return
    currentDraft.value.script.frames = [...currentDraft.value.script.frames, frame]
  }

  const removeFrame = (index: number) => {
    if (!currentDraft.value?.script) return
    currentDraft.value.script.frames = currentDraft.value.script.frames.filter((_, i) => i !== index)
  }

  const setDuration = (duration: number) => {
    if (!currentDraft.value?.script) return
    currentDraft.value.script.duration = duration
  }

  const clearDraft = () => {
    currentDraft.value = null
    originalDraft.value = null
    chatMessages.value = []
  }

  const markAsSaved = () => {
    if (currentDraft.value) {
      originalDraft.value = JSON.parse(JSON.stringify(currentDraft.value))
    }
  }

  // Chat message actions
  const addChatMessage = (role: 'user' | 'assistant', text: string): string => {
    const id = generateUUID()
    const message: EditorChatMessage = {
      id,
      role,
      text,
      createdAt: new Date().toISOString(),
      processing: role === 'assistant' && !text.length
    }
    chatMessages.value = [...chatMessages.value, message]
    return id
  }

  const updateChatMessage = (id: string | number, text: string) => {
    const index = chatMessages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      chatMessages.value[index] = {
        ...chatMessages.value[index],
        text,
        processing: false
      }
    }
  }

  const appendToChatMessage = (id: string | number, text: string) => {
    const index = chatMessages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const messages = [...chatMessages.value]
      messages[index] = { ...messages[index], text: messages[index].text + text }
      chatMessages.value = messages
    }
  }

  const setChatMessageError = (id: string | number, error: boolean) => {
    const index = chatMessages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const messages = [...chatMessages.value]
      messages[index] = { ...messages[index], error, processing: false }
      chatMessages.value = messages
    }
  }

  const updateChatMessageId = (oldId: string | number, newId: string | number) => {
    const index = chatMessages.value.findIndex(m => m.id === oldId)
    if (index !== -1) {
      const messages = [...chatMessages.value]
      messages[index] = { ...messages[index], id: newId }
      chatMessages.value = messages
    }
  }

  const setChatProcessing = (value: boolean) => {
    isChatProcessing.value = value
  }

  const setConversationId = (id: string | null) => {
    conversationId.value = id
  }

  const setPostId = (id: string | null) => {
    postId.value = id
  }

  const selectAccount = (accountId: string) => {
    selectedAccountId.value = accountId
    // Also update the draft if it exists
    if (currentDraft.value) {
      currentDraft.value = { ...currentDraft.value, accountId }
    }
  }

  const loadDraft = (post: {
    id: string
    type: ContentType
    accountId: string
    title: string
    description?: string
    images?: DraftImage[]
    scheduledDate?: string | null
    status?: ContentStatus
  }) => {
    currentDraft.value = {
      id: post.id,
      type: post.type,
      accountId: post.accountId,
      title: post.title,
      description: post.description || '',
      hashtags: [],
      images: post.images ?? [],
      scheduledDate: post.scheduledDate || null,
      status: post.status || 'idea',
      script: post.type === 'reel' ? { duration: 0, frames: [] } : undefined
    }
    originalDraft.value = JSON.parse(JSON.stringify(currentDraft.value))
    selectedAccountId.value = post.accountId
  }

  const getLastMessage = () => {
    return chatMessages.value[chatMessages.value.length - 1]
  }

  // Load messages from API response (converts Role enum to string)
  const loadChatMessages = (messages: Array<{ id: number | string, role: number, text: string, createdAt?: string }>) => {
    chatMessages.value = messages.map(msg => ({
      id: msg.id,
      role: msg.role === 0 ? 'assistant' : 'user' as 'user' | 'assistant',
      text: msg.text,
      createdAt: msg.createdAt || new Date().toISOString(),
      processing: false
    }))
  }

  const setActivePanel = (panel: ActivePanel) => {
    activePanel.value = panel
  }

  const setIsSaving = (value: boolean) => {
    isSaving.value = value
  }

  return {
    // State
    currentDraft: computed(() => currentDraft.value),
    editorMode: computed(() => editorMode.value),
    isSaving: computed(() => isSaving.value),
    chatMessages: computed(() => chatMessages.value),
    isChatProcessing: computed(() => isChatProcessing.value),
    activePanel: computed(() => activePanel.value),
    conversationId: computed(() => conversationId.value),
    postId: computed(() => postId.value),
    selectedAccountId: computed(() => selectedAccountId.value),

    // Raw refs (read-only consumers: use currentDraft / originalDraftSnapshot)
    originalDraftSnapshot: computed(() => originalDraft.value),

    // Getters
    isReel,
    isEditMode,

    // Actions
    createNewDraft,
    setEditorMode,
    updateDraft,
    addImage,
    removeImage,
    updateFrame,
    addFrame,
    removeFrame,
    setDuration,
    clearDraft,
    markAsSaved,
    addChatMessage,
    updateChatMessage,
    appendToChatMessage,
    setChatMessageError,
    updateChatMessageId,
    setChatProcessing,
    setConversationId,
    setPostId,
    selectAccount,
    loadDraft,
    getLastMessage,
    loadChatMessages,
    setActivePanel,
    setIsSaving
  }
})
