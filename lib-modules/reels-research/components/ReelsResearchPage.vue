<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'
import CalendarDropModal from './CalendarDropModal.vue'
import type { ReelItem } from '../types'

const store = useReelsResearchStore()

const isCalendarOpen = ref(false)
const draggingReel = ref<ReelItem | null>(null)
const wasDropped = ref(false)

// Open calendar on mousedown
function handleMouseDown(reel: ReelItem) {
  draggingReel.value = reel
  wasDropped.value = false
  isCalendarOpen.value = true
}

// Close calendar on global mouseup (unless dropped)
function handleGlobalMouseUp() {
  if (!isCalendarOpen.value) return

  // Small delay to let drop event fire first
  setTimeout(() => {
    if (!wasDropped.value) {
      isCalendarOpen.value = false
      draggingReel.value = null
    }
    wasDropped.value = false
  }, 50)
}

onMounted(() => {
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})

function handleDrop(date: string, reel: ReelItem) {
  wasDropped.value = true
  console.log('Created post from reel:', reel.description, 'on date:', date)
  isCalendarOpen.value = false
  draggingReel.value = null
}

function handlePanelClose() {
  isCalendarOpen.value = false
  draggingReel.value = null
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Исследование Reels
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Анализируй популярные рилсы и перетаскивай в календарь
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <ReelsFilters />
      </div>

      <!-- Grid -->
      <ReelsGrid
        @mouse-down="handleMouseDown"
      />

      <!-- Calendar Drop Panel (slides from right) -->
      <CalendarDropModal
        :is-open="isCalendarOpen"
        :reel="draggingReel"
        @close="handlePanelClose"
        @drop="handleDrop"
      />
    </div>
  </div>
</template>
