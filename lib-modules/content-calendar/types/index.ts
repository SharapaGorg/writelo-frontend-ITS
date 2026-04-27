export type ContentType = 'post' | 'story' | 'reels' | 'article'

export type SocialNetwork = 'vk' | 'youtube' | 'telegram' | 'instagram'

export type PostStatus = 'idea' | 'draft' | 'ready' | 'publishing' | 'published' | 'failed'

export interface SocialAccount {
  id: string
  network: SocialNetwork
  name: string
  username: string
  avatarUrl?: string
  // Backend-declared content types this account can publish
  // (values from PostContentType: 'post' | 'story' | 'reel' | 'article').
  publishCapabilities?: string[]
}

export type SocialAccountType = 'personal' | 'business' | 'channel' | 'group'
export type SocialConnectionStatus = 'active' | 'expired' | 'revoked' | 'error'

export interface SocialAccountDto {
  id: string
  platform: string
  platformAccountId: string
  accountType: SocialAccountType
  authType: string
  username: string | null
  displayName: string
  avatarUrl: string | null
  publishCapabilities: string[]
  connectionStatus: SocialConnectionStatus
  connectedAt: string
  lastSyncAt: string | null
  lastError: string | null
  tokenExpiresAt: string | null
}

export interface UpsertSocialAccountRequest {
  platform: SocialNetwork
  platformAccountId: string
  accountType: SocialAccountType
  authType: string
  displayName: string
  username?: string | null
  avatarUrl?: string | null
  publishCapabilities?: string[]
  connectionStatus?: SocialConnectionStatus
  accessToken?: string
  refreshToken?: string
}

// ---- Social account linking (API 26.04) ----

export interface StartSocialAccountLinkRequest {
  platform: SocialNetwork
}

export interface SocialAccountLinkStartResponse {
  url: string
}

export interface ContentTag {
  id: string
  name: string
  color: string // Tailwind color class like 'bg-emerald-500'
}

export interface SocialPreviewData {
  text: string
  image?: string
  likes?: number
  comments?: number
  shares?: number
  views?: number
}

// ---- Backend DTOs (see docs/v1-23.04.json: PostListItemDto, UpsertPostRequest) ----

export type PostMediaType = 'post' | 'story' | 'reel' | 'article'

export interface PostTagDto {
  id: string
  name: string
  color?: string | null
}

export interface PostSocialAccountSummaryDto {
  id: string
  platform?: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

export interface PostMediaDto {
  id: string
  storageObjectId: string
  thumbnailObjectId?: string | null
  fileType: 'image' | 'video'
  sortOrder: number | string
  asset?: { downloadUrl?: string } | null
  thumbnail?: { downloadUrl?: string } | null
}

export interface PostListItemDto {
  id: string
  workspaceId: string
  title: string | null
  contentText: string
  platformContent: string | null
  mediaType: PostMediaType
  status: PostStatus
  scheduledAt: string
  publishedAt: string | null
  socialAccount: PostSocialAccountSummaryDto
  tags?: PostTagDto[]
  media?: PostMediaDto[]
  createdAt?: string
  updatedAt?: string
}

export interface UpsertPostRequest {
  socialAccountId: string
  title: string | null
  contentText: string
  platformContent: string | null
  mediaType: PostMediaType
  status: PostStatus
  scheduledAt: string
  tagIds?: string[]
}

export interface CalendarPost {
  id: string
  title: string
  description?: string
  content?: string // Full post text content
  type: ContentType
  status: PostStatus
  accountId: string // Single social account ID this post belongs to
  tags: string[] // Tag IDs
  date: string // 'YYYY-MM-DD'
  time?: string // 'HH:MM' (optional)
  image?: string // Single image (legacy)
  images?: string[] // Multiple images (up to 10) — download URLs for calendar thumbs
  mediaItems?: PostMediaDto[] // Full media metadata (for editor: mediaId, storageObjectId, sortOrder)
  conversationId?: string // Link to conversation where this was created
  sourceNewsId?: string // Link to news item this was created from
  sourceTrendId?: string // Link to trend item this was created from
  sourceReelId?: string // Link to reel item this was created from
  publishedLink?: string // Link to published post
}

export interface InfoEvent {
  id: string
  title: string
  date: string
  description?: string
}

export interface NewsItem {
  id: string
  title: string
  description?: string
  source: string
  date: string
  url?: string
}

export interface TrendItem {
  id: string
  name: string           // "#AI" or "Artificial Intelligence"
  hashtag?: string       // "#AI" (optional, if different from name)
  tweetsCount: number    // 12500
  category: string       // "Технологии", "Бизнес", etc.
  url: string            // Link to Twitter thread
}

export interface FunDay {
  date: string // 'MM-DD' format (without year)
  title: string
  emoji?: string
}

export interface DemoProject {
  id: string
  name: string
  accounts: SocialAccount[]
  tags: ContentTag[]
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  news: NewsItem[]
  trends: TrendItem[]
}

// ---- Publish flow (API 23.04) ----

export interface PublishReelOptions {
  locationId?: string
  shareToFeed?: boolean
  coverUrl?: string
}

export interface PublishAcceptedResponse {
  postId: string
  publicationAttemptId?: string
  publicationAttemptIds?: string[]  // stories возвращают массив
  status: PostStatus
}

export interface Publication {
  id: string                // локальный UUID
  postId: string
  workspaceId: string
  platform: SocialNetwork
  mediaType: PostMediaType
  postTitle: string
  accountName: string
  status: 'publishing' | 'published' | 'failed'
  error?: string
  publishedLink?: string
  startedAt: number
  completedAt?: number
}
