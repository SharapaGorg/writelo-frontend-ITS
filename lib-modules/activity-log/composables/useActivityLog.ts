import { ref, computed } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useWorkspaceActivityLogApi } from '../helpers/api'
import type { ActivityLogItemDto } from '~/scripts/shared/types/workspace'
import type { ActivityLogFilters } from '../types'

const PAGE_SIZE = 50

export function useActivityLog() {
  const ctx = useWorkspaceContext()
  const api = useWorkspaceActivityLogApi()

  const items = ref<ActivityLogItemDto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const filters = ref<ActivityLogFilters>({})
  const forbidden = ref(false)

  const hasMore = computed(() => items.value.length < total.value)

  async function loadInitial() {
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      items.value = []
      total.value = 0
      return
    }
    loading.value = true
    forbidden.value = false
    try {
      const r = await api.getLog(workspaceId, { ...filters.value, offset: 0, limit: PAGE_SIZE })
      items.value = r.items ?? []
      total.value = r.total ?? items.value.length
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) {
        forbidden.value = true
        items.value = []
        total.value = 0
      } else {
        throw e
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      return
    }
    loading.value = true
    try {
      const r = await api.getLog(workspaceId, {
        ...filters.value,
        offset: items.value.length,
        limit: PAGE_SIZE,
      })
      items.value.push(...(r.items ?? []))
      total.value = r.total ?? items.value.length
    } finally {
      loading.value = false
    }
  }

  async function setFilters(next: Partial<ActivityLogFilters>) {
    filters.value = { ...filters.value, ...next }
    await loadInitial()
  }

  async function resetFilters() {
    filters.value = {}
    await loadInitial()
  }

  return {
    items,
    loading,
    hasMore,
    filters,
    forbidden,
    loadInitial,
    loadMore,
    setFilters,
    resetFilters,
  }
}
