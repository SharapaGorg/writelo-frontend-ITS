<script setup lang="ts">
import TrendChip from './TrendChip.vue'
import type { TrendItem } from '../types'

defineProps<{
  trends: TrendItem[]
  usedTrends: Record<string, string>
}>()
</script>

<template>
  <div class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="px-4 py-2">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <h4 class="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Тренды Twitter
        </h4>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        <TrendChip
          v-for="trend in trends"
          :key="trend.id"
          :trend="trend"
          :used-date="usedTrends[trend.id]"
        />
      </div>
    </div>
  </div>
</template>
