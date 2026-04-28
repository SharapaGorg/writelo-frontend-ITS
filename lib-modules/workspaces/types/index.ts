/**
 * Workspaces module types
 * Re-exports workspace-related types from shared types
 */

import type {
  WorkspaceDto,
  WorkspaceRole,
  WorkspaceInviteRole,
  WorkspaceMemberDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  PagedResponse,
} from '~/scripts/shared/types/workspace'

export type {
  WorkspaceDto,
  WorkspaceRole,
  WorkspaceInviteRole,
  WorkspaceMemberDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  PagedResponse,
}

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
