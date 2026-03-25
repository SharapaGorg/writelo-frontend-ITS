<script setup lang="ts">
import { ref } from 'vue'
import type { ReelItem } from '../types'
import { CalendarGrid, useContentCalendar } from '~/lib-modules/content-calendar'

const props = defineProps<{
  isOpen: boolean
  reel: ReelItem | null
}>()

const emit = defineEmits<{
  close: []
  drop: [date: string, reel: ReelItem]
}>()

const {
  currentMonth,
  selectedDate,
  getPostsForDate,
  hasInfoEvent,
  nextMonth,
  prevMonth,
  createPost
} = useContentCalendar()

// Local selected date for this modal
const localSelectedDate = ref<string | null>(null)

function handleSelectDate(date: string) {
  localSelectedDate.value = date
}

function handleDropReel(date: string, reel: ReelItem) {
  // Create post from reel
  createPost({
    title: reel.description.slice(0, 50) + (reel.description.length > 50 ? '...' : ''),
    description: reel.description,
    content: `Источник: ${reel.url}\n\nАвтор: ${reel.author}\n\n${reel.description}`,
    type: 'reels',
    status: 'idea',
    networks: ['instagram'],
    tags: [],
    date,
    image: reel.thumbnail,
    sourceReelId: reel.id,
    previews: {
      instagram: { text: reel.description }
    }
  })
  emit('drop', date, reel)
}

function handleCreatePost(date: string) {
  if (props.reel) {
    handleDropReel(date, props.reel)
  }
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="handleOverlayClick"
    >
      <div
        class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
        @dragover.prevent
        @drop.prevent
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">
              Добавить в календарь
            </h2>
            <p v-if="reel" class="text-sm text-zinc-500 mt-0.5 truncate max-w-md">
              {{ reel.description }}
            </p>
          </div>
          <button
            class="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Calendar -->
        <div class="flex-1 overflow-auto p-4">
          <CalendarGrid
            :current-month="currentMonth"
            :selected-date="localSelectedDate"
            :get-posts-for-date="getPostsForDate"
            :has-info-event="hasInfoEvent"
            @select-date="handleSelectDate"
            @prev-month="prevMonth"
            @next-month="nextMonth"
            @drop-reel="handleDropReel"
            @create-post="handleCreatePost"
          />
        </div>

        <!-- Hint -->
        <div class="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <p class="text-sm text-zinc-500 text-center">
            Перетащите рилс на нужный день или кликните на день для добавления
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
