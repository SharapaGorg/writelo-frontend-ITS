import { storeToRefs } from 'pinia'
import { useContentEditorStore } from '../stores/contentEditorStore'
import type { ContentType } from '../types'

export const useContentEditor = () => {
  const store = useContentEditorStore()
  const {
    currentDraft,
    editorMode,
    isSaving,
    isReel,
    hasUnsavedChanges,
    chatMessages,
    isChatProcessing,
    activePanel
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

  /**
   * Save draft via API (placeholder for now)
   */
  const saveDraft = async () => {
    if (!currentDraft.value) return

    // TODO: Implement actual API call
    console.log('Saving draft:', currentDraft.value)

    // Mark as saved after successful save
    store.markAsSaved()
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
    hasUnsavedChanges,
    chatMessages,
    isChatProcessing,
    activePanel,

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
    setChatProcessing: store.setChatProcessing,
    setActivePanel: store.setActivePanel,

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
