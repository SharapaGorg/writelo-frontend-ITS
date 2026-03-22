<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '../types'

const props = defineProps<{
  news: NewsItem
}>()

const formattedDate = computed(() => {
  const d = new Date(props.news.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})

function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify(props.news))
    e.dataTransfer.setData('text/plain', props.news.title)
  }
}
</script>

<template>
  <div
    class="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <h4 class="text-sm font-medium text-zinc-200 mb-1 line-clamp-2">
      {{ news.title }}
    </h4>
    <div class="flex items-center justify-between text-xs text-zinc-500">
      <span>{{ news.source }}</span>
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>
