// Maps backend errorCode/errorMessage to user-facing strings.
//
// Per the public-API contract: backend already localizes `errorMessage` using
// the user's profile language, so prefer it for display. Fall back to a
// curated map for known stable codes, then to a generic line.

import type { PublicShortVideoErrorCode } from '../types'

type Translator = (key: string, params?: Record<string, unknown>) => string

const CODE_TO_KEY: Record<PublicShortVideoErrorCode, string> = {
  'error-short-video-analysis-not-allowed': 'videoAnalyzer.errors.notAllowed',
  'error-short-video-analysis-limit-reached': 'videoAnalyzer.errors.limitReached',
  'error-short-video-analysis-unavailable': 'videoAnalyzer.errors.unavailable',
  'error-short-video-analysis-failed': 'videoAnalyzer.errors.failed',
  'error-social-video-unsupported-url': 'videoAnalyzer.errors.unsupportedUrl',
  'error-social-video-too-long': 'videoAnalyzer.errors.tooLong',
  'error-social-video-import-failed': 'videoAnalyzer.errors.importFailed',
  'error-social-video-download-failed': 'videoAnalyzer.errors.downloadFailed',
  'error-social-video-preview-failed': 'videoAnalyzer.errors.previewFailed',
  'error-social-video-missing-video': 'videoAnalyzer.errors.missingVideo',
}

export function humanizeAnalysisError(
  t: Translator,
  errorCode: string | null | undefined,
  errorMessage: string | null | undefined,
): string {
  // Backend localizes `errorMessage` to user locale — trust it first.
  if (errorMessage && errorMessage.trim()) return errorMessage
  if (errorCode && errorCode in CODE_TO_KEY) {
    return t(CODE_TO_KEY[errorCode as PublicShortVideoErrorCode])
  }
  return t('videoAnalyzer.errors.generic')
}

export function isLimitReachedError(errorCode: string | null | undefined): boolean {
  return errorCode === 'error-short-video-analysis-limit-reached'
}
