<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

// Random position for floating island
const islandPosition = ref({ top: 100, left: 100 })

function calculateRandomPosition() {
  // Island dimensions
  const islandWidth = 620
  const islandHeight = 700

  // Screen dimensions with padding
  const padding = 40
  const maxX = window.innerWidth - islandWidth - padding
  const maxY = window.innerHeight - islandHeight - padding

  // Random position within safe bounds
  // Prefer right side of screen (where user is less likely to have mouse when dragging from left)
  const minX = Math.max(padding, window.innerWidth * 0.4) // Start from 40% of screen
  const left = Math.floor(Math.random() * (maxX - minX) + minX)
  const top = Math.floor(Math.random() * (maxY - padding) + padding)

  islandPosition.value = { top, left }
}

// Recalculate position when opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    calculateRandomPosition()
  }
})

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
    <!-- Floating calendar island with rainbow border -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="isOpen"
        class="calendar-island fixed z-50 w-[620px]"
        :style="{ top: islandPosition.top + 'px', left: islandPosition.left + 'px' }"
      >
        <!-- Rainbow border wrapper -->
        <div class="rainbow-island-border rounded-2xl p-[3px]">
          <div class="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-sm font-semibold text-zinc-900 dark:text-white">
                    Брось на день
                  </h2>
                  <p class="text-xs text-zinc-500">
                    Перетащи рилс сюда
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

            <!-- Calendar -->
            <div class="p-2">
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
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Rainbow animated border for the island */
.rainbow-island-border {
  background: conic-gradient(
    from var(--island-angle, 0deg),
    #ff6b6b 0deg,
    #ffd93d 60deg,
    #6bcf7f 120deg,
    #4d96ff 180deg,
    #9b59b6 240deg,
    #ff6b6b 300deg,
    #ff6b6b 360deg
  );
  animation: rotate-island-gradient 2s linear infinite;
}

@keyframes rotate-island-gradient {
  0% {
    --island-angle: 0deg;
  }
  100% {
    --island-angle: 360deg;
  }
}

@property --island-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Glow effect */
.calendar-island {
  filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))
          drop-shadow(0 0 40px rgba(59, 130, 246, 0.2));
}
</style>
