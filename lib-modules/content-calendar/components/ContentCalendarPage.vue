<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
  updatePost,
  projects
} = useContentCalendar()

function handlePostUpdate(updates: any) {
  if (selectedPostId.value) {
    updatePost(selectedPostId.value, updates)
  }
}

const statusConfig = [
  { id: 'idea' as const, label: 'Идея', icon: 'idea', color: 'text-zinc-400' },
  { id: 'draft' as const, label: 'Черновик', icon: 'draft', color: 'text-yellow-500' },
  { id: 'ready' as const, label: 'Готов', icon: 'ready', color: 'text-green-500' },
  { id: 'published' as const, label: 'Опубликован', icon: 'published', color: 'text-blue-500' }
]

// Tag combobox state
const tagSearch = ref('')
const tagDropdownOpen = ref(false)
const tagInputRef = ref<HTMLInputElement | null>(null)

const filteredTags = computed(() => {
  const search = tagSearch.value.toLowerCase().trim()
  if (!search) return currentProject.value.tags
  return currentProject.value.tags.filter(tag =>
    tag.name.toLowerCase().includes(search)
  )
})

const selectedTagObjects = computed(() =>
  activeTags.value
    .map(id => currentProject.value.tags.find(t => t.id === id))
    .filter(Boolean)
)

function handleTagSelect(tagId: string) {
  toggleTag(tagId)
  tagSearch.value = ''
}

function removeTag(tagId: string) {
  toggleTag(tagId)
}

function openTagDropdown() {
  tagDropdownOpen.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function closeTagDropdown() {
  tagDropdownOpen.value = false
  tagSearch.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (tagDropdownOpen.value) {
      closeTagDropdown()
    } else if (selectedPostId.value) {
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
            <!-- Published: rocket -->
            <svg v-else-if="status.icon === 'published'" :class="['w-4 h-4', status.color]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
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

      <!-- Selected tags -->
      <div class="flex items-center gap-1 flex-wrap">
        <button
          v-for="tag in selectedTagObjects"
          :key="tag.id"
          :class="['px-2 py-0.5 text-xs rounded-full flex items-center gap-1 text-white', tag.color]"
          @click="removeTag(tag.id)"
        >
          {{ tag.name }}
          <span class="text-white/70 hover:text-white">×</span>
        </button>
      </div>

      <!-- Tag combobox -->
      <div class="relative">
        <button
          class="px-3 py-1 text-xs rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 flex items-center gap-1"
          @click="openTagDropdown"
        >
          <span>+ Добавить тег</span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="tagDropdownOpen"
          class="absolute top-full left-0 mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50"
        >
          <div class="p-2 border-b border-zinc-700">
            <input
              ref="tagInputRef"
              v-model="tagSearch"
              type="text"
              placeholder="Поиск тегов..."
              class="w-full px-2 py-1 text-sm bg-zinc-900 border border-zinc-600 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              @keydown.escape="closeTagDropdown"
            />
          </div>
          <div class="max-h-48 overflow-y-auto p-1">
            <button
              v-for="tag in filteredTags"
              :key="tag.id"
              :class="[
                'w-full px-3 py-1.5 text-sm text-left rounded flex items-center gap-2 transition-colors',
                activeTags.includes(tag.id)
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700'
              ]"
              @click="handleTagSelect(tag.id)"
            >
              <span :class="['w-2.5 h-2.5 rounded-full', tag.color]" />
              <span>{{ tag.name }}</span>
              <span v-if="activeTags.includes(tag.id)" class="ml-auto text-green-400">✓</span>
            </button>
            <div v-if="filteredTags.length === 0" class="px-3 py-2 text-sm text-zinc-500">
              Ничего не найдено
            </div>
          </div>
        </div>
      </div>

      <!-- Click outside to close -->
      <div
        v-if="tagDropdownOpen"
        class="fixed inset-0 z-40"
        @click="closeTagDropdown"
      />

      <span v-if="activeTags.length === 0" class="text-xs text-zinc-600">
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
        :project-tags="currentProject.tags"
        @close="selectPost(null)"
        @update="handlePostUpdate"
      />
      <NewsSidebar
        v-else
        :news="currentProject.news"
      />
    </div>
  </div>
</template>
