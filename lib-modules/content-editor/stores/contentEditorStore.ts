import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentDraft, ContentType, EditorMode, ReelFrame, EditorChatMessage } from '../types'
import { generateUUID } from '~/scripts/features/utils'

export const useContentEditorStore = defineStore('contentEditor', () => {
  // State
  const currentDraft = ref<ContentDraft | null>(null)
  const editorMode = ref<EditorMode>('chat')
  const isSaving = ref(false)
  const originalDraft = ref<ContentDraft | null>(null)
  const chatMessages = ref<EditorChatMessage[]>([])
  const isChatProcessing = ref(false)

  // Getters
  const isReel = computed(() => currentDraft.value?.type === 'reel')

  const hasUnsavedChanges = computed(() => {
    if (!currentDraft.value || !originalDraft.value) return false
    return JSON.stringify(currentDraft.value) !== JSON.stringify(originalDraft.value)
  })

  // Actions
  const createNewDraft = (type: ContentType, accountId: string): ContentDraft => {
    const draft: ContentDraft = {
      id: generateUUID(),
      type,
      accountId,
      title: '',
      description: '',
      hashtags: [],
      images: [],
      scheduledDate: null,
      status: 'draft',
      script: type === 'reel' ? { duration: 0, frames: [] } : undefined
    }

    currentDraft.value = draft
    originalDraft.value = JSON.parse(JSON.stringify(draft))
    chatMessages.value = []

    return draft
  }

  const setEditorMode = (mode: EditorMode) => {
    editorMode.value = mode
  }

  const updateDraft = (updates: Partial<ContentDraft>) => {
    if (!currentDraft.value) return
    currentDraft.value = { ...currentDraft.value, ...updates }
  }

  const addImage = (imageUrl: string) => {
    if (!currentDraft.value) return
    currentDraft.value.images = [...currentDraft.value.images, imageUrl]
  }

  const removeImage = (index: number) => {
    if (!currentDraft.value) return
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

  const updateChatMessage = (id: string, text: string) => {
    const index = chatMessages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      chatMessages.value[index] = {
        ...chatMessages.value[index],
        text,
        processing: false
      }
    }
  }

  const setChatProcessing = (value: boolean) => {
    isChatProcessing.value = value
  }

  return {
    // State
    currentDraft: computed(() => currentDraft.value),
    editorMode: computed(() => editorMode.value),
    isSaving: computed(() => isSaving.value),
    chatMessages: computed(() => chatMessages.value),
    isChatProcessing: computed(() => isChatProcessing.value),

    // Getters
    isReel,
    hasUnsavedChanges,

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
    setChatProcessing
  }
})
