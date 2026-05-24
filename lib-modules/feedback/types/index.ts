export type FeedbackSource = 'video-analysis' | 'general'

export type FeedbackRating = 1 | 2 | 3

export interface SubmitFeedbackPayload {
  source: FeedbackSource
  targetId?: string
  rating: FeedbackRating
  comment?: string
}
