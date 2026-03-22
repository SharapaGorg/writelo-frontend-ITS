<script setup lang="ts">
import PostCard from './PostCard.vue'
import type { CalendarPost, InfoEvent, ContentTag } from '../types'

const props = defineProps<{
  date: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  projectTags: ContentTag[]
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  close: []
}>()

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur">
    <div class="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-100">
        {{ formattedDate }}
      </h3>
      <button
        class="text-zinc-500 hover:text-white transition-colors"
        @click="emit('close')"
      >
        ✕
      </button>
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
