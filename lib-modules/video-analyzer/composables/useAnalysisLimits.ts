import { computed } from 'vue'
import { useWorkspaceLimits } from '~/lib-modules/workspaces'

export function useAnalysisLimits() {
  const wl = useWorkspaceLimits()

  const shortVideoLimit = wl.shortVideoAnalysisRequests
  const left = computed<number>(() => wl.asNumber(shortVideoLimit.value?.left))
  const total = computed<number>(() => wl.asNumber(shortVideoLimit.value?.total))
  const resetAt = computed<string | null>(() => shortVideoLimit.value?.resetAt ?? null)
  const isExhausted = computed<boolean>(() => shortVideoLimit.value !== null && left.value === 0)
  const isLoaded = computed<boolean>(() => shortVideoLimit.value !== null)

  return {
    shortVideoLimit,
    left,
    total,
    resetAt,
    isExhausted,
    isLoaded,
    load: wl.load,
    refresh: wl.refresh,
  }
}
