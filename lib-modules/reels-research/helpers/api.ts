import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  TrendingReelsFeedResponse,
  TrendingReelDetailsResponse,
  TrendingReelsFeedQuery
} from '../types'

// Composition (not inheritance) to avoid the circular eval that hit other
// per-module controllers — see WorkspacesApiController for the same reason.
export class TrendingReelsApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getGlobalFeed(
    workspaceId: string,
    query: TrendingReelsFeedQuery = {}
  ): Promise<TrendingReelsFeedResponse> {
    const url = buildUrl(ApiAliases.workspaceTrendingReelsGlobal, { workspaceId })
    // Workspace-scoped GETs aren't cache-controlled — bust the browser cache.
    return this.api.request(url, RequestMethod.GET, { ...query, _t: Date.now() })
  }

  getReel(
    workspaceId: string,
    reelId: string
  ): Promise<TrendingReelDetailsResponse> {
    const url = buildUrl(ApiAliases.workspaceTrendingReelsDetail, { workspaceId, reelId })
    return this.api.request(url, RequestMethod.GET, { _t: Date.now() })
  }
}

let instance: TrendingReelsApiController | null = null

export function useTrendingReelsApi(): TrendingReelsApiController {
  if (!instance) {
    instance = new TrendingReelsApiController()
  }
  return instance
}
