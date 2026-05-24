const DISABLED_PREFIXES = [
  '/app/calendar',
  '/app/editor',
  '/app/workspaces',
  '/app/team',
  '/app/activity',
  '/app/assistant',
  '/app/settings',
  '/app/reels-script',
  '/app/connect-account',
]

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/app' || to.path === '/app/') {
    return navigateTo('/app/trends', { replace: true })
  }

  if (DISABLED_PREFIXES.some(prefix => to.path === prefix || to.path.startsWith(prefix + '/'))) {
    return navigateTo('/app/trends', { replace: true })
  }
})
