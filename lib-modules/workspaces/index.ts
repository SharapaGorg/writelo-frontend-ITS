/**
 * Workspaces Module
 * Manages workspace context and workspace-related operations.
 * Replaces the old Projects module with workspace-scoped architecture.
 */

// Components
// NOTE: WorkspaceCreateWindow is NOT re-exported here to avoid a module-eval cycle:
// barrel → WorkspaceCreateWindow → demo-mode → conversations → stores/conversations
// (top-level `new ApiController()`) while ApiController is mid-load.
// Import it directly from './components/WorkspaceCreateWindow.vue' where needed.

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
