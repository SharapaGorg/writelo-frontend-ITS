import { defineStore } from 'pinia'
import { useWorkspacesApi } from '../helpers/api'
import { useWorkspaceContext } from '../composables/useWorkspaceContext'
import type { WorkspaceDto, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '../types'

interface WorkspacesState {
  workspaces: WorkspaceDto[]
  loading: boolean
  error: string | null
}

export const useWorkspacesStore = defineStore('workspaces', {
  state: (): WorkspacesState => ({
    workspaces: [],
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get workspace by ID
     */
    getById: (state) => (id: string): WorkspaceDto | undefined => {
      return state.workspaces.find(w => w.id === id)
    },

    /**
     * Get current workspace from context
     */
    currentWorkspace(): WorkspaceDto | null {
      const context = useWorkspaceContext()
      if (!context.currentWorkspaceId.value) return null
      return this.workspaces.find(w => w.id === context.currentWorkspaceId.value) || null
    },

    /**
     * Check if user is owner of a workspace
     */
    isOwner: (state) => (workspaceId: string): boolean => {
      const workspace = state.workspaces.find(w => w.id === workspaceId)
      return workspace?.role === 'owner'
    },

    /**
     * Check if user can edit workspace
     */
    canEdit: (state) => (workspaceId: string): boolean => {
      const workspace = state.workspaces.find(w => w.id === workspaceId)
      return workspace?.role === 'owner' || workspace?.role === 'admin'
    },

    /**
     * Per-workspace permission: can the current user edit the brand brief
     * (industry / business description / target audience / tone / etc.)?
     */
    canEditBrandBriefIn: (state) => (workspaceId: string): boolean => {
      const w = state.workspaces.find(w => w.id === workspaceId)
      if (!w) return false
      return w.role === 'editor' || w.role === 'admin' || w.role === 'owner'
    },

    /**
     * Per-workspace permission: can the current user rename the workspace?
     */
    canRenameWorkspaceIn: (state) => (workspaceId: string): boolean => {
      const w = state.workspaces.find(w => w.id === workspaceId)
      if (!w) return false
      return w.role === 'admin' || w.role === 'owner'
    },

    /**
     * Per-workspace permission: can the current user delete the workspace?
     */
    canDeleteWorkspaceIn: (state) => (workspaceId: string): boolean => {
      const w = state.workspaces.find(w => w.id === workspaceId)
      return w?.role === 'owner'
    },
  },

  actions: {
    /**
     * Fetch all workspaces for current user
     */
    async fetchWorkspaces(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const api = useWorkspacesApi()
        const response = await api.getWorkspaces()
        this.workspaces = response.items

        // Initialize workspace context with fetched workspaces
        const context = useWorkspaceContext()
        context.setWorkspaces(response.items)

        // If no current workspace selected, select first one
        if (!context.currentWorkspaceId.value && response.items.length > 0) {
          context.setCurrentWorkspace(response.items[0].id)
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch workspaces'
        console.error('[WorkspacesStore] fetchWorkspaces error:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new workspace
     */
    async createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceDto | null> {
      this.loading = true
      this.error = null

      try {
        const api = useWorkspacesApi()
        const workspace = await api.createWorkspace(data)
        this.workspaces.push(workspace)

        // Update context
        const context = useWorkspaceContext()
        context.setWorkspaces(this.workspaces)

        return workspace
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create workspace'
        console.error('[WorkspacesStore] createWorkspace error:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a workspace
     */
    async updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest): Promise<WorkspaceDto | null> {
      this.loading = true
      this.error = null

      try {
        const api = useWorkspacesApi()
        const workspace = await api.updateWorkspace(workspaceId, data)

        // Update in local state
        const index = this.workspaces.findIndex(w => w.id === workspaceId)
        if (index !== -1) {
          this.workspaces[index] = workspace
        }

        // Update context
        const context = useWorkspaceContext()
        context.setWorkspaces(this.workspaces)

        return workspace
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update workspace'
        console.error('[WorkspacesStore] updateWorkspace error:', err)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a workspace
     */
    async deleteWorkspace(workspaceId: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const api = useWorkspacesApi()
        await api.deleteWorkspace(workspaceId)

        // Remove from local state
        this.workspaces = this.workspaces.filter(w => w.id !== workspaceId)

        // Update context
        const context = useWorkspaceContext()
        context.setWorkspaces(this.workspaces)

        // If deleted workspace was current, select another
        if (context.currentWorkspaceId.value === workspaceId) {
          const newCurrent = this.workspaces.length > 0 ? this.workspaces[0].id : null
          context.setCurrentWorkspace(newCurrent)
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete workspace'
        console.error('[WorkspacesStore] deleteWorkspace error:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Select a workspace (update context)
     */
    selectWorkspace(workspaceId: string): void {
      const workspace = this.workspaces.find(w => w.id === workspaceId)
      if (workspace) {
        const context = useWorkspaceContext()
        context.setCurrentWorkspace(workspaceId)
      }
    },

    /**
     * Clear store state (on logout)
     */
    clear(): void {
      this.workspaces = []
      this.loading = false
      this.error = null
    },
  },
})
