<script setup lang="ts">
import PostCard from './PostCard.vue'
import type { CalendarPost, InfoEvent, ContentTag } from '../types'
import { getFunDayForDate } from '../data/funDays'

const props = defineProps<{
  date: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  projectTags: ContentTag[]
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  close: []
  createPost: []
}>()

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
})

const funDay = computed(() => getFunDayForDate(props.date))
</script>

<template>
  <div class="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur">
    <div class="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-medium text-zinc-100">
          {{ formattedDate }}
        </h3>
        <span
          v-if="funDay"
          class="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
        >
          <span v-if="funDay.emoji" class="text-sm">{{ funDay.emoji }}</span>
          <span>{{ funDay.title }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center text-lg font-bold transition-colors"
          @click="emit('createPost')"
          title="Создать пост"
        >
          +
        </button>
        <button
          class="text-zinc-500 hover:text-white transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
    </div>
    <div class="p-4">
      <div v-if="infoEvents.length > 0" class="mb-4">
        <div
          v-for="event in infoEvents"
          :key="event.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <span class="text-amber-400">★</span>
          <span class="text-sm text-amber-200">{{ event.title }}</span>
          <span v-if="event.description" class="text-xs text-zinc-500">
            — {{ event.description }}
          </span>
        </div>
      </div>
      <div v-if="posts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :project-tags="projectTags"
          @select="emit('selectPost', $event)"
        />
      </div>
      <div v-else-if="infoEvents.length === 0" class="text-center py-8 text-zinc-500">
        Нет постов на эту дату
      </div>
    </div>
  </div>
</template>
