export type ReelCategory = 'trending' | 'educational' | 'entertainment' | 'lifestyle' | 'business'

export interface ReelItem {
  id: string
  url: string
  author: string
  authorAvatar?: string
  description: string
  thumbnail: string
  videoUrl?: string
  views: number
  likes: number
  comments: number
  reposts: number
  createdAt: string
  duration: number
  language: string
  category?: ReelCategory
}

export type ReelSortBy = 'viral' | 'newest' | 'views' | 'likes' | 'comments' | 'reposts'
export type ReelDurationBucket = 'all' | 'short' | 'medium' | 'long' | 'xlong'

export interface ReelsFilters {
  sortBy: ReelSortBy
  duration: ReelDurationBucket
  language: string
  search: string
}
