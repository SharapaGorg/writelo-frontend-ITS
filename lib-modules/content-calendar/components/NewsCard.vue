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
    class="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing group"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <h4 class="text-sm font-medium text-zinc-200 mb-1 line-clamp-2">
      {{ news.title }}
    </h4>
    <p v-if="news.description" class="text-xs text-zinc-400 mb-2 line-clamp-2">
      {{ news.description }}
    </p>
    <div class="flex items-center justify-between text-xs text-zinc-500">
      <span>{{ news.source }}</span>
      <span>{{ formattedDate }}</span>
    </div>
    <!-- Link indicator -->
    <div v-if="news.url" class="mt-2 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
      <span>Есть ссылка</span>
    </div>
  </div>
</template>
