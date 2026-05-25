import { Routes } from '~/scripts/shared/types'

/**
 * Read the post-auth redirect target from the current URL's `?next=` query.
 *
 * Used by every auth entry point (email login/signup, Google OAuth, Telegram
 * OAuth) so that flows like "landing → /auth → /app/plans?intent=auto" work
 * regardless of which sign-in method the user picks.
 *
 * Only path-relative targets are accepted to avoid open-redirect to external
 * origins. Falls back to the app root.
 */
export function getPostAuthRedirect(): string {
  if (typeof window === 'undefined') return Routes.app

  const next = new URLSearchParams(window.location.search).get('next')
  if (!next) return Routes.app

  // Must be same-origin path (start with `/` but not `//`).
  if (!next.startsWith('/') || next.startsWith('//')) return Routes.app

  return next
}
