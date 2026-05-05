// Maps backend errorCode/message to user-facing strings. Falls back to the
// raw backend `message` if no mapping is found, then to a generic line.

const MAP: Record<string, string> = {
  social_video_unsupported_url:
    'Ссылка не поддерживается. Доступны YouTube Shorts, TikTok, Instagram Reels.',
  'error-short-video-analysis-not-allowed':
    'У вашей роли нет прав запускать анализ.',
  'error-short-video-analysis-limit-reached':
    'Лимит анализов исчерпан.',
  short_video_analysis_failed:
    'Анализатор не справился с этим видео. Попробуйте другую ссылку.',
}

export function humanizeAnalysisError(errorCode: string | null | undefined, fallback?: string | null): string {
  if (errorCode && MAP[errorCode]) return MAP[errorCode]
  if (fallback && fallback.trim()) return fallback
  return 'Не удалось выполнить анализ.'
}

export function isLimitReachedError(errorCode: string | null | undefined): boolean {
  return errorCode === 'error-short-video-analysis-limit-reached'
}
