// Public feedback API. Top-level (not workspace-scoped), auth required.

export type FeedbackSection = 'generic' | 'today_reels' | 'reel_analysis'
export type FeedbackSentiment = 'like' | 'neutral' | 'dislike'
export type FeedbackReelKind = 'curated' | 'arbitrary'

export interface CreateFeedbackReelReferenceDto {
  kind: FeedbackReelKind
  curatedReelId?: string | null
  url?: string | null
  externalId?: string | null
}

export interface CreateFeedbackAnalysisReferenceDto {
  reel?: CreateFeedbackReelReferenceDto | null
}

export interface CreateFeedbackContextDto {
  analysis?: CreateFeedbackAnalysisReferenceDto | null
}

export interface CreateFeedbackRequest {
  section: FeedbackSection
  sentiment: FeedbackSentiment
  context?: CreateFeedbackContextDto | null
  message?: string | null
}

export interface FeedbackDto {
  id: string
  userId: string
  section: FeedbackSection
  // Backend returns this as opaque JSON — keep loose.
  context: unknown
  sentiment: FeedbackSentiment
  message: string | null
  createdAt: string
  viewedAt: string | null
}

// UI-level descriptor — keeps callers terse and centralizes the
// section/context shape mapping for the form component.
export type FeedbackSurface =
  | { section: 'generic' }
  | { section: 'today_reels' }
  | { section: 'reel_analysis'; reel: CreateFeedbackReelReferenceDto }
