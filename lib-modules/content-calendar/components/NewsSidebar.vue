<script setup lang="ts">
import { ref, computed } from 'vue'
import NewsCard from './NewsCard.vue'
import TrendCard from './TrendCard.vue'
import type { NewsItem, TrendItem } from '../types'

type SourceType = 'google' | 'twitter'

const props = defineProps<{
  news: NewsItem[]
  usedNews: Record<string, string>
  trends: TrendItem[]
  usedTrends: Record<string, string>
}>()

// Active source filters (multiple selection)
const activeSources = ref<SourceType[]>(['google', 'twitter'])

function toggleSource(source: SourceType) {
  const index = activeSources.value.indexOf(source)
  if (index === -1) {
    activeSources.value.push(source)
  } else if (activeSources.value.length > 1) {
    // Keep at least one source active
    activeSources.value.splice(index, 1)
  }
}

function isSourceActive(source: SourceType) {
  return activeSources.value.includes(source)
}

// Combined items for display
interface DisplayItem {
  type: 'news' | 'trend'
  id: string
  data: NewsItem | TrendItem
  usedDate?: string
}

const displayItems = computed<DisplayItem[]>(() => {
  const items: DisplayItem[] = []

  if (isSourceActive('google')) {
    for (const news of props.news) {
      items.push({
        type: 'news',
        id: `news-${news.id}`,
        data: news,
        usedDate: props.usedNews[news.id]
      })
    }
  }

  if (isSourceActive('twitter')) {
    for (const trend of props.trends) {
      items.push({
        type: 'trend',
        id: `trend-${trend.id}`,
        data: trend,
        usedDate: props.usedTrends[trend.id]
      })
    }
  }

  return items
})
</script>

<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <!-- Header with source filters -->
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Актуальное</h3>

      <!-- Source filter chips -->
      <div class="flex gap-2">
        <!-- Google chip -->
        <button
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            isSourceActive('google')
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
          ]"
          @click="toggleSource('google')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <!-- Twitter chip -->
        <button
          :class="[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            isSourceActive('twitter')
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
          ]"
          @click="toggleSource('twitter')"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter
        </button>
      </div>

      <p class="text-xs text-zinc-500 mt-2">Перетащите в календарь для создания идеи</p>
    </div>

    <!-- Combined items list -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
      <template v-for="item in displayItems" :key="item.id">
        <NewsCard
          v-if="item.type === 'news'"
          :news="(item.data as NewsItem)"
          :used-date="item.usedDate"
        />
        <TrendCard
          v-else
          :trend="(item.data as TrendItem)"
          :used-date="item.usedDate"
        />
      </template>

      <!-- Empty state -->
      <div v-if="displayItems.length === 0" class="text-center py-8 text-zinc-400">
        <p class="text-sm">Нет данных для отображения</p>
      </div>
    </div>
  </aside>
</template>
