# Reels Research Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a page for researching Instagram Reels with bookmarking and calendar integration.

**Architecture:** New `lib-modules/reels-research/` module with Pinia store, demo data, and integration with content-calendar sidebar. Bookmarks persisted via localStorage.

**Tech Stack:** Vue 3, Nuxt 3, Pinia, Tailwind CSS

---

## Task 1: Create Types

**Files:**
- Create: `lib-modules/reels-research/types/index.ts`

**Step 1: Create types file**

```typescript
export type ReelCategory = 'trending' | 'educational' | 'entertainment' | 'lifestyle' | 'business'

export interface ReelItem {
  id: string
  url: string
  author: string
  authorAvatar?: string
  description: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  category: ReelCategory
}

export interface BookmarkedReel extends ReelItem {
  bookmarkedAt: string
}

export interface ReelsFilters {
  category: ReelCategory | 'all'
  sortBy: 'views' | 'likes' | 'comments'
}
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/types/index.ts
git commit -m "feat(reels-research): add types"
```

---

## Task 2: Create Demo Data

**Files:**
- Create: `lib-modules/reels-research/data/demoReels.ts`

**Step 1: Create demo data file**

```typescript
import type { ReelItem } from '../types'

export const demoReels: ReelItem[] = [
  // Trending (high views)
  {
    id: 'reel-1',
    url: 'https://instagram.com/reel/ABC123',
    author: '@viral_content',
    authorAvatar: 'https://placehold.co/100x100/e91e63/ffffff?text=V',
    description: 'POV: когда наконец понял как работает алгоритм',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Viral',
    views: 2500000,
    likes: 180000,
    comments: 4200,
    category: 'trending'
  },
  {
    id: 'reel-2',
    url: 'https://instagram.com/reel/DEF456',
    author: '@trends_daily',
    authorAvatar: 'https://placehold.co/100x100/9c27b0/ffffff?text=T',
    description: 'Этот тренд взорвал интернет за 24 часа',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Trend',
    views: 1800000,
    likes: 145000,
    comments: 3100,
    category: 'trending'
  },
  {
    id: 'reel-3',
    url: 'https://instagram.com/reel/GHI789',
    author: '@meme_lord',
    authorAvatar: 'https://placehold.co/100x100/673ab7/ffffff?text=M',
    description: 'Когда код скомпилировался с первого раза',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Meme',
    views: 3200000,
    likes: 290000,
    comments: 8900,
    category: 'trending'
  },

  // Educational
  {
    id: 'reel-4',
    url: 'https://instagram.com/reel/JKL012',
    author: '@marketing_pro',
    authorAvatar: 'https://placehold.co/100x100/2196f3/ffffff?text=MP',
    description: '3 хука для рилсов которые гарантированно залетят',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Hooks',
    views: 450000,
    likes: 38000,
    comments: 890,
    category: 'educational'
  },
  {
    id: 'reel-5',
    url: 'https://instagram.com/reel/MNO345',
    author: '@smm_school',
    authorAvatar: 'https://placehold.co/100x100/03a9f4/ffffff?text=SS',
    description: 'Как я вырастил аккаунт с 0 до 100К за 3 месяца',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Growth',
    views: 890000,
    likes: 72000,
    comments: 2100,
    category: 'educational'
  },
  {
    id: 'reel-6',
    url: 'https://instagram.com/reel/PQR678',
    author: '@content_tips',
    authorAvatar: 'https://placehold.co/100x100/00bcd4/ffffff?text=CT',
    description: 'Формула идеального рилса: структура на 100%',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Formula',
    views: 670000,
    likes: 54000,
    comments: 1450,
    category: 'educational'
  },

  // Entertainment
  {
    id: 'reel-7',
    url: 'https://instagram.com/reel/STU901',
    author: '@comedy_king',
    authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=CK',
    description: 'Типы людей в офисе часть 47',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Office',
    views: 1200000,
    likes: 156000,
    comments: 3400,
    category: 'entertainment'
  },
  {
    id: 'reel-8',
    url: 'https://instagram.com/reel/VWX234',
    author: '@fun_videos',
    authorAvatar: 'https://placehold.co/100x100/8bc34a/ffffff?text=FV',
    description: 'Ожидание vs Реальность: удалёнка',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Remote',
    views: 980000,
    likes: 89000,
    comments: 2100,
    category: 'entertainment'
  },
  {
    id: 'reel-9',
    url: 'https://instagram.com/reel/YZA567',
    author: '@sketch_master',
    authorAvatar: 'https://placehold.co/100x100/cddc39/000000?text=SM',
    description: 'Если бы собеседования были честными',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Interview',
    views: 2100000,
    likes: 198000,
    comments: 5600,
    category: 'entertainment'
  },

  // Lifestyle
  {
    id: 'reel-10',
    url: 'https://instagram.com/reel/BCD890',
    author: '@morning_routine',
    authorAvatar: 'https://placehold.co/100x100/ff9800/ffffff?text=MR',
    description: 'Моё продуктивное утро 5 AM клуб',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Morning',
    views: 560000,
    likes: 67000,
    comments: 890,
    category: 'lifestyle'
  },
  {
    id: 'reel-11',
    url: 'https://instagram.com/reel/EFG123',
    author: '@healthy_life',
    authorAvatar: 'https://placehold.co/100x100/ff5722/ffffff?text=HL',
    description: 'Что я ем за день как фитнес-блогер',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Food',
    views: 780000,
    likes: 82000,
    comments: 1200,
    category: 'lifestyle'
  },
  {
    id: 'reel-12',
    url: 'https://instagram.com/reel/HIJ456',
    author: '@travel_diary',
    authorAvatar: 'https://placehold.co/100x100/795548/ffffff?text=TD',
    description: 'Скрытые места Питера которые вы не видели',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=SPB',
    views: 920000,
    likes: 94000,
    comments: 1800,
    category: 'lifestyle'
  },

  // Business
  {
    id: 'reel-13',
    url: 'https://instagram.com/reel/KLM789',
    author: '@startup_ceo',
    authorAvatar: 'https://placehold.co/100x100/607d8b/ffffff?text=SC',
    description: 'Как я продал стартап за 1 млн $ в 25 лет',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Startup',
    views: 340000,
    likes: 28000,
    comments: 890,
    category: 'business'
  },
  {
    id: 'reel-14',
    url: 'https://instagram.com/reel/NOP012',
    author: '@money_mindset',
    authorAvatar: 'https://placehold.co/100x100/9e9e9e/ffffff?text=MM',
    description: '5 привычек миллионеров которые изменят вашу жизнь',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Habits',
    views: 520000,
    likes: 41000,
    comments: 670,
    category: 'business'
  },
  {
    id: 'reel-15',
    url: 'https://instagram.com/reel/QRS345',
    author: '@entrepreneur_daily',
    authorAvatar: 'https://placehold.co/100x100/455a64/ffffff?text=ED',
    description: 'Мой доход с нуля: честная история',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Income',
    views: 680000,
    likes: 52000,
    comments: 1100,
    category: 'business'
  }
]
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/data/demoReels.ts
git commit -m "feat(reels-research): add demo reels data"
```

