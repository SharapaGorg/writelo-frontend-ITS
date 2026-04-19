/**
 * Workspaces module types
 * Re-exports workspace-related types from shared types
 */

export type {
  WorkspaceDto,
  WorkspaceRole,
  WorkspaceInviteRole,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  PagedResponse,
} from '~/scripts/shared/types/workspace'

// Module-specific types
export interface WorkspacesState {
  workspaces: WorkspaceDto[]
  currentWorkspaceId: string | null
  loading: boolean
  error: string | null
}

export interface WorkspacesApiControllerInterface {
  getWorkspaces(): Promise<PagedResponse<WorkspaceDto>>
  getWorkspace(id: string): Promise<WorkspaceDto>
  createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceDto>
  updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<WorkspaceDto>
  deleteWorkspace(id: string): Promise<void>
}

// Import types for local use
import type { WorkspaceDto, PagedResponse } from '~/scripts/shared/types/workspace'
