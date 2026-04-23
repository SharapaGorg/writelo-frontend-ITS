export type ContentType = 'post' | 'story' | 'reel'
export type EditorMode = 'chat' | 'images'

export type ContentStatus = 'idea' | 'draft' | 'ready' | 'published'

/**
 * Editor-side media item. Unifies three states:
 *   - local pending upload (`file` set, no `mediaId`)
 *   - already persisted (`mediaId` + `storageObjectId` set, `file` unset)
 *   - preview-only video/image (blob URL)
 */
export interface DraftImage {
  previewUrl: string              // blob: URL or signed download URL
  fileType: 'image' | 'video'
  file?: File                     // unset once uploaded
  mediaId?: string                // set after attach to post via createPostMedia
  storageObjectId?: string        // set after attach
}

export interface ContentDraft {
  id: string
  type: ContentType
  accountId: string
  title: string
  description: string
  hashtags: string[]
  images: DraftImage[]
  scheduledDate: string | null
  status: ContentStatus
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