---

## Task 3: Create Pinia Store

**Files:**
- Create: `lib-modules/reels-research/stores/reelsResearchStore.ts`

**Step 1: Create store**

```typescript
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

    // Filter by category
    if (filters.value.category !== 'all') {
      result = result.filter(r => r.category === filters.value.category)
    }

    // Sort
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
    // State
    reels,
    bookmarks,
    filters,
    // Getters
    filteredReels,
    bookmarkedIds,
    bookmarksCount,
    // Actions
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    setCategory,
    setSortBy,
    loadBookmarks
  }
})
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/stores/reelsResearchStore.ts
git commit -m "feat(reels-research): add Pinia store with persistence"
```

---

## Task 4: Create ReelCard Component

**Files:**
- Create: `lib-modules/reels-research/components/ReelCard.vue`

**Step 1: Create component**

```vue
<script setup lang="ts">
import type { ReelItem } from '../types'
import { useReelsResearchStore } from '../stores/reelsResearchStore'

const props = defineProps<{
  reel: ReelItem
}>()

const store = useReelsResearchStore()

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function openReel() {
  window.open(props.reel.url, '_blank')
}
</script>

<template>
  <div
    class="group relative bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
    @click="openReel"
  >
    <!-- Thumbnail -->
    <div class="aspect-[9/16] relative">
      <img
        :src="reel.thumbnail"
        :alt="reel.description"
        class="w-full h-full object-cover"
      />
      <!-- Overlay on hover -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

      <!-- Play icon -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <svg class="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <!-- Bookmark button -->
      <button
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center transition-colors z-10"
        :class="store.isBookmarked(reel.id) ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
        @click.stop="store.toggleBookmark(reel)"
        :title="store.isBookmarked(reel.id) ? 'Удалить из закладок' : 'В закладки'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" :fill="store.isBookmarked(reel.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <!-- Views badge -->
      <div class="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs flex items-center gap-1">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ formatNumber(reel.views) }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <!-- Author -->
      <div class="flex items-center gap-2 mb-2">
        <img
          v-if="reel.authorAvatar"
          :src="reel.authorAvatar"
          :alt="reel.author"
          class="w-6 h-6 rounded-full"
        />
        <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400">{{ reel.author }}</span>
      </div>

      <!-- Description -->
      <p class="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2">
        {{ reel.description }}
      </p>

      <!-- Metrics -->
      <div class="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {{ formatNumber(reel.likes) }}
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {{ formatNumber(reel.comments) }}
        </span>
      </div>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/components/ReelCard.vue
git commit -m "feat(reels-research): add ReelCard component"
```

