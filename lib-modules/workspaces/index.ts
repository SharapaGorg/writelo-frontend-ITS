/**
 * Workspaces Module
 * Manages workspace context and workspace-related operations.
 * Replaces the old Projects module with workspace-scoped architecture.
 */

// Composables
export { useWorkspaceContext } from './composables/useWorkspaceContext'
export { useWorkspaces } from './composables/useWorkspaces'
export { useWorkspacePermissions } from './composables/useWorkspacePermissions'
export { useWorkspaceLimits } from './composables/useWorkspaceLimits'
export type { WorkspaceContextReturn } from './composables/useWorkspaceContext'
export type { WorkspacePermissions } from './composables/useWorkspacePermissions'

// Store
export { useWorkspacesStore } from './stores/workspacesStore'

// API
export { WorkspacesApiController, useWorkspacesApi } from './helpers/api'

// Components
export { default as BrandBriefSection } from './components/BrandBriefSection.vue'
export { default as NoAccessState } from './components/NoAccessState.vue'
export { default as RoleBadge } from './components/RoleBadge.vue'

// Types
export * from './types'
