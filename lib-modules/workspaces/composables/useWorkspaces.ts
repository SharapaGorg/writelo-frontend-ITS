import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspacesStore } from '../stores/workspacesStore'
import { useWorkspaceContext } from './useWorkspaceContext'
import type { CreateWorkspaceRequest, UpdateWorkspaceRequest } from '../types'

/**
 * Workspaces Composable
 * Provides convenient access to workspace operations and state
 */
export function useWorkspaces() {
  const store = useWorkspacesStore()
  const context = useWorkspaceContext()
  const { workspaces, loading, error } = storeToRefs(store)

  /**
   * Current workspace object
   */
  const currentWorkspace = computed(() => store.currentWorkspace)

  /**
   * Current workspace ID
   */
  const currentWorkspaceId = computed(() => context.currentWorkspaceId.value)

  /**
   * Initialize workspaces (fetch and set context)
   */
  const initialize = async () => {
    await store.fetchWorkspaces()
  }

  /**
   * Create a new workspace
   */
  const createWorkspace = async (data: CreateWorkspaceRequest) => {
    return store.createWorkspace(data)
  }

  /**
   * Update a workspace
   */
  const updateWorkspace = async (workspaceId: string, data: UpdateWorkspaceRequest) => {
    return store.updateWorkspace(workspaceId, data)
  }

  /**
   * Delete a workspace
   */
  const deleteWorkspace = async (workspaceId: string) => {
    return store.deleteWorkspace(workspaceId)
  }

  /**
   * Select a workspace
   */
  const selectWorkspace = (workspaceId: string) => {
    store.selectWorkspace(workspaceId)
  }

  /**
   * Get workspace by ID
   */
  const getWorkspaceById = (id: string) => {
    return store.getById(id)
  }

  const canEditBrandBriefIn = (workspaceId: string) =>
    store.canEditBrandBriefIn(workspaceId)
  const canRenameWorkspaceIn = (workspaceId: string) =>
    store.canRenameWorkspaceIn(workspaceId)
  const canManageSocialAccountsIn = (workspaceId: string) =>
    store.canManageSocialAccountsIn(workspaceId)
  const canDeleteWorkspaceIn = (workspaceId: string) =>
    store.canDeleteWorkspaceIn(workspaceId)

  /**
   * Check if user is owner
   */
  const isOwner = (workspaceId: string) => {
    return store.isOwner(workspaceId)
  }

  /**
   * Clear workspace state (on logout)
   */
  const clear = () => {
    store.clear()
    context.clear()
  }

  return {
    // State
    workspaces,
    loading,
    error,
    currentWorkspace,
    currentWorkspaceId,

    // Actions
    initialize,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    getWorkspaceById,
    canEditBrandBriefIn,
    canRenameWorkspaceIn,
    canManageSocialAccountsIn,
    canDeleteWorkspaceIn,
    isOwner,
    clear,
  }
}
