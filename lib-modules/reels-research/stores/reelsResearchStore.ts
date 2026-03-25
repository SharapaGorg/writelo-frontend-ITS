import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReelItem, BookmarkedReel, ReelsFilters } from '../types'
import { demoReels } from '../data/demoReels'

const BOOKMARKS_STORAGE_KEY = 'reels-research-bookmarks'

export const useReelsResearchStore = defineStore('reelsResearch', () => {
  // State
  const reels = ref<ReelItem[]>(demoReels)
  const bookmarks = ref<BookmarkedReel[]>([])
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

  const bookmarkedIds = computed(() => new Set(bookmarks.value.map(b => b.id)))
  const bookmarksCount = computed(() => bookmarks.value.length)

  // Actions
  function isBookmarked(reelId: string): boolean {
    return bookmarkedIds.value.has(reelId)
  }

  function toggleBookmark(reel: ReelItem) {
    const index = bookmarks.value.findIndex(b => b.id === reel.id)
    if (index >= 0) {
      bookmarks.value.splice(index, 1)
    } else {
      bookmarks.value.push({
        ...reel,
        bookmarkedAt: new Date().toISOString()
      })
    }
    saveBookmarks()
  }

  function removeBookmark(reelId: string) {
    const index = bookmarks.value.findIndex(b => b.id === reelId)
    if (index >= 0) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
    }
  }

  function setCategory(category: ReelsFilters['category']) {
    filters.value.category = category
  }

  function setSortBy(sortBy: ReelsFilters['sortBy']) {
    filters.value.sortBy = sortBy
  }

  // Persistence
  function saveBookmarks() {
    if (import.meta.client) {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks.value))
    }
  }

  function loadBookmarks() {
    if (import.meta.client) {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      if (saved) {
        try {
          bookmarks.value = JSON.parse(saved)
        } catch {
          bookmarks.value = []
        }
      }
    }
  }

  // Initialize
  loadBookmarks()

  return {
    reels,
    bookmarks,
    filters,
    filteredReels,
    bookmarkedIds,
    bookmarksCount,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    setCategory,
    setSortBy,
    loadBookmarks
  }
})
