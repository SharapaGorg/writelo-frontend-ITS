import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type { SubmitFeedbackPayload } from '../types'

export class FeedbackApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  submitFeedback(workspaceId: string, payload: SubmitFeedbackPayload): Promise<unknown> {
    const path = buildUrl(ApiAliases.workspaceFeedback, { workspaceId })
    return this.api.request(path, RequestMethod.POST, payload)
  }
}

let instance: FeedbackApiController | null = null

export function useFeedbackApi(): FeedbackApiController {
  if (!instance) instance = new FeedbackApiController()
  return instance
}
