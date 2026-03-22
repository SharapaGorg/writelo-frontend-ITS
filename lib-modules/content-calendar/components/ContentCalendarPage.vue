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
  activeStatuses,
  activeTags,
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
  toggleStatus,
  toggleTag,
  nextMonth,
  prevMonth,
  projects
} = useContentCalendar()

const statusConfig = [
  { id: 'idea' as const, label: 'Идея', icon: 'idea', color: 'text-zinc-400' },
  { id: 'draft' as const, label: 'Черновик', icon: 'draft', color: 'text-yellow-500' },
  { id: 'ready' as const, label: 'Готов', icon: 'ready', color: 'text-green-500' }
]

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
  <div class="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
    <CalendarHeader
      :projects="projects"
      :selected-project-id="selectedProjectId"
      @update:selected-project-id="selectProject"
    />
    <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
      <div class="flex items-center gap-6">
        <SocialFilters
          :active-networks="activeNetworks"
          @toggle="toggleNetwork"
        />
        <!-- Status filter -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-zinc-500">Статус:</span>
          <button
            v-for="status in statusConfig"
            :key="status.id"
            :class="[
              'px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5',
              activeStatuses.includes(status.id)
                ? 'bg-zinc-700 border-zinc-600 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'
            ]"
            @click="toggleStatus(status.id)"
          >
            <!-- Idea: lightbulb -->
            <svg v-if="status.icon === 'idea'" :class="['w-4 h-4', status.color]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
            </svg>
            <!-- Draft: half-filled circle -->
            <svg v-else-if="status.icon === 'draft'" :class="['w-4 h-4', status.color]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor"/>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <!-- Ready: checkmark in circle -->
            <svg v-else-if="status.icon === 'ready'" :class="['w-4 h-4', status.color]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ status.label }}</span>
          </button>
        </div>
      </div>
      <!-- Content type legend -->
      <div class="flex items-center gap-4 text-sm text-zinc-400">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Пост</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Сторис</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <span>Рилс</span>
        </div>
      </div>
    </div>
    <!-- Tag filter -->
    <div class="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
      <span class="text-sm text-zinc-500">Теги:</span>
      <button
        v-for="tag in currentProject.tags"
        :key="tag.id"
        :class="[
          'px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5',
          activeTags.includes(tag.id)
            ? [tag.color, 'border-transparent text-white']
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
        ]"
        @click="toggleTag(tag.id)"
      >
        <span
          v-if="!activeTags.includes(tag.id)"
          :class="['w-2 h-2 rounded-full', tag.color]"
        />
        {{ tag.name }}
      </button>
      <span v-if="activeTags.length === 0" class="text-xs text-zinc-600 ml-2">
        (все)
      </span>
    </div>
    <div class="flex-1 flex min-h-0">
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div class="p-4">
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
          :project-tags="currentProject.tags"
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
