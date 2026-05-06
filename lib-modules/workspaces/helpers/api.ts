import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  WorkspaceDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  PagedResponse,
  WorkspaceLimitsDto,
} from '~/scripts/shared/types/workspace'

/**
 * Workspaces API Controller
 * Uses composition (not inheritance) to avoid circular eval with ApiController —
 * class extension resolves at module eval time; composition defers to runtime.
 */
export class WorkspacesApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getWorkspaces(): Promise<PagedResponse<WorkspaceDto>> {
    return this.api.request(ApiAliases.workspaces, RequestMethod.GET)
  }

  getWorkspace(workspaceId: string): Promise<WorkspaceDto> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.api.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.GET)
  }

  createWorkspace(data: CreateWorkspaceRequest): Promise<WorkspaceDto> {
    return this.api.request(ApiAliases.workspaces, RequestMethod.POST, data)
  }

  updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest): Promise<WorkspaceDto> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.api.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.PATCH, data)
  }

  deleteWorkspace(workspaceId: string): Promise<void> {
    const url = buildUrl('{workspaceId}', { workspaceId })
    return this.api.request(`${ApiAliases.workspaces}/${url}`, RequestMethod.DELETE)
  }

  getLimits(workspaceId: string): Promise<WorkspaceLimitsDto> {
    const path = buildUrl(ApiAliases.workspaceLimits, { workspaceId })
    // Cache-bust: workspace-scoped GETs aren't cache-controlled.
    return this.api.request(path, RequestMethod.GET, { _t: Date.now() })
  }
}

let instance: WorkspacesApiController | null = null

export function useWorkspacesApi(): WorkspacesApiController {
  if (!instance) {
    instance = new WorkspacesApiController()
  }
  return instance
}
