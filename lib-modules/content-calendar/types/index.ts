export type ContentType = 'post' | 'story' | 'reels' | 'article'

export type SocialNetwork = 'vk' | 'youtube' | 'telegram' | 'instagram'

export type PostStatus = 'idea' | 'draft' | 'ready' | 'published'

export interface SocialAccount {
  id: string
  network: SocialNetwork
  name: string
  username: string
  avatarUrl?: string
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

// ---- Telegram channel linking (API 23.04) ----

export type TelegramLinkStatus =
  | 'pending'
  | 'user_started'
  | 'completed'
  | 'failed'
  | 'expired'

export interface TelegramLinkStartResponse {
  deepLink: string
  verificationCode: string
  expiresAt: string // ISO
}

export interface TelegramLinkStatusResponse {
  status: TelegramLinkStatus
  failureReason?: string | null
  socialAccountId?: string | null
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
  images?: string[] // Multiple images (up to 10)
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
