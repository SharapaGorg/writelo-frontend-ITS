<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import SocialFilters from './SocialFilters.vue'
import CalendarGrid from './CalendarGrid.vue'
import DayDetailPanel from './DayDetailPanel.vue'
import NewsSidebar from './NewsSidebar.vue'
import PostPreviewPanel from './PostPreviewPanel.vue'
import { useContentCalendar } from '../composables/useContentCalendar'

const {
  selectedProjectId,
  selectedDate,
  selectedPostId,
  activeNetworks,
  currentMonth,
  currentProject,
  postsForSelectedDate,
  infoEventsForSelectedDate,
  selectedPost,
  getPostsForDate,
  hasInfoEvent,
  selectProject,
  selectDate,
  selectPost,
  toggleNetwork,
  nextMonth,
  prevMonth,
  projects
} = useContentCalendar()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (selectedPostId.value) {
      selectPost(null)
    } else if (selectedDate.value) {
      selectDate(null)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
    <CalendarHeader
      :projects="projects"
      :selected-project-id="selectedProjectId"
      @update:selected-project-id="selectProject"
    />
    <SocialFilters
      :active-networks="activeNetworks"
      @toggle="toggleNetwork"
    />
    <div class="flex-1 flex overflow-hidden">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 p-4">
          <CalendarGrid
            :current-month="currentMonth"
            :selected-date="selectedDate"
            :get-posts-for-date="getPostsForDate"
            :has-info-event="hasInfoEvent"
            @select-date="selectDate"
            @prev-month="prevMonth"
            @next-month="nextMonth"
          />
        </div>
        <DayDetailPanel
          v-if="selectedDate"
          :date="selectedDate"
          :posts="postsForSelectedDate"
          :info-events="infoEventsForSelectedDate"
          @select-post="selectPost"
          @close="selectDate(null)"
        />
      </div>
      <PostPreviewPanel
        v-if="selectedPost"
        :post="selectedPost"
        @close="selectPost(null)"
      />
      <NewsSidebar
        v-else
        :news="currentProject.news"
      />
    </div>
  </div>
</template>
