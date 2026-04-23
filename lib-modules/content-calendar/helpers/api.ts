import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  SocialAccount,
  SocialNetwork,
  ContentTag,
  CalendarPost,
  InfoEvent,
  PostStatus,
  ContentType,
  SocialAccountDto,
  UpsertSocialAccountRequest,
  PostListItemDto,
  PostMediaType,
  UpsertPostRequest,
  TelegramLinkStartResponse,
  TelegramLinkStatusResponse,
} from '../types'

function toSocialAccount(dto: SocialAccountDto): SocialAccount {
  return {
    id: dto.id,
    network: dto.platform as SocialNetwork,
    name: dto.displayName,
    username: dto.username ?? '',
    avatarUrl: dto.avatarUrl ?? undefined,
  }
}

// ---- Post mapping (UI CalendarPost <-> backend DTO/request) ----

function uiTypeToMediaType(type: ContentType): PostMediaType {
  return type === 'reels' ? 'reel' : type
}

function mediaTypeToUiType(mt: PostMediaType): ContentType {
  return mt === 'reel' ? 'reels' : mt
}

function splitScheduledAt(scheduledAt: string): { date: string; time?: string } {
  // Backend sends ISO `2026-04-23T10:30:00Z`; UI wants YYYY-MM-DD + optional HH:MM.
  const [datePart, rest] = scheduledAt.split('T')
  if (!rest) return { date: datePart }
  const hhmm = rest.slice(0, 5)
  return { date: datePart, time: hhmm === '00:00' ? undefined : hhmm }
}

function buildScheduledAt(date: string, time?: string): string {
  // Always emit ISO UTC. No time => noon to avoid timezone-off-by-one on the server.
  const t = time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : '12:00:00'
  return `${date}T${t}Z`
}

export function toCalendarPost(dto: PostListItemDto): CalendarPost {
  const { date, time } = splitScheduledAt(dto.scheduledAt)
  const images = (dto.media ?? [])
    .filter(m => m.fileType === 'image')
    .map(m => m.asset?.downloadUrl ?? '')
    .filter(Boolean)
  return {
    id: dto.id,
    title: dto.title ?? '',
    content: dto.contentText,
    description: dto.platformContent ?? undefined,
    type: mediaTypeToUiType(dto.mediaType),
    status: dto.status,
    accountId: dto.socialAccount?.id ?? '',
    tags: (dto.tags ?? []).map(t => t.id),
    date,
    time,
    image: images[0],
    images: images.length > 1 ? images : undefined,
  }
}

export function toUpsertPostRequest(post: Omit<CalendarPost, 'id'>): UpsertPostRequest {
  // Backend requires non-empty contentText. Fall back to title so minimal "idea" posts still save.
  const contentText = (post.content?.trim() || post.description?.trim() || post.title?.trim() || '—')
  return {
    socialAccountId: post.accountId,
    title: post.title?.trim() ? post.title : null,
    contentText,
    platformContent: post.description?.trim() ? post.description : null,
    mediaType: uiTypeToMediaType(post.type),
    status: post.status,
    scheduledAt: buildScheduledAt(post.date, post.time),
    tagIds: post.tags ?? [],
  }
}

export function toUpsertPostPartial(updates: Partial<CalendarPost>): Partial<UpsertPostRequest> {
  const out: Partial<UpsertPostRequest> = {}
  if (updates.accountId !== undefined) out.socialAccountId = updates.accountId
  if (updates.title !== undefined) out.title = updates.title || null
  if (updates.content !== undefined) out.contentText = updates.content || ''
  if (updates.description !== undefined) out.platformContent = updates.description || null
  if (updates.type !== undefined) out.mediaType = uiTypeToMediaType(updates.type)
  if (updates.status !== undefined) out.status = updates.status
  if (updates.date !== undefined || updates.time !== undefined) {
    // Need a date to emit scheduledAt; callers updating just time without a date will hit this too.
    if (updates.date) out.scheduledAt = buildScheduledAt(updates.date, updates.time)
  }
  if (updates.tags !== undefined) out.tagIds = updates.tags
  return out
}

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
    const res = await this.api.request(url, RequestMethod.GET) as
      | { items?: SocialAccountDto[] }
      | SocialAccountDto[]
    const items = Array.isArray(res) ? res : (res.items ?? [])
    return items.map(toSocialAccount)
  }

  async createSocialAccount(
    workspaceId: string,
    data: UpsertSocialAccountRequest,
  ): Promise<SocialAccount> {
    const url = buildUrl(ApiAliases.workspaceSocialAccounts, { workspaceId })
    const res = await this.api.request(url, RequestMethod.POST, data) as SocialAccountDto
    return toSocialAccount(res)
  }

  async updateSocialAccount(
    workspaceId: string,
    socialAccountId: string,
    data: Partial<UpsertSocialAccountRequest>,
  ): Promise<SocialAccount> {
    const url = buildUrl(ApiAliases.workspaceSocialAccount, { workspaceId, socialAccountId })
    const res = await this.api.request(url, RequestMethod.PATCH, data) as SocialAccountDto
    return toSocialAccount(res)
  }

  async deleteSocialAccount(workspaceId: string, socialAccountId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceSocialAccount, { workspaceId, socialAccountId })
    await this.api.request(url, RequestMethod.DELETE)
  }

  // Telegram channel linking
  startTelegramLink(workspaceId: string): Promise<TelegramLinkStartResponse> {
    const url = buildUrl(ApiAliases.workspaceTelegramLinkStart, { workspaceId })
    return this.api.request(url, RequestMethod.POST) as Promise<TelegramLinkStartResponse>
  }

  getTelegramLinkStatus(
    workspaceId: string,
    code: string,
  ): Promise<TelegramLinkStatusResponse> {
    const url = buildUrl(ApiAliases.workspaceTelegramLinkStatus, { workspaceId, code })
    return this.api.request(url, RequestMethod.GET) as Promise<TelegramLinkStatusResponse>
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
    const res = await this.api.request(url, RequestMethod.GET) as
      | { items?: PostListItemDto[] }
      | PostListItemDto[]
    const items = Array.isArray(res) ? res : (res.items ?? [])
    return items.map(toCalendarPost)
  }

  async createPost(workspaceId: string, data: Omit<CalendarPost, 'id'>): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePosts, { workspaceId })
    const dto = await this.api.request(url, RequestMethod.POST, toUpsertPostRequest(data)) as PostListItemDto
    return toCalendarPost(dto)
  }

  async updatePost(workspaceId: string, postId: string, data: Partial<CalendarPost>): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePost, { workspaceId, postId })
    const dto = await this.api.request(url, RequestMethod.PATCH, toUpsertPostPartial(data)) as PostListItemDto
    return toCalendarPost(dto)
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
