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
      _type: 'trend'  // Mark as trend for drop handler
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
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-grab active:cursor-grabbing transition-all whitespace-nowrap',
      usedDate
        ? 'bg-emerald-500 text-white'
        : 'bg-blue-500 text-white hover:bg-blue-600'
    ]"
    draggable="true"
    :title="usedDate ? `Добавлено ${formattedUsedDate}` : `${trend.category} • ${trend.tweetsCount.toLocaleString()} твитов`"
    @dragstart="handleDragStart"
    @click="handleClick"
  >
    <!-- Checkmark for used state -->
    <svg
      v-if="usedDate"
      class="w-3.5 h-3.5 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>

    <span class="truncate max-w-[120px]">{{ displayName }}</span>
    <span class="text-white/80 text-xs">{{ formattedCount }}</span>
  </div>
</template>
