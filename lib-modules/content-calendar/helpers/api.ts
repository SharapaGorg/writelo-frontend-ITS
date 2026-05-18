import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  FinalizeUploadResponse,
  UpsertPostMediaRequest,
} from '~/scripts/shared/types/workspace'
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
  PostMediaDto,
  PostMediaType,
  UpsertPostRequest,
  SocialAccountLinkStartResponse,
  StartSocialAccountLinkRequest,
  PublishAcceptedResponse,
  PublishReelOptions,
} from '../types'

function toSocialAccount(dto: SocialAccountDto): SocialAccount {
  return {
    id: dto.id,
    network: dto.platform as SocialNetwork,
    name: dto.displayName,
    username: dto.username ?? '',
    avatarUrl: dto.avatarUrl ?? undefined,
    publishCapabilities: dto.publishCapabilities,
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
  const mediaItems = (dto.media ?? [])
    .slice()
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
  const images = mediaItems
    .filter(m => m.fileType === 'image')
    .map(m => m.asset?.url ?? '')
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
    mediaItems,
    publishedLink: dto.postLink ?? undefined,
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
  async getSocialAccounts(workspaceId: string, bustCache = false): Promise<SocialAccount[]> {
    const url = buildUrl(ApiAliases.workspaceSocialAccounts, { workspaceId })
    // bustCache: bypass browser HTTP cache via timestamp query param.
    // Used by polling flows that need to see backend-side mutations on the same URL.
    const data = bustCache ? { _t: Date.now() } : {}
    const res = await this.api.request(url, RequestMethod.GET, data) as
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
    // `silent: true` — backend may return 4xx but still mutate state; callers must
    // verify-by-refetch (see contentProjectStore.unlinkAccount) and we don't want
    // the controller's generic-error toast to fire over their custom UX.
    await this.api.request(url, RequestMethod.DELETE, {}, false, true)
  }

  // Generic social account linking (TG bot deep-link, IG Business Login OAuth, ...).
  startSocialAccountLink(
    workspaceId: string,
    platform: SocialNetwork,
  ): Promise<SocialAccountLinkStartResponse> {
    const url = buildUrl(ApiAliases.workspaceSocialAccountsLink, { workspaceId })
    const body: StartSocialAccountLinkRequest = { platform }
    return this.api.request(url, RequestMethod.POST, body) as Promise<SocialAccountLinkStartResponse>
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

  async getPost(workspaceId: string, postId: string): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePost, { workspaceId, postId })
    const dto = await this.api.request(url, RequestMethod.GET) as PostListItemDto
    return toCalendarPost(dto)
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

  // Generic immediate-publish — backend dispatches per-platform itself, returns updated post.
  async publishPostNow(workspaceId: string, postId: string): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePostPublishNow, { workspaceId, postId })
    const dto = await this.api.request(url, RequestMethod.POST) as PostListItemDto
    return toCalendarPost(dto)
  }

  // Publish dispatcher — routes by platform × mediaType.
  async publishPost(
    workspaceId: string,
    socialAccountId: string,
    postId: string,
    platform: SocialNetwork,
    mediaType: PostMediaType,
    reelOpts?: PublishReelOptions,
  ): Promise<PublishAcceptedResponse> {
    type DispatchEntry = { alias: ApiAliases; body: Record<string, unknown> }

    const entry: DispatchEntry | null = (() => {
      if (platform === 'instagram') {
        if (mediaType === 'post') {
          return { alias: ApiAliases.workspaceInstagramPublishPost, body: { postId } }
        }
        if (mediaType === 'reel') {
          return {
            alias: ApiAliases.workspaceInstagramPublishReel,
            body: {
              postId,
              locationId: reelOpts?.locationId,
              shareToFeed: reelOpts?.shareToFeed,
              coverUrl: reelOpts?.coverUrl,
            },
          }
        }
        if (mediaType === 'story') {
          return { alias: ApiAliases.workspaceInstagramPublishStory, body: { postId } }
        }
      }
      if (platform === 'telegram') {
        if (mediaType === 'post') {
          return { alias: ApiAliases.workspaceTelegramPublishPost, body: { postId } }
        }
        if (mediaType === 'story') {
          return { alias: ApiAliases.workspaceTelegramPublishStory, body: { postId } }
        }
      }
      return null
    })()

    if (!entry) {
      const platformLabel =
        platform === 'vk' ? 'VK' :
        platform === 'youtube' ? 'YouTube' :
        platform
      throw new Error(`Публикация ${mediaType} в ${platformLabel} пока не поддерживается`)
    }

    const url = buildUrl(entry.alias, { workspaceId, socialAccountId })
    return this.api.request(url, RequestMethod.POST, entry.body) as Promise<PublishAcceptedResponse>
  }

  /**
   * Orchestrates init → S3 POST → finalize for post media via the workspace upload pair.
   * Returns the finalized file (with storageObjectId) ready to attach via createPostMedia.
   */
  async uploadPostMedia(
    workspaceId: string,
    file: File,
  ): Promise<FinalizeUploadResponse> {
    const init = await this.api.initUpload(workspaceId, {
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    })

    const formData = new FormData()
    for (const [key, value] of Object.entries(init.formFields)) {
      formData.append(key, value)
    }
    formData.append('file', file)

    const s3Res = await fetch(init.url, { method: 'POST', body: formData })
    if (!s3Res.ok) {
      throw new Error(`S3 upload failed with status ${s3Res.status}`)
    }

    return this.api.finalizeUpload(workspaceId, {
      objectId: init.objectId,
      fileName: file.name,
    })
  }

  createPostMedia(
    workspaceId: string,
    postId: string,
    request: UpsertPostMediaRequest,
  ): Promise<PostMediaDto> {
    const url = buildUrl(ApiAliases.workspacePostMedia, { workspaceId, postId })
    return this.api.request(url, RequestMethod.POST, request) as Promise<PostMediaDto>
  }

  deletePostMedia(workspaceId: string, postId: string, mediaId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspacePostMediaItem, { workspaceId, postId, mediaId })
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
