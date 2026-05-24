import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TrendingReelDto,
  ReelsFilters,
  ReelSortBy,
  ReelDurationBucket,
  ReelAuthorBucket,
  ReelPostedRange,
  TrendingReelsFeedQuery,
} from '../types'
import { useTrendingReelsApi } from '../helpers/api'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

function matchesDuration(seconds: number | null, bucket: ReelDurationBucket): boolean {
  const s = seconds ?? 0
  switch (bucket) {
    case 'short': return s < 15
    case 'medium': return s >= 15 && s < 30
    case 'long': return s >= 30 && s < 60
    case 'xlong': return s >= 60
    default: return true
  }
}

function authorSizeRange(bucket: ReelAuthorBucket): { min?: number; max?: number } {
  switch (bucket) {
    case 'micro': return { max: 10_000 }
    case 'small': return { min: 10_000, max: 100_000 }
    case 'medium': return { min: 100_000, max: 1_000_000 }
    case 'large': return { min: 1_000_000 }
    default: return {}
  }
}

function postedAfterIso(range: ReelPostedRange): string | undefined {
  if (range === 'all') return undefined
  const ms: Record<Exclude<ReelPostedRange, 'all'>, number> = {
    '24h': 24 * 3600 * 1000,
    '7d': 7 * 86400 * 1000,
    '30d': 30 * 86400 * 1000,
    '90d': 90 * 86400 * 1000,
  }
  return new Date(Date.now() - ms[range]).toISOString()
}

export const useReelsResearchStore = defineStore('reelsResearch', () => {
  const reels = ref<TrendingReelDto[]>([])
  const filters = ref<ReelsFilters>({
    sortBy: 'newest',
    duration: 'all',
    authorSize: 'all',
    postedRange: 'all',
    search: '',
    category: null,
    language: null,
  })
  const nextCursor = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const loadError = ref<string | null>(null)

  const selectedReel = ref<TrendingReelDto | null>(null)
  const isDetailOpen = ref(false)
  const isLoadingDetail = ref(false)
  const detailError = ref<string | null>(null)

  function buildQuery(): TrendingReelsFeedQuery {
    const followerRange = authorSizeRange(filters.value.authorSize)
    const postedAfter = postedAfterIso(filters.value.postedRange)
    const search = filters.value.search.trim()
    const q: TrendingReelsFeedQuery = {
      sort: filters.value.sortBy,
      limit: 50,
    }
    if (followerRange.min != null) q.minAuthorFollowers = followerRange.min
    if (followerRange.max != null) q.maxAuthorFollowers = followerRange.max
    if (postedAfter) q.postedAfter = postedAfter
    if (search) q.q = search
    if (filters.value.category) q.category = filters.value.category
    if (filters.value.language) q.language = filters.value.language
    return q
  }

  // Filters/sort changes invalidate the cursor — restart pagination.
  const hasActiveFilters = computed(() =>
    filters.value.duration !== 'all'
    || filters.value.authorSize !== 'all'
    || filters.value.postedRange !== 'all'
    || filters.value.search.trim() !== ''
    || filters.value.category !== null
    || filters.value.language !== null
  )

  async function fetchFeed() {
    const { currentWorkspaceId } = useWorkspaceContext()
    if (!currentWorkspaceId.value) {
      reels.value = []
      nextCursor.value = null
      return
    }
    isLoading.value = true
    loadError.value = null
    try {
      const query = buildQuery()
      // Bust browser cache via Date.now stamp from the controller.
      const response = await useTrendingReelsApi().getGlobalFeed(currentWorkspaceId.value, query)
      reels.value = response?.items ?? []
      nextCursor.value = response?.nextCursor ?? null
    } catch (e: any) {
      reels.value = []
      nextCursor.value = null
      loadError.value = e?.message ?? 'Не удалось загрузить тренды'
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (!nextCursor.value || isLoadingMore.value) return
    const { currentWorkspaceId } = useWorkspaceContext()
    if (!currentWorkspaceId.value) return
    isLoadingMore.value = true
    try {
      const response = await useTrendingReelsApi().getGlobalFeed(currentWorkspaceId.value, {
        ...buildQuery(),
        cursor: nextCursor.value,
      })
      if (response?.items) {
        reels.value = [...reels.value, ...response.items]
        nextCursor.value = response.nextCursor
      }
    } catch (e) {
      console.warn('[reels-research] loadMore failed', e)
    } finally {
      isLoadingMore.value = false
    }
  }

  function openReel(reel: TrendingReelDto) {
    selectedReel.value = reel
    isDetailOpen.value = true
    fetchReelDetails(reel.reelId)
  }

  function closeReel() {
    isDetailOpen.value = false
    selectedReel.value = null
    detailError.value = null
  }

  async function fetchReelDetails(reelId: string) {
    const { currentWorkspaceId } = useWorkspaceContext()
    if (!currentWorkspaceId.value) return
    isLoadingDetail.value = true
    detailError.value = null
    try {
      const response = await useTrendingReelsApi().getReel(currentWorkspaceId.value, reelId)
      if (response?.reel && selectedReel.value?.reelId === reelId) {
        selectedReel.value = response.reel
      }
    } catch (e: any) {
      detailError.value = e?.message ?? 'Не удалось загрузить детали'
    } finally {
      isLoadingDetail.value = false
    }
  }

  // Server already filters and sorts; only the client-side duration bucket
  // (not exposed as a server param) needs local filtering.
  const filteredReels = computed(() => {
    if (filters.value.duration === 'all') return reels.value
    return reels.value.filter(r => matchesDuration(r.durationSeconds, filters.value.duration))
  })

  // Server-affecting setters reset cursor + refetch.
  function setSortBy(sortBy: ReelSortBy) {
    filters.value.sortBy = sortBy
    fetchFeed()
  }
  function setAuthorSize(authorSize: ReelAuthorBucket) {
    filters.value.authorSize = authorSize
    fetchFeed()
  }
  function setPostedRange(postedRange: ReelPostedRange) {
    filters.value.postedRange = postedRange
    fetchFeed()
  }
  function setCategory(category: string | null) {
    filters.value.category = category
    fetchFeed()
  }
  function setLanguage(language: string | null) {
    filters.value.language = language
    fetchFeed()
  }
  function setDuration(duration: ReelDurationBucket) {
    filters.value.duration = duration
  }
  function setSearch(search: string) {
    filters.value.search = search
  }
  // Search is server-side via `q`; expose a way to commit it (debounce in UI).
  function commitSearch() {
    fetchFeed()
  }

  return {
    reels,
    filters,
    filteredReels,
    hasActiveFilters,
    nextCursor,
    isLoading,
    isLoadingMore,
    loadError,
    selectedReel,
    isDetailOpen,
    isLoadingDetail,
    detailError,
    fetchFeed,
    loadMore,
    openReel,
    closeReel,
    setSortBy,
    setDuration,
    setAuthorSize,
    setPostedRange,
    setCategory,
    setLanguage,
    setSearch,
    commitSearch,
  }
})
