/**
 * Workspace Context Composable
 * Provides the current workspace ID throughout the application.
 * This is a singleton composable that maintains workspace context.
 */

import { ref, computed, readonly } from 'vue'
import type { WorkspaceDto } from '../types'

// Singleton state
const currentWorkspaceId = ref<string | null>(null)
const workspaces = ref<WorkspaceDto[]>([])
const isInitialized = ref(false)

/**
 * Get the current workspace context
 * This composable provides access to the current workspace ID
 * which is required for all workspace-scoped API calls.
 */
export function useWorkspaceContext() {
  /**
   * Set the current workspace ID
   */
  const setCurrentWorkspace = (workspaceId: string | null) => {
    currentWorkspaceId.value = workspaceId
  }

  /**
   * Set the list of available workspaces
   */
  const setWorkspaces = (list: WorkspaceDto[]) => {
    workspaces.value = list
  }

  /**
   * Initialize workspace context
   * Should be called after login with user's primaryWorkspaceId
   */
  const initialize = (primaryWorkspaceId: string | null, workspaceList: WorkspaceDto[] = []) => {
    workspaces.value = workspaceList

    // Use primary workspace or first available
    if (primaryWorkspaceId) {
      currentWorkspaceId.value = primaryWorkspaceId
    } else if (workspaceList.length > 0) {
      currentWorkspaceId.value = workspaceList[0].id
    }

    isInitialized.value = true
  }

  /**
   * Clear workspace context (on logout)
   */
  const clear = () => {
    currentWorkspaceId.value = null
    workspaces.value = []
    isInitialized.value = false
  }

  /**
   * Get workspace by ID
   */
  const getWorkspaceById = (id: string): WorkspaceDto | undefined => {
    return workspaces.value.find(w => w.id === id)
  }

  /**
   * Current workspace object
   */
  const currentWorkspace = computed(() => {
    if (!currentWorkspaceId.value) return null
    return workspaces.value.find(w => w.id === currentWorkspaceId.value) || null
  })

  /**
   * Check if workspace context is ready
   */
  const isReady = computed(() => {
    return isInitialized.value && currentWorkspaceId.value !== null
  })

  /**
   * Get current workspace ID or throw if not set
   * Use this in API calls that require workspace context
   */
  const requireWorkspaceId = (): string => {
    if (!currentWorkspaceId.value) {
      throw new Error('Workspace context not initialized. Please select a workspace.')
    }
    return currentWorkspaceId.value
  }

  return {
    // State (readonly)
    currentWorkspaceId: readonly(currentWorkspaceId),
    workspaces: readonly(workspaces),
    isInitialized: readonly(isInitialized),

    // Computed
    currentWorkspace,
    isReady,

    // Actions
    setCurrentWorkspace,
    setWorkspaces,
    initialize,
    clear,
    getWorkspaceById,
    requireWorkspaceId,
  }
}

// Export type for the composable return value
export type WorkspaceContextReturn = ReturnType<typeof useWorkspaceContext>
