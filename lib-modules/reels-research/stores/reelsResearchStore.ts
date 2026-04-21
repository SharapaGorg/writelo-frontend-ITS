import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReelItem, ReelsFilters } from '../types'
import { demoReels } from '../data/demoReels'
import { useDemoMode } from '~/lib-modules/demo-mode'

export const useReelsResearchStore = defineStore('reelsResearch', () => {
  const { isGuestDemo } = useDemoMode()

  // Guest demo: show mock reels for the landing showcase.
  // Authenticated: no backend endpoint yet, show empty list (no fake data).
  const reels = ref<ReelItem[]>(isGuestDemo.value ? demoReels : [])
  const filters = ref<ReelsFilters>({
    category: 'all',
    sortBy: 'views'
  })

  const filteredReels = computed(() => {
    let result = [...reels.value]
    if (filters.value.category !== 'all') {
      result = result.filter(r => r.category === filters.value.category)
    }
    result.sort((a, b) => b[filters.value.sortBy] - a[filters.value.sortBy])
    return result
  })

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
