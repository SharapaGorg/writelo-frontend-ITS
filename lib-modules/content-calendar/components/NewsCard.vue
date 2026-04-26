<script setup lang="ts">
import { computed } from 'vue'
import type { NewsItem } from '../types'

const props = defineProps<{
  news: NewsItem
  usedDate?: string
}>()

const formattedDate = computed(() => {
  const d = new Date(props.news.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})

const formattedUsedDate = computed(() => {
  if (!props.usedDate) return null
  const d = new Date(props.usedDate)
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
    :class="[
      'p-3 rounded-md border transition-all cursor-grab active:cursor-grabbing group relative',
      usedDate
        ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700/50 hover:border-green-400 dark:hover:border-green-600'
        : 'bg-card border-border hover:border-border'
    ]"
    draggable="true"
    @dragstart="handleDragStart"
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

    <h4 :class="['text-sm font-medium mb-1 line-clamp-2', usedDate ? 'text-muted-foreground' : 'text-foreground']">
      {{ news.title }}
    </h4>
    <p v-if="news.description" class="text-xs text-muted-foreground mb-2 line-clamp-2">
      {{ news.description }}
    </p>
    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ news.source }}</span>
      <span>{{ formattedDate }}</span>
    </div>
    <!-- Link indicator -->
    <div v-if="news.url && !usedDate" class="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
      <span>Есть ссылка</span>
    </div>
  </div>
</template>
