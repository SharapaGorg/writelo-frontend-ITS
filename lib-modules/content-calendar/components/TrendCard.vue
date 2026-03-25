<script setup lang="ts">
import { computed } from 'vue'
import type { TrendItem } from '../types'

const props = defineProps<{
  trend: TrendItem
  usedDate?: string
}>()

const formattedCount = computed(() => {
  const count = props.trend.tweetsCount
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
})

const formattedUsedDate = computed(() => {
  if (!props.usedDate) return null
  const d = new Date(props.usedDate)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})

const displayName = computed(() => {
  return props.trend.hashtag || props.trend.name
})

function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...props.trend,
      _type: 'trend'
    }))
    e.dataTransfer.setData('text/plain', props.trend.name)
  }
}

function handleClick() {
  if (props.trend.url) {
    window.open(props.trend.url, '_blank')
  }
}
</script>

<template>
  <div
    :class="[
      'p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing group relative',
      usedDate
        ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700/50 hover:border-green-400 dark:hover:border-green-600'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-600'
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @click="handleClick"
  >
    <!-- Used badge -->
    <div
      v-if="usedDate"
      class="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-medium flex items-center gap-1"
    >
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      {{ formattedUsedDate }}
    </div>

    <!-- Twitter icon + title -->
    <div class="flex items-start gap-2 mb-1">
      <svg class="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      <h4 :class="['text-sm font-medium line-clamp-2', usedDate ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-800 dark:text-zinc-200']">
        {{ displayName }}
      </h4>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-between text-xs text-zinc-500">
      <span class="text-blue-500 dark:text-blue-400">{{ formattedCount }} твитов</span>
      <span>{{ trend.category }}</span>
    </div>

    <!-- Link indicator -->
    <div v-if="trend.url && !usedDate" class="mt-2 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
      <span>Открыть в Twitter</span>
    </div>
  </div>
</template>
