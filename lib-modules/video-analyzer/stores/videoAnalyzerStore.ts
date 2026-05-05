import { ref } from 'vue'
import type {
  ShortVideoAnalysisDto,
  ShortVideoAnalysisHistoryItemDto,
} from '../types'

// Per-workspace history (last 50 from backend, sorted desc by requestedAt).
const historyByWorkspace = ref<Record<string, ShortVideoAnalysisHistoryItemDto[]>>({})
// Cached `GET ?url=...` responses, keyed by analysis id.
const detailById = ref<Record<string, ShortVideoAnalysisDto>>({})
// id → originalUrl, populated from history. Lets the detail page resolve a
// deep link without a fresh history fetch when the entry is already cached.
const urlIndexById = ref<Record<string, string>>({})
// Optimistic "processing" cards: a Set of URLs we've kicked off but the
// backend hasn't returned in /history yet. Renders as a pseudo-card.
const inFlightUrls = ref<Record<string, Set<string>>>({})
const isHistoryLoadingByWorkspace = ref<Record<string, boolean>>({})

function sortHistoryDesc(
  list: ShortVideoAnalysisHistoryItemDto[],
): ShortVideoAnalysisHistoryItemDto[] {
  return [...list].sort((a, b) => {
    const aT = a.requestedAt ? new Date(a.requestedAt).getTime() : 0
    const bT = b.requestedAt ? new Date(b.requestedAt).getTime() : 0
    return bT - aT
  })
}

export function useVideoAnalyzerStore() {
  function setHistory(workspaceId: string, list: ShortVideoAnalysisHistoryItemDto[]) {
    const sorted = sortHistoryDesc(list)
    historyByWorkspace.value = {
      ...historyByWorkspace.value,
      [workspaceId]: sorted,
    }
    // Update the id → url index in one pass.
    const idx = { ...urlIndexById.value }
    for (const item of sorted) {
      if (item.shortVideoAnalysisId) {
        idx[item.shortVideoAnalysisId] = item.originalUrl
      }
    }
    urlIndexById.value = idx
  }

  function getHistory(workspaceId: string): ShortVideoAnalysisHistoryItemDto[] {
    return historyByWorkspace.value[workspaceId] ?? []
  }

  function findHistoryByAnalysisId(
    workspaceId: string,
    analysisId: string,
  ): ShortVideoAnalysisHistoryItemDto | null {
    const list = historyByWorkspace.value[workspaceId] ?? []
    return list.find(i => i.shortVideoAnalysisId === analysisId) ?? null
  }

  function setDetail(detail: ShortVideoAnalysisDto) {
    detailById.value = { ...detailById.value, [detail.id]: detail }
    urlIndexById.value = { ...urlIndexById.value, [detail.id]: detail.originalUrl }
  }

  function getDetail(analysisId: string): ShortVideoAnalysisDto | null {
    return detailById.value[analysisId] ?? null
  }

  function getUrlForAnalysis(analysisId: string): string | null {
    return urlIndexById.value[analysisId] ?? null
  }

  function addInFlight(workspaceId: string, url: string) {
    const prev = inFlightUrls.value[workspaceId] ?? new Set<string>()
    const next = new Set(prev)
    next.add(url)
    inFlightUrls.value = { ...inFlightUrls.value, [workspaceId]: next }
  }

  function removeInFlight(workspaceId: string, url: string) {
    const prev = inFlightUrls.value[workspaceId]
    if (!prev || !prev.has(url)) return
    const next = new Set(prev)
    next.delete(url)
    inFlightUrls.value = { ...inFlightUrls.value, [workspaceId]: next }
  }

  function getInFlight(workspaceId: string): string[] {
    return [...(inFlightUrls.value[workspaceId] ?? [])]
  }

  function isInFlight(workspaceId: string, url: string): boolean {
    return (inFlightUrls.value[workspaceId] ?? new Set()).has(url)
  }

  function setHistoryLoading(workspaceId: string, loading: boolean) {
    isHistoryLoadingByWorkspace.value = {
      ...isHistoryLoadingByWorkspace.value,
      [workspaceId]: loading,
    }
  }

  function getHistoryLoading(workspaceId: string): boolean {
    return isHistoryLoadingByWorkspace.value[workspaceId] ?? false
  }

  return {
    historyByWorkspace,
    detailById,
    urlIndexById,
    inFlightUrls,
    isHistoryLoadingByWorkspace,

    setHistory,
    getHistory,
    findHistoryByAnalysisId,
    setDetail,
    getDetail,
    getUrlForAnalysis,
    addInFlight,
    removeInFlight,
    getInFlight,
    isInFlight,
    setHistoryLoading,
    getHistoryLoading,
  }
}
