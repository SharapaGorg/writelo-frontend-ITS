import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TrendingReelDto,
  ReelsFilters,
  ReelSortBy,
  ReelDurationBucket,
  ReelAuthorBucket,
  ReelPostedRange,
} from '../types'
import { useTrendingReelsApi } from '../helpers/api'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

function num(n: number | null | undefined): number {
  return typeof n === 'number' ? n : 0
}

function plays(r: TrendingReelDto): number {
  return r.metrics.plays ?? r.metrics.effectiveViews
}

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
    sortBy: 'most_viral',
    duration: 'all',
    authorSize: 'all',
    postedRange: 'all',
    search: '',
  })
  const nextCursor = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const loadError = ref<string | null>(null)

  const selectedReel = ref<TrendingReelDto | null>(null)
  const isDetailOpen = ref(false)
  const isLoadingDetail = ref(false)
  const detailError = ref<string | null>(null)

  function buildQuery(): Record<string, string | number> {
    const followerRange = authorSizeRange(filters.value.authorSize)
    const postedAfter = postedAfterIso(filters.value.postedRange)
    const q: Record<string, string | number> = {
      sort: filters.value.sortBy,
      limit: 50,
    }
    if (followerRange.min != null) q.minAuthorFollowers = followerRange.min
    if (followerRange.max != null) q.maxAuthorFollowers = followerRange.max
    if (postedAfter) q.postedAfter = postedAfter
    return q
  }

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
      const response = await useTrendingReelsApi().getGlobalFeed(currentWorkspaceId.value, buildQuery())
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

  const filteredReels = computed(() => {
    let result = [...reels.value]

    if (filters.value.duration !== 'all') {
      result = result.filter(r => matchesDuration(r.durationSeconds, filters.value.duration))
    }

    const q = filters.value.search.trim().toLowerCase()
    if (q) {
      result = result.filter(r => {
        const caption = r.captionPreview?.toLowerCase() ?? ''
        const username = r.author.username?.toLowerCase() ?? ''
        const displayName = r.author.displayName?.toLowerCase() ?? ''
        return caption.includes(q) || username.includes(q) || displayName.includes(q)
      })
    }

    switch (filters.value.sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const ta = a.postedAt ? new Date(a.postedAt).getTime() : 0
          const tb = b.postedAt ? new Date(b.postedAt).getTime() : 0
          return tb - ta
        })
        break
      case 'most_plays':
        result.sort((a, b) => plays(b) - plays(a))
        break
      case 'most_likes':
        result.sort((a, b) => num(b.metrics.likes) - num(a.metrics.likes))
        break
      case 'most_comments':
        result.sort((a, b) => num(b.metrics.comments) - num(a.metrics.comments))
        break
      // most_viral: trust backend order
    }

    return result
  })

  // Server-affecting setters trigger a refetch; client-only setters don't.
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
  function setDuration(duration: ReelDurationBucket) {
    filters.value.duration = duration
  }
  function setSearch(search: string) {
    filters.value.search = search
  }

  return {
    reels,
    filters,
    filteredReels,
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
    setSearch,
  }
})
