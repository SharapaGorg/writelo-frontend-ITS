import { defineEventHandler, getRequestHeader, getRequestURL, sendRedirect } from 'h3'

const SUPPORTED = new Set(['ru', 'en'])
const DEFAULT_LOCALE = 'ru'

function pickLocale(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q = 'q=1'] = part.trim().split(';')
      const quality = Number.parseFloat(q.replace('q=', '')) || 1
      return { lang: tag.split('-')[0]!.toLowerCase(), quality }
    })
    .sort((a, b) => b.quality - a.quality)

  for (const { lang } of ranked) {
    if (SUPPORTED.has(lang)) return lang
  }
  return DEFAULT_LOCALE
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.pathname !== '/') return

  const locale = pickLocale(getRequestHeader(event, 'accept-language'))
  return sendRedirect(event, `/${locale}${url.search}`, 302)
})
