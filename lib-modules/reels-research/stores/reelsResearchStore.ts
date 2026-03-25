import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReelItem, ReelsFilters } from '../types'
import { demoReels } from '../data/demoReels'

export const useReelsResearchStore = defineStore('reelsResearch', () => {
  // State
  const reels = ref<ReelItem[]>(demoReels)
  const filters = ref<ReelsFilters>({
    category: 'all',
    sortBy: 'views'
  })

  // Getters
  const filteredReels = computed(() => {
    let result = [...reels.value]
    if (filters.value.category !== 'all') {
      result = result.filter(r => r.category === filters.value.category)
    }
    result.sort((a, b) => b[filters.value.sortBy] - a[filters.value.sortBy])
    return result
  })

  // Actions
  function setCategory(category: ReelsFilters['category']) {
    filters.value.category = category
  }

  function setSortBy(sortBy: ReelsFilters['sortBy']) {
    filters.value.sortBy = sortBy
  }

  return {
    reels,
    filters,
    filteredReels,
    setCategory,
    setSortBy
  }
})