---

## Task 5: Create ReelsFilters Component

**Files:**
- Create: `lib-modules/reels-research/components/ReelsFilters.vue`

**Step 1: Create component**

```vue
<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import type { ReelCategory, ReelsFilters } from '../types'

const store = useReelsResearchStore()

const categories: { value: ReelsFilters['category']; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'trending', label: 'Трендовые' },
  { value: 'educational', label: 'Обучающие' },
  { value: 'entertainment', label: 'Развлекательные' },
  { value: 'lifestyle', label: 'Лайфстайл' },
  { value: 'business', label: 'Бизнес' }
]

const sortOptions: { value: ReelsFilters['sortBy']; label: string }[] = [
  { value: 'views', label: 'Просмотры' },
  { value: 'likes', label: 'Лайки' },
  { value: 'comments', label: 'Комментарии' }
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <!-- Category filters -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="[
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          store.filters.category === cat.value
            ? 'bg-purple-600 text-white'
            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
        ]"
        @click="store.setCategory(cat.value)"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Sort -->
    <div class="flex items-center gap-2 ml-auto">
      <span class="text-sm text-zinc-500 dark:text-zinc-400">Сортировка:</span>
      <select
        :value="store.filters.sortBy"
        class="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm border-none focus:ring-2 focus:ring-purple-500"
        @change="store.setSortBy(($event.target as HTMLSelectElement).value as ReelsFilters['sortBy'])"
      >
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/components/ReelsFilters.vue
git commit -m "feat(reels-research): add ReelsFilters component"
```

---

## Task 6: Create ReelsGrid Component

**Files:**
- Create: `lib-modules/reels-research/components/ReelsGrid.vue`

**Step 1: Create component**

```vue
<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'

const store = useReelsResearchStore()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.id"
      :reel="reel"
    />
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/components/ReelsGrid.vue
git commit -m "feat(reels-research): add ReelsGrid component"
```

---

## Task 7: Create ReelsResearchPage

**Files:**
- Create: `lib-modules/reels-research/components/ReelsResearchPage.vue`

**Step 1: Create page component**

