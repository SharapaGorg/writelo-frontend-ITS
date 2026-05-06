import { ref, computed } from 'vue'
import { useWorkspaceContext } from './useWorkspaceContext'
import { useWorkspacesApi } from '../helpers/api'
import type { WorkspaceLimitsDto, WorkspaceUsageLimitDto } from '~/scripts/shared/types/workspace'

const limitsByWorkspace = ref<Record<string, WorkspaceLimitsDto>>({})
const isLoadingByWorkspace = ref<Record<string, boolean>>({})

function asNumber(v: number | string | undefined | null): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useWorkspaceLimits() {
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useWorkspacesApi()

  const all = computed<WorkspaceLimitsDto | null>(() => {
    try {
      return limitsByWorkspace.value[requireWorkspaceId()] ?? null
    } catch {
      return null
    }
  })

  const modelRequests = computed<WorkspaceUsageLimitDto | null>(() => all.value?.modelRequests ?? null)
  const searchRequests = computed<WorkspaceUsageLimitDto | null>(() => all.value?.searchRequests ?? null)
  const shortVideoAnalysisRequests = computed<WorkspaceUsageLimitDto | null>(
    () => all.value?.shortVideoAnalysisRequests ?? null,
  )

  const isLoaded = computed<boolean>(() => all.value !== null)

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
      console.warn('[Workspaces] failed to load limits', e)
    } finally {
      isLoadingByWorkspace.value = { ...isLoadingByWorkspace.value, [wid]: false }
    }
  }

  return {
    all,
    modelRequests,
    searchRequests,
    shortVideoAnalysisRequests,
    isLoaded,
    load,
    refresh: load,
    asNumber,
  }
}
