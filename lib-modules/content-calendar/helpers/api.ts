import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  SocialAccount,
  ContentTag,
  CalendarPost,
  InfoEvent,
  PostStatus,
  ContentType,
} from '../types'

/**
 * Content-calendar API controller (composition over inheritance to avoid
 * module-eval cycles with ApiController — see lib-modules/workspaces/helpers/api.ts).
 */
export class ContentCalendarApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  // Social accounts
  async getSocialAccounts(workspaceId: string): Promise<SocialAccount[]> {
    const url = buildUrl(ApiAliases.workspaceSocialAccounts, { workspaceId })
    const res = await this.api.request(url, RequestMethod.GET) as { items?: SocialAccount[] } | SocialAccount[]
    return Array.isArray(res) ? res : (res.items ?? [])
  }

  // Tags
  async getTags(workspaceId: string): Promise<ContentTag[]> {
    const url = buildUrl(ApiAliases.workspaceTags, { workspaceId })
    const res = await this.api.request(url, RequestMethod.GET) as { items?: ContentTag[] } | ContentTag[]
    return Array.isArray(res) ? res : (res.items ?? [])
  }

  createTag(workspaceId: string, data: { name: string; color: string }): Promise<ContentTag> {
    const url = buildUrl(ApiAliases.workspaceTags, { workspaceId })
    return this.api.request(url, RequestMethod.POST, data)
  }

  // Posts
  async getPosts(workspaceId: string): Promise<CalendarPost[]> {
    const url = buildUrl(ApiAliases.workspacePosts, { workspaceId })
    const res = await this.api.request(url, RequestMethod.GET) as { items?: CalendarPost[] } | CalendarPost[]
    return Array.isArray(res) ? res : (res.items ?? [])
  }

  createPost(workspaceId: string, data: Omit<CalendarPost, 'id'>): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePosts, { workspaceId })
    return this.api.request(url, RequestMethod.POST, data)
  }

  updatePost(workspaceId: string, postId: string, data: Partial<CalendarPost>): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePost, { workspaceId, postId })
    return this.api.request(url, RequestMethod.PATCH, data)
  }

  deletePost(workspaceId: string, postId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspacePost, { workspaceId, postId })
    return this.api.request(url, RequestMethod.DELETE)
  }

  // Calendar events (info events / holidays / fun days)
  async getCalendarEvents(workspaceId: string): Promise<InfoEvent[]> {
    const url = buildUrl(ApiAliases.workspaceCalendarEvents, { workspaceId })
    const res = await this.api.request(url, RequestMethod.GET) as { items?: InfoEvent[] } | InfoEvent[]
    return Array.isArray(res) ? res : (res.items ?? [])
  }
}

let instance: ContentCalendarApiController | null = null

export function useContentCalendarApi(): ContentCalendarApiController {
  if (!instance) {
    instance = new ContentCalendarApiController()
  }
  return instance
}
