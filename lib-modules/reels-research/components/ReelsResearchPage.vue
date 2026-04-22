<script setup lang="ts">
import { ref } from 'vue'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import { useContentCalendar } from '~/lib-modules/content-calendar'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'
import CalendarDropModal from './CalendarDropModal.vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import type { ReelItem } from '../types'

const store = useReelsResearchStore()
const { createPost, currentProject } = useContentCalendar()

const isCalendarOpen = ref(false)
const draggingReel = ref<ReelItem | null>(null)

function handleDragStart(reel: ReelItem) {
  draggingReel.value = reel
  isCalendarOpen.value = true
}

function handleDragEnd(reel: ReelItem, x: number, y: number) {
  // Find if we dropped on a calendar day cell
  const elements = document.elementsFromPoint(x, y)
  const dayCell = elements.find(el => el.hasAttribute('data-calendar-date'))

  if (dayCell) {
    const date = dayCell.getAttribute('data-calendar-date')
    if (date) {
      handleDrop(date, reel)
      return
    }
  }

  // No valid drop target - close calendar
  isCalendarOpen.value = false
  draggingReel.value = null
}

function handleDrop(date: string, reel: ReelItem) {
  const instagramAccountIds = currentProject.value.accounts
    .filter(account => account.network === 'instagram')
    .map(account => account.id)

  // Create post from reel
  createPost({
    title: reel.description.slice(0, 50) + (reel.description.length > 50 ? '...' : ''),
    description: reel.description,
    content: `Источник: ${reel.url}\n\nАвтор: ${reel.author}\n\n${reel.description}`,
    type: 'reels',
    status: 'idea',
    accountIds: instagramAccountIds,
    tags: [],
    date,
    image: reel.thumbnail,
    sourceReelId: reel.id,
    previews: {
      instagram: { text: reel.description }
    }
  })

  isCalendarOpen.value = false
  draggingReel.value = null
}

function handlePanelClose() {
  isCalendarOpen.value = false
  draggingReel.value = null
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar :breadcrumbs="[{ label: 'Тренды' }]" />
    <div class="max-w-7xl mx-auto w-full px-4 py-6">
      <!-- Filters -->
      <div class="mb-6">
        <ReelsFilters />
      </div>

      <!-- Grid -->
      <ReelsGrid
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
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
