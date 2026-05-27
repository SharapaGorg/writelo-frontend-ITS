import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type { WorkspaceLimitsDto } from '~/scripts/shared/types/workspace'
import type {
  ShortVideoAnalysisDto,
  ShortVideoAnalysisHistoryItemDto,
  ShortVideoAnalysisShareDto,
} from '../types'

export class VideoAnalyzerApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  // POST /short-video-analyses/run — SSE stream. Backend emits a single
  // `response_end` event we care about; everything else is forward-compat.
  runAnalysis(workspaceId: string, url: string): Promise<ReadableStream<Uint8Array>> {
    const path = buildUrl(ApiAliases.workspaceShortVideoAnalysesRun, { workspaceId })
    return this.api.request(path, RequestMethod.POST, { url }, true)
  }

  // GET /short-video-analyses?url=... — keyed by URL, not analysis id.
  // Returns null on 404 so callers can branch without try/catch.
  async getAnalysisByUrl(workspaceId: string, url: string): Promise<ShortVideoAnalysisDto | null> {
    const path = buildUrl(ApiAliases.workspaceShortVideoAnalyses, { workspaceId })
    try {
      // Pass `silent: true` so a 404 does not toast — we treat it as "not yet".
      return await this.api.request(path, RequestMethod.GET, { url }, false, true)
    } catch (e: any) {
      const status = e?.status || e?.statusCode
      if (status === 404) return null
      throw e
    }
  }

  async getHistory(
    workspaceId: string,
    offset = 0,
    limit = 50,
  ): Promise<ShortVideoAnalysisHistoryItemDto[]> {
    const path = buildUrl(ApiAliases.workspaceShortVideoAnalysesHistory, { workspaceId })
    // Cache-bust: workspace-scoped GETs aren't cache-controlled; polling
    // without `_t` returns stale browser cache.
    const list = await this.api.request(path, RequestMethod.GET, {
      offset,
      limit,
      _t: Date.now(),
    })
    return Array.isArray(list) ? list : []
  }

  async getLimits(workspaceId: string): Promise<WorkspaceLimitsDto> {
    const path = buildUrl(ApiAliases.workspaceLimits, { workspaceId })
    return this.api.request(path, RequestMethod.GET, { _t: Date.now() })
  }

  // POST .../share — idempotent: returns the existing token if already shared.
  // Body is required (`{}`) even though it's empty.
  shareAnalysis(workspaceId: string, analysisId: string): Promise<ShortVideoAnalysisShareDto> {
    const path = buildUrl(ApiAliases.workspaceShortVideoAnalysisShare, { workspaceId, analysisId })
    return this.api.request(path, RequestMethod.POST, {})
  }

  // DELETE .../share — 204 on success, 404 if no active share.
  // Silent so caller can treat 404 (race: already revoked elsewhere) as success.
  unshareAnalysis(workspaceId: string, analysisId: string): Promise<void> {
    const path = buildUrl(ApiAliases.workspaceShortVideoAnalysisShare, { workspaceId, analysisId })
    return this.api.request(path, RequestMethod.DELETE, {}, false, true)
  }

  // Public, anonymous: no workspace, no auth. Returns null on 404 so the
  // public viewer can render a "link no longer available" state without a
  // try/catch at the call site.
  async getSharedAnalysis(token: string): Promise<ShortVideoAnalysisDto | null> {
    const path = buildUrl(ApiAliases.shortVideoAnalysisShared, { token })
    try {
      // silent: don't toast 4xx; noAuth: bypass the "no token → drop request" wall.
      return await this.api.request(path, RequestMethod.GET, { _t: Date.now() }, false, true, true)
    } catch (e: any) {
      const status = e?.status || e?.statusCode
      if (status === 404) return null
      throw e
    }
  }
}

let instance: VideoAnalyzerApiController | null = null

export function useVideoAnalyzerApi(): VideoAnalyzerApiController {
  if (!instance) instance = new VideoAnalyzerApiController()
  return instance
}
