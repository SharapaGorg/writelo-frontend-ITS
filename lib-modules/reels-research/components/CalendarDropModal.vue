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
  getPostsForDate,
  hasInfoEvent,
  nextMonth,
  prevMonth,
  createPost
} = useContentCalendar()

// Local selected date for this panel
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
</script>

<template>
  <Teleport to="body">
    <!-- Sliding panel from right side -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-[420px] z-50 bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-zinc-900 dark:text-white">
                Перетащи на день
              </h2>
              <p class="text-xs text-zinc-500">
                Отпусти рилс на нужную дату
              </p>
            </div>
          </div>
          <button
            class="w-7 h-7 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            @click="emit('close')"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Dragging reel preview -->
        <div v-if="reel" class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center gap-3">
            <img
              :src="reel.thumbnail"
              :alt="reel.description"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {{ reel.author }}
              </p>
              <p class="text-xs text-zinc-500 truncate">
                {{ reel.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <div class="flex-1 overflow-auto">
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
        <div class="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-green-500/10">
          <p class="text-xs text-green-600 dark:text-green-400 text-center font-medium">
            🎯 Отпусти рилс на любой день календаря
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
