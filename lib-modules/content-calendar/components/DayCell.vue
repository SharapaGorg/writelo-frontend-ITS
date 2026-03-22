<script setup lang="ts">
import type { CalendarPost } from '../types'

const props = defineProps<{
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  posts: CalendarPost[]
  hasInfoEvent: boolean
}>()

const emit = defineEmits<{
  select: [date: string]
}>()

const contentTypeColors: Record<string, string> = {
  post: 'bg-blue-500',
  story: 'bg-purple-500',
  reels: 'bg-pink-500'
}

// Show max 3 dots
const visiblePosts = computed(() => props.posts.slice(0, 3))
const hasMore = computed(() => props.posts.length > 3)
</script>

<template>
  <button
    :class="[
      'relative h-24 p-2 text-left transition-all border rounded-lg',
      isCurrentMonth ? 'bg-zinc-900' : 'bg-zinc-950 opacity-40',
      isSelected ? 'border-purple-500 ring-1 ring-purple-500' : 'border-zinc-800 hover:border-zinc-600',
      isToday && !isSelected ? 'border-purple-500/50' : ''
    ]"
    @click="emit('select', date)"
  >
    <!-- Day number -->
    <span
      :class="[
        'text-sm font-medium',
        isToday ? 'text-purple-400' : isCurrentMonth ? 'text-zinc-300' : 'text-zinc-600'
      ]"
    >
      {{ dayNumber }}
    </span>

    <!-- Info event marker -->
    <span
      v-if="hasInfoEvent"
      class="absolute top-2 right-2 text-amber-400 text-xs"
      title="Инфоповод"
    >
      ★
    </span>

    <!-- Post dots -->
    <div class="absolute bottom-2 left-2 flex gap-1 flex-wrap">
      <span
        v-for="post in visiblePosts"
        :key="post.id"
        :class="['w-2 h-2 rounded-full', contentTypeColors[post.type]]"
        :title="post.title"
      />
      <span v-if="hasMore" class="text-xs text-zinc-500">+{{ posts.length - 3 }}</span>
    </div>
  </button>
</template>
