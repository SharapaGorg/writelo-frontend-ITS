// Public Trending Reels API (Instagram). DTOs mirror the backend response shape.

export interface SignedAssetDto {
  objectId: string
  url: string
  expiresAt: string
}

export interface TrendingReelAuthorDto {
  username: string | null
  displayName: string | null
  followerCount: number | null
  isVerified: boolean | null
}

export interface TrendingReelMetricsDto {
  plays: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  viewsOverAuthorBaseline: number | null
}

export interface TrendingReelDto {
  reelId: string
  url: string
  shortcode: string | null
  description: string | null
  author: TrendingReelAuthorDto
  metrics: TrendingReelMetricsDto
  category: string | null
  language: string | null
  addedAt: string
  postedAt: string | null
  publishedAt: string | null
  durationSeconds: number | null
  previewImage: SignedAssetDto | null
}

export interface TrendingReelsFeedResponse {
  items: TrendingReelDto[]
  nextCursor: string | null
}

export interface TrendingReelDetailsResponse {
  reel: TrendingReelDto
}

// Spec-accepted sort values; unknown values fall back to `newest` server-side.
export type ReelSortBy =
  | 'newest'
  | 'views'
  | 'plays'
  | 'likes'
  | 'comments'
  | 'rank_score'

export type ReelDurationBucket = 'all' | 'short' | 'medium' | 'long' | 'xlong'

// Author size buckets map to minAuthorFollowers/maxAuthorFollowers on the API.
export type ReelAuthorBucket = 'all' | 'micro' | 'small' | 'medium' | 'large'

// Posted-range buckets map to postedAfter (ISO datetime, computed from now).
export type ReelPostedRange = 'all' | '24h' | '7d' | '30d' | '90d'

export interface ReelsFilters {
  sortBy: ReelSortBy
  duration: ReelDurationBucket
  authorSize: ReelAuthorBucket
  postedRange: ReelPostedRange
  search: string
  category: string | null
  language: string | null
}

export interface TrendingReelsFeedQuery {
  q?: string
  sort?: ReelSortBy
  category?: string
  language?: string
  author?: string
  postedAfter?: string
  postedBefore?: string
  minDurationSeconds?: number
  maxDurationSeconds?: number
  minAuthorFollowers?: number
  maxAuthorFollowers?: number
  minViews?: number
  maxViews?: number
  minPlays?: number
  maxPlays?: number
  minLikes?: number
  maxLikes?: number
  minComments?: number
  maxComments?: number
  limit?: number
  cursor?: string
}
