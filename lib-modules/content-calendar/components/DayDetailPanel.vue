<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PostCard from './PostCard.vue'
import type { CalendarPost, InfoEvent, ContentTag, SocialAccount } from '../types'
import { getFunDayForDate } from '../data/funDays'

const { t, locale } = useI18n()

const props = defineProps<{
  date: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  projectTags: ContentTag[]
  accounts: SocialAccount[]
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  close: []
  createPost: []
}>()

const formattedDate = computed(() => {
  const d = new Date(props.date)
  const tag = locale.value === 'en' ? 'en-US' : 'ru-RU'
  return d.toLocaleDateString(tag, { day: 'numeric', month: 'long', year: 'numeric' })
})

const funDay = computed(() => getFunDayForDate(props.date))
</script>

<template>
  <div class="border-t border-border bg-card/80 backdrop-blur">
    <div class="flex items-center justify-between px-6 py-3 border-b border-border">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-medium text-foreground">
          {{ formattedDate }}
        </h3>
        <span
          v-if="funDay"
          class="px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30 text-xs text-primary flex items-center gap-1.5"
        >
          <span v-if="funDay.emoji" class="text-sm">{{ funDay.emoji }}</span>
          <span>{{ funDay.title }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="w-7 h-7 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground flex items-center justify-center transition-colors"
          @click="emit('createPost')"
          :title="t('calendarPage.createPostTooltip')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          class="text-muted-foreground hover:text-foreground transition-colors"
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
          class="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30"
        >
          <span class="text-amber-400">★</span>
          <span class="text-sm text-amber-200">{{ event.title }}</span>
          <span v-if="event.description" class="text-xs text-muted-foreground">
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
          :accounts="accounts"
          @select="emit('selectPost', $event)"
        />
      </div>
      <div v-else-if="infoEvents.length === 0" class="text-center py-8 text-muted-foreground">
        {{ t('calendarPage.noPostsForDate') }}
      </div>
    </div>
  </div>
</template>
