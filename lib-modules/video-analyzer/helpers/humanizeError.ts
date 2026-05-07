// Maps backend errorCode/errorMessage to user-facing strings.
//
// Per the public-API contract: backend already localizes `errorMessage` using
// the user's profile language, so prefer it for display. Fall back to a
// curated map for known stable codes, then to a generic line.

import type { PublicShortVideoErrorCode } from '../types'

const MAP: Record<PublicShortVideoErrorCode, string> = {
  'error-short-video-analysis-not-allowed':
    'У вашей роли нет прав запускать анализ.',
  'error-short-video-analysis-limit-reached':
    'Лимит анализов исчерпан.',
  'error-short-video-analysis-unavailable':
    'Сервис анализа временно недоступен. Попробуйте позже.',
  'error-short-video-analysis-failed':
    'Анализатор не справился с этим видео. Попробуйте другую ссылку.',
  'error-social-video-unsupported-url':
    'Ссылка не поддерживается. Доступны YouTube Shorts, TikTok, Instagram Reels.',
  'error-social-video-too-long':
    'Видео слишком длинное для анализа.',
  'error-social-video-import-failed':
    'Не удалось импортировать видео. Проверьте, что оно публичное.',
  'error-social-video-download-failed':
    'Не удалось скачать видео. Попробуйте позже.',
  'error-social-video-preview-failed':
    'Не удалось получить превью видео.',
  'error-social-video-missing-video':
    'Видео не найдено по этой ссылке.',
}

export function humanizeAnalysisError(
  errorCode: string | null | undefined,
  errorMessage: string | null | undefined,
): string {
  // Backend localizes `errorMessage` to user locale — trust it first.
  if (errorMessage && errorMessage.trim()) return errorMessage
  if (errorCode && errorCode in MAP) return MAP[errorCode as PublicShortVideoErrorCode]
  return 'Не удалось выполнить анализ.'
}

export function isLimitReachedError(errorCode: string | null | undefined): boolean {
  return errorCode === 'error-short-video-analysis-limit-reached'
}
