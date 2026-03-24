<script setup lang="ts">
import NewsCard from './NewsCard.vue'
import type { NewsItem } from '../types'

const props = defineProps<{
  news: NewsItem[]
  usedNews: Record<string, string>
}>()
</script>

<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Новости отрасли</h3>
      <p class="text-xs text-zinc-500 mt-0.5">Перетащите в календарь для создания идеи</p>
    </div>
    <div class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
      <NewsCard
        v-for="item in news"
        :key="item.id"
        :news="item"
        :used-date="usedNews[item.id]"
      />
    </div>
  </aside>
</template>
