export type ReelCategory = 'trending' | 'educational' | 'entertainment' | 'lifestyle' | 'business'

export interface ReelItem {
  id: string
  url: string
  author: string
  authorAvatar?: string
  description: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  category: ReelCategory
}

export interface BookmarkedReel extends ReelItem {
  bookmarkedAt: string
}

export interface ReelsFilters {
  category: ReelCategory | 'all'
  sortBy: 'views' | 'likes' | 'comments'
}
