export type ContentType = 'post' | 'story' | 'reels'

export type SocialNetwork = 'vk' | 'youtube' | 'telegram' | 'instagram'

export type PostStatus = 'idea' | 'draft' | 'ready' | 'published'

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

export interface CalendarPost {
  id: string
  title: string
  description?: string
  content?: string // Full post text content
  type: ContentType
  status: PostStatus
  networks: SocialNetwork[]
  tags: string[] // Tag IDs
  date: string // 'YYYY-MM-DD'
  time?: string // 'HH:MM' (optional)
  image?: string
  conversationId?: string // Link to conversation where this was created
  publishedLinks?: Partial<Record<SocialNetwork, string>> // Links to published posts
  previews: Partial<Record<SocialNetwork, SocialPreviewData>>
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
  source: string
  date: string
  url?: string
}

export interface DemoProject {
  id: string
  name: string
  tags: ContentTag[]
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  news: NewsItem[]
}
