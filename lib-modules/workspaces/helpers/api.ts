import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  WorkspaceDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  PagedResponse,
} from '~/scripts/shared/types/workspace'

/**
 * Workspaces API Controller
 * Handles all workspace-related API endpoints
 */
export class WorkspacesApiController extends ApiController {
  constructor() {
    super()
  }

  /**
   * Get all workspaces for current user
   */
  getWorkspaces(): Promise<PagedResponse<WorkspaceDto>> {
    return this.request(ApiAliases.workspaces, RequestMethod.GET)
  }

  /**
   * Get a specific workspace by ID
   */
  getWorkspace(workspaceId: string): Promise<WorkspaceDto> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.GET)
  }

  /**
   * Create a new workspace
   */
  createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceDto> {
    return this.request(ApiAliases.workspaces, RequestMethod.POST, data)
  }

  /**
   * Update a workspace
   */
  updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest): Promise<WorkspaceDto> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.PATCH, data)
  }

  /**
   * Delete a workspace
   */
  deleteWorkspace(workspaceId: string): Promise<void> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.DELETE)
  }
}

// Singleton instance
let instance: WorkspacesApiController | null = null

export function useWorkspacesApi(): WorkspacesApiController {
  if (!instance) {
    instance = new WorkspacesApiController()
  }
  return instance
}
