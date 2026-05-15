import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReelItem, ReelsFilters, ReelSortBy, ReelDurationBucket } from '../types'
import { demoReels } from '../data/demoReels'

function viralScore(r: ReelItem): number {
  return r.views + r.likes * 10 + r.comments * 25 + r.reposts * 50
}

function matchesDuration(seconds: number, bucket: ReelDurationBucket): boolean {
  switch (bucket) {
    case 'short': return seconds < 15
    case 'medium': return seconds >= 15 && seconds < 30
    case 'long': return seconds >= 30 && seconds < 60
    case 'xlong': return seconds >= 60
    default: return true
  }
}

export const useReelsResearchStore = defineStore('reelsResearch', () => {
  // Бэкенд эндпоинта трендов пока нет — отдаём мок-данные всем пользователям.
  const reels = ref<ReelItem[]>([...demoReels])
  const filters = ref<ReelsFilters>({
    sortBy: 'viral',
    duration: 'all',
    language: 'all',
    search: ''
  })

  const filteredReels = computed(() => {
    let result = [...reels.value]

    if (filters.value.language !== 'all') {
      result = result.filter(r => r.language === filters.value.language)
    }

    if (filters.value.duration !== 'all') {
      result = result.filter(r => matchesDuration(r.duration, filters.value.duration))
    }

    const q = filters.value.search.trim().toLowerCase()
    if (q) {
      result = result.filter(r =>
        r.description.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q)
      )
    }

    switch (filters.value.sortBy) {
      case 'viral':
        result.sort((a, b) => viralScore(b) - viralScore(a))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'views':
        result.sort((a, b) => b.views - a.views)
        break
      case 'likes':
        result.sort((a, b) => b.likes - a.likes)
        break
      case 'comments':
        result.sort((a, b) => b.comments - a.comments)
        break
      case 'reposts':
        result.sort((a, b) => b.reposts - a.reposts)
        break
    }

    return result
  })

  function setSortBy(sortBy: ReelSortBy) {
    filters.value.sortBy = sortBy
  }
  function setDuration(duration: ReelDurationBucket) {
    filters.value.duration = duration
  }
  function setLanguage(language: string) {
    filters.value.language = language
  }
  function setSearch(search: string) {
    filters.value.search = search
  }

  return {
    reels,
    filters,
    filteredReels,
    setSortBy,
    setDuration,
    setLanguage,
    setSearch
  }
})
