// Public Trending Reels API (Instagram). DTOs mirror the backend response shape.

export interface TrendingReelAuthorDto {
  username: string | null
  displayName: string | null
  followerCount: number | null
  isVerified: boolean | null
}

export interface TrendingReelMetricsDto {
  effectiveViews: number
  views: number | null
  plays: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  capturedAt: string | null
  ageSeconds: number | null
}

export interface TrendingReelScoreDto {
  global: number | null
  viewsOverAuthorMedian: number | null
}

export interface TrendingReelDto {
  reelId: string
  url: string
  shortcode: string | null
  captionPreview: string | null
  thumbnailUrl: string | null
  thumbnailExpiresAt: string | null
  author: TrendingReelAuthorDto
  postedAt: string | null
  durationSeconds: number | null
  metrics: TrendingReelMetricsDto
  score: TrendingReelScoreDto
  firstSeenAt: string
  lastSeenAt: string
  rank: number
  rankScore: number
}

export interface TrendingReelsBatchDto {
  id: string
  feedType: string
  status: string
  itemCount: number
  asOf: string | null
  expiresAt: string | null
  scoringVersion: string
}

export interface TrendingReelsFeedResponse {
  batch: TrendingReelsBatchDto | null
  asOf: string | null
  expiresAt: string | null
  scoringVersion: string | null
  items: TrendingReelDto[]
  nextCursor: string | null
}

export interface TrendingReelDetailsResponse {
  asOf: string | null
  scoringVersion: string
  reel: TrendingReelDto
}

// Spec sort values. `most_reposts` is intentionally absent — backend doesn't expose it.
export type ReelSortBy =
  | 'most_viral'
  | 'newest'
  | 'most_plays'
  | 'most_likes'
  | 'most_comments'

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
}

export interface TrendingReelsFeedQuery {
  sort?: ReelSortBy
  category?: string
  postedAfter?: string
  postedBefore?: string
  minDurationSeconds?: number
  maxDurationSeconds?: number
  minAuthorFollowers?: number
  maxAuthorFollowers?: number
  limit?: number
  cursor?: string
}