```vue
<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'

const store = useReelsResearchStore()
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Исследование Reels
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Анализируй популярные рилсы и сохраняй лучшие идеи
          </p>
        </div>

        <!-- Bookmarks counter -->
        <NuxtLink
          to="/app/workspace"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <svg class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {{ store.bookmarksCount }} в закладках
          </span>
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <ReelsFilters />
      </div>

      <!-- Grid -->
      <ReelsGrid />
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/components/ReelsResearchPage.vue
git commit -m "feat(reels-research): add ReelsResearchPage component"
```

---

## Task 8: Create Module Index

**Files:**
- Create: `lib-modules/reels-research/index.ts`

**Step 1: Create index file**

```typescript
export * from './types'
export { demoReels } from './data/demoReels'
export { useReelsResearchStore } from './stores/reelsResearchStore'
export { default as ReelsResearchPage } from './components/ReelsResearchPage.vue'
export { default as ReelCard } from './components/ReelCard.vue'
```

**Step 2: Commit**

```bash
git add lib-modules/reels-research/index.ts
git commit -m "feat(reels-research): add module public API"
```

---

## Task 9: Create Page Route

**Files:**
- Create: `pages/app/reels-research.vue`

**Step 1: Create page**

```vue
<script setup lang="ts">
import { ReelsResearchPage } from '~/lib-modules/reels-research'

definePageMeta({
  layout: 'app'
})
</script>

<template>
  <ReelsResearchPage />
</template>
```

**Step 2: Commit**

```bash
git add pages/app/reels-research.vue
git commit -m "feat(reels-research): add page route"
```

---

## Task 10: Create BookmarksSidebar Component

**Files:**
- Create: `lib-modules/reels-research/components/BookmarksSidebar.vue`

**Step 1: Create sidebar component for calendar integration**

```vue
<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import type { BookmarkedReel } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  dragStart: [reel: BookmarkedReel, event: DragEvent]
}>()

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function onDragStart(reel: BookmarkedReel, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'reel',
      reel
    }))
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('dragStart', reel, event)
}
</script>

<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Закладки Reels</h3>
      <p class="text-xs text-zinc-500 mt-0.5">Перетащите в календарь для создания идеи</p>
    </div>

    <div
      v-if="store.bookmarks.length === 0"
      class="flex-1 flex items-center justify-center p-4"
    >
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Нет закладок</p>
        <NuxtLink
          to="/app/reels-research"
          class="text-xs text-purple-500 hover:text-purple-400 mt-1 inline-block"
        >
          Перейти к исследованию
        </NuxtLink>
      </div>
    </div>

    <div
      v-else
      class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
    >
      <div
        v-for="reel in store.bookmarks"
        :key="reel.id"
        draggable="true"
        class="flex gap-3 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-colors"
        @dragstart="onDragStart(reel, $event)"
      >
        <!-- Thumbnail -->
        <div class="w-12 h-16 rounded overflow-hidden flex-shrink-0">
          <img :src="reel.thumbnail" :alt="reel.description" class="w-full h-full object-cover" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">{{ reel.author }}</p>
          <p class="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">{{ reel.description }}</p>
          <div class="flex items-center gap-2 mt-1 text-xs text-zinc-400">
            <span>{{ formatNumber(reel.views) }} views</span>
          </div>
        </div>

        <!-- Remove button -->
        <button
          class="self-start p-1 text-zinc-400 hover:text-red-500 transition-colors"
          title="Удалить из закладок"
          @click="store.removeBookmark(reel.id)"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
```

**Step 2: Update module index**

Add to `lib-modules/reels-research/index.ts`:

```typescript
export { default as BookmarksSidebar } from './components/BookmarksSidebar.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/reels-research/components/BookmarksSidebar.vue lib-modules/reels-research/index.ts
git commit -m "feat(reels-research): add BookmarksSidebar for calendar integration"
```

---

## Task 11: Integrate with Calendar Sidebar

**Files:**
- Modify: `lib-modules/content-calendar/components/SidebarContainer.vue`

