/**
 * Workspaces Module
 * Manages workspace context and workspace-related operations.
 * Replaces the old Projects module with workspace-scoped architecture.
 */

// Composables
export { useWorkspaceContext } from './composables/useWorkspaceContext'
export { useWorkspaces } from './composables/useWorkspaces'
export type { WorkspaceContextReturn } from './composables/useWorkspaceContext'

// Store
export { useWorkspacesStore } from './stores/workspacesStore'

// API
export { WorkspacesApiController, useWorkspacesApi } from './helpers/api'

// Types
export * from './types'
