import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type { PagedResponse, ActivityLogItemDto } from '~/scripts/shared/types/workspace'

export interface GetLogQuery {
  userId?: string
  entityType?: string
  action?: string
  from?: string
  to?: string
  offset?: number
  limit?: number
}

export class WorkspaceActivityLogApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getLog(workspaceId: string, opts: GetLogQuery = {}): Promise<PagedResponse<ActivityLogItemDto>> {
    const url = buildUrl(ApiAliases.workspaceActivityLog, { workspaceId })
    const { offset = 0, limit = 50, ...rest } = opts
    return this.api.request(url, RequestMethod.GET, { ...rest, offset, limit, _t: Date.now() })
  }
}

let instance: WorkspaceActivityLogApiController | null = null
export function useWorkspaceActivityLogApi(): WorkspaceActivityLogApiController {
  if (!instance) instance = new WorkspaceActivityLogApiController()
  return instance
}