**Step 1: Add bookmarks tab**

Import BookmarksSidebar and add new tab option. The SidebarContainer needs:

1. Import `BookmarksSidebar` from reels-research module
2. Add 'bookmarks' to activeTab type
3. Add third tab button "Закладки"
4. Render `BookmarksSidebar` when activeTab === 'bookmarks'

Changes to make:

```vue
// In <script setup>
import { BookmarksSidebar } from '~/lib-modules/reels-research'

// Change activeTab type
const activeTab = ref<'context' | 'news' | 'bookmarks'>('news')

// In watch, update default:
if (!newDate && !newPost) {
  activeTab.value = 'news'
}
```

Add third tab button after "Новости" button:

```vue
<button
  :class="[
    'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
    activeTab === 'bookmarks'
      ? 'text-zinc-900 dark:text-white border-b-2 border-purple-500 bg-zinc-200/50 dark:bg-zinc-800/50'
      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
  ]"
  @click="activeTab = 'bookmarks'"
>
  Закладки
</button>
```

Add BookmarksSidebar render condition in content area (before `NewsSidebar`):

```vue
<!-- Bookmarks Sidebar -->
<BookmarksSidebar
  v-else-if="activeTab === 'bookmarks'"
  class="h-full"
/>

<!-- News Sidebar -->
<NewsSidebar
  v-else
  ...
/>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/SidebarContainer.vue
git commit -m "feat(content-calendar): integrate reels bookmarks tab in sidebar"
```

---

## Task 12: Handle Reel Drop on Calendar

**Files:**
- Modify: `lib-modules/content-calendar/composables/useContentCalendar.ts`

**Step 1: Check current drop handling logic**

Need to examine current composable to understand how drops are handled and add reel-to-post conversion.

**Step 2: Add reel drop handler**

Add function to create post from reel:

```typescript
function createPostFromReel(reel: BookmarkedReel, date: string): CalendarPost {
  return {
    id: generateUUID(),
    title: reel.description.slice(0, 50) + (reel.description.length > 50 ? '...' : ''),
    description: reel.description,
    content: `Источник: ${reel.url}\n\nАвтор: ${reel.author}\n\n${reel.description}`,
    type: 'reels',
    status: 'idea',
    networks: ['instagram'],
    tags: [],
    date,
    image: reel.thumbnail,
    sourceReelId: reel.id,
    previews: {
      instagram: {
        text: reel.description
      }
    }
  }
}
```

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/composables/useContentCalendar.ts
git commit -m "feat(content-calendar): add reel-to-post creation on drop"
```

---

## Task 13: Update CalendarPost Type

**Files:**
- Modify: `lib-modules/content-calendar/types/index.ts`

**Step 1: Add sourceReelId field**

Add optional field to CalendarPost:

```typescript
export interface CalendarPost {
  // ... existing fields
  sourceReelId?: string // Link to reel this was created from
}
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/types/index.ts
git commit -m "feat(content-calendar): add sourceReelId to CalendarPost type"
```

---

## Task 14: Verify and Test

**Step 1: Run dev server**

```bash
yarn dev
```

**Step 2: Manual testing checklist**

- [ ] Navigate to `/app/reels-research` — page loads
- [ ] Category filters work
- [ ] Sort dropdown works
- [ ] Click bookmark button — reel added to bookmarks
- [ ] Bookmarks counter updates
- [ ] Navigate to `/app/workspace` (calendar)
- [ ] Bookmarks tab appears in sidebar
- [ ] Bookmarked reels visible
- [ ] Drag reel to calendar date
- [ ] Post created with type 'reels'

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(reels-research): complete module implementation"
```

---

## Summary

Total tasks: 14
Key files created:
- `lib-modules/reels-research/` — new module
- `pages/app/reels-research.vue` — route

Integration points:
- `SidebarContainer.vue` — bookmarks tab
- `useContentCalendar.ts` — reel drop handling
- `CalendarPost` type — sourceReelId field
