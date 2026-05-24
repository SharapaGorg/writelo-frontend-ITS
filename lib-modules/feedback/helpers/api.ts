import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type { CreateFeedbackRequest, FeedbackDto } from '../types'

export class FeedbackApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  createFeedback(payload: CreateFeedbackRequest): Promise<FeedbackDto> {
    const path = buildUrl(ApiAliases.feedback, {})
    return this.api.request(path, RequestMethod.POST, payload)
  }
}

let instance: FeedbackApiController | null = null

export function useFeedbackApi(): FeedbackApiController {
  if (!instance) instance = new FeedbackApiController()
  return instance
}
