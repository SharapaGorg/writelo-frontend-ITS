import { ref, computed } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useVideoAnalyzerApi } from '../helpers/api'
import type { WorkspaceLimitsDto, WorkspaceUsageLimitDto } from '~/scripts/shared/types/workspace'

const limitsByWorkspace = ref<Record<string, WorkspaceLimitsDto>>({})
const isLoadingByWorkspace = ref<Record<string, boolean>>({})

function asNumber(v: number | string | undefined | null): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useAnalysisLimits() {
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useVideoAnalyzerApi()

  const shortVideoLimit = computed<WorkspaceUsageLimitDto | null>(() => {
    try {
      const wid = requireWorkspaceId()
      return limitsByWorkspace.value[wid]?.shortVideoAnalysisRequests ?? null
    } catch {
      return null
    }
  })

  const left = computed<number>(() => asNumber(shortVideoLimit.value?.left))
  const total = computed<number>(() => asNumber(shortVideoLimit.value?.total))
  const resetAt = computed<string | null>(() => shortVideoLimit.value?.resetAt ?? null)
  const isExhausted = computed<boolean>(() => shortVideoLimit.value !== null && left.value === 0)
  const isLoaded = computed<boolean>(() => shortVideoLimit.value !== null)

  async function load(): Promise<void> {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return
    }
    if (isLoadingByWorkspace.value[wid]) return
    isLoadingByWorkspace.value = { ...isLoadingByWorkspace.value, [wid]: true }
    try {
      const data = await api.getLimits(wid)
      limitsByWorkspace.value = { ...limitsByWorkspace.value, [wid]: data }
    } catch (e) {
      console.warn('[VideoAnalyzer] failed to load limits', e)
    } finally {
      isLoadingByWorkspace.value = { ...isLoadingByWorkspace.value, [wid]: false }
    }
  }

  // Alias so callers can write `limits.refresh()` after a successful run.
  const refresh = load

  return {
    shortVideoLimit,
    left,
    total,
    resetAt,
    isExhausted,
    isLoaded,
    load,
    refresh,
  }
}
