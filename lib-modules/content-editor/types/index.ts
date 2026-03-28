export type ContentType = 'post' | 'story' | 'reel' | 'carousel'
export type EditorMode = 'chat' | 'images'

export interface ContentDraft {
  id: string
  type: ContentType
  accountId: string
  title: string
  description: string
  hashtags: string[]
  images: string[]
  scheduledDate: string | null
  status: 'draft' | 'ready'
  script?: ReelScript
}

export interface ReelScript {
  duration: number
  frames: ReelFrame[]
}

export interface ReelFrame {
  second: number
  description: string
  voiceover: string
  visualUrl?: string
}

export interface EditorChatMessage {
  id: string | number
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  processing?: boolean
  error?: boolean
}
