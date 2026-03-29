<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import SidebarContainer from './SidebarContainer.vue'
import AccountsSidebar from './AccountsSidebar.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '~/components/ui/dialog'
import { useContentCalendar } from '../composables/useContentCalendar'
import type { NewsItem, TrendItem, ContentTag, SocialAccount } from '../types'

const props = withDefaults(defineProps<{
  showcaseMode?: boolean
}>(), {
  showcaseMode: false
})

const {
  selectedProjectId,
  selectedDate,
  selectedPostId,
  activeAccountIds,
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
  toggleAccount,
  toggleStatus,
  toggleTag,
  nextMonth,
  prevMonth,
  createPost,
  deletePost,
  updatePost,
  markNewsAsUsed,
  usedNews,
  markTrendAsUsed,
  usedTrends,
  projects
} = useContentCalendar()

function handlePostDelete() {
  if (selectedPostId.value) {
    deletePost(selectedPostId.value)
    selectPost(null)
  }
}

function handlePostPublish() {
  if (selectedPostId.value) {
    updatePost(selectedPostId.value, { status: 'published' })
  }
}

// Account selection dialog for news/trend drops
const showAccountSelectDialog = ref(false)
const pendingDrop = ref<{
  type: 'news' | 'trend'
  date: string
  item: NewsItem | TrendItem
} | null>(null)

function handleNewsDropOnDate(date: string, news: NewsItem) {
  // If only one account, create immediately
  if (currentProject.value.accounts.length === 1) {
    createPostFromNews(date, news, currentProject.value.accounts[0].id)
    return
  }
  // Show account selection dialog
  pendingDrop.value = { type: 'news', date, item: news }
  showAccountSelectDialog.value = true
}

function handleTrendDropOnDate(date: string, trend: TrendItem) {
  // If only one account, create immediately
  if (currentProject.value.accounts.length === 1) {
    createPostFromTrend(date, trend, currentProject.value.accounts[0].id)
    return
  }
  // Show account selection dialog
  pendingDrop.value = { type: 'trend', date, item: trend }
  showAccountSelectDialog.value = true
}

function selectAccountForDrop(accountId: string) {
  if (!pendingDrop.value) return

  if (pendingDrop.value.type === 'news') {
    createPostFromNews(pendingDrop.value.date, pendingDrop.value.item as NewsItem, accountId)
  } else {
    createPostFromTrend(pendingDrop.value.date, pendingDrop.value.item as TrendItem, accountId)
  }

  showAccountSelectDialog.value = false
  pendingDrop.value = null
}

function cancelAccountSelect() {
  showAccountSelectDialog.value = false
  pendingDrop.value = null
}

function createPostFromNews(date: string, news: NewsItem, accountId: string) {
  // Build content from news description and URL
  let content = ''
  if (news.description) {
    content += news.description
  }
  if (news.url) {
    content += content ? '\n\n' : ''
    content += `Источник: ${news.source}\n${news.url}`
  }

  const newPost = createPost({
    title: news.title,
    description: news.description,
    content: content,
    type: 'post',
    status: 'idea',
    accountId,
    tags: [],
    date: date,
    sourceNewsId: news.id
  })

  if (newPost) {
    markNewsAsUsed(news.id, date)
  }
}

function createPostFromTrend(date: string, trend: TrendItem, accountId: string) {
  const newPost = createPost({
    title: trend.hashtag || trend.name,
    description: trend.url,
    type: 'post',
    status: 'idea',
    accountId,
    tags: [],
    date: date,
    sourceTrendId: trend.id
  })

  if (newPost) {
    markTrendAsUsed(trend.id, date)
    selectDate(date)
    selectPost(newPost.id)
  }
}

function handleCreatePost(date: string) {
  // Get the first account ID from the current project as default
  const defaultAccountId = currentProject.value.accounts[0]?.id || ''

  const newPost = createPost({
    title: 'Новый пост',
    type: 'post',
    status: 'idea',
    accountId: defaultAccountId,
    tags: [],
    date: date
  })

  if (newPost) {
    selectDate(date)
    selectPost(newPost.id)
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

// Sidebar resize state
const SIDEBAR_STORAGE_KEY = 'content-calendar-sidebar-width'
const SIDEBAR_MIN_WIDTH = 280
const SIDEBAR_MAX_WIDTH = 600
const SIDEBAR_DEFAULT_WIDTH = 384

const sidebarWidth = ref(SIDEBAR_DEFAULT_WIDTH)
const isResizing = ref(false)

// In showcase mode, use minimum width and disable resizing
const effectiveSidebarWidth = computed(() =>
  props.showcaseMode ? SIDEBAR_MIN_WIDTH : sidebarWidth.value
)

function loadSidebarWidth() {
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
  if (stored) {
    const width = parseInt(stored, 10)
    if (!isNaN(width) && width >= SIDEBAR_MIN_WIDTH && width <= SIDEBAR_MAX_WIDTH) {
      sidebarWidth.value = width
    }
  }
}

function saveSidebarWidth() {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth.value))
}

function startResize(e: MouseEvent) {
  e.preventDefault()
  isResizing.value = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  const newWidth = window.innerWidth - e.clientX
  sidebarWidth.value = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, newWidth))
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  saveSidebarWidth()
}

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
    .filter((tag): tag is ContentTag => !!tag)
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
  loadSidebarWidth()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :class="[
    'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden',
    props.showcaseMode ? 'h-[700px]' : 'h-screen'
  ]">
    <CalendarHeader
      :brands="projects"
      :selected-brand-id="selectedProjectId"
      @update:selected-brand-id="selectProject"
    />
    <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
      <div class="flex items-center gap-6">
        <!-- Status filter -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-zinc-500">Статус:</span>
          <button
            v-for="status in statusConfig"
            :key="status.id"
            :class="[
              'px-3 py-1.5 text-sm rounded-full border transition-all flex items-center gap-1.5',
              activeStatuses.includes(status.id)
                ? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
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
      <div class="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
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
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Статья</span>
        </div>
      </div>
    </div>
    <!-- Tag filter -->
    <div class="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30">
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
          class="px-3 py-1 text-xs rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center gap-1"
          @click="openTagDropdown"
        >
          <span>+ Добавить тег</span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="tagDropdownOpen"
          class="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50"
        >
          <div class="p-2 border-b border-zinc-200 dark:border-zinc-700">
            <input
              ref="tagInputRef"
              v-model="tagSearch"
              type="text"
              placeholder="Поиск тегов..."
              class="w-full px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              @keydown.escape="closeTagDropdown"
            />
          </div>
          <div class="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            <button
              v-for="tag in filteredTags"
              :key="tag.id"
              :class="[
                'w-full px-3 py-1.5 text-sm text-left rounded flex items-center gap-2 transition-colors',
                activeTags.includes(tag.id)
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
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
      <!-- Left sidebar with accounts -->
      <AccountsSidebar
        :accounts="currentProject.accounts"
        :active-account-ids="activeAccountIds"
        @toggle="toggleAccount"
      />

      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        <div class="p-4">
          <CalendarGrid
            :current-month="currentMonth"
            :selected-date="selectedDate"
            :get-posts-for-date="getPostsForDate"
            :has-info-event="hasInfoEvent"
            :accounts="currentProject.accounts"
            @select-date="selectDate"
            @prev-month="prevMonth"
            @next-month="nextMonth"
            @drop-news="handleNewsDropOnDate"
            @drop-trend="handleTrendDropOnDate"
            @create-post="handleCreatePost"
          />
        </div>
      </div>
      <!-- Resizable Sidebar -->
      <div
        class="relative flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-hidden"
        :style="{ width: `${effectiveSidebarWidth}px` }"
      >
        <!-- Resize handle (hidden in showcase mode) -->
        <div
          v-if="!props.showcaseMode"
          class="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-500/50 transition-colors z-10"
          :class="{ 'bg-purple-500/50': isResizing }"
          @mousedown="startResize"
        />
        <SidebarContainer
          :selected-date="selectedDate"
          :selected-post="selectedPost"
          :posts-for-date="postsForSelectedDate"
          :info-events="infoEventsForSelectedDate"
          :project-tags="currentProject.tags"
          :accounts="currentProject.accounts"
          :news="currentProject.news"
          :used-news="usedNews"
          :trends="currentProject.trends"
          :used-trends="usedTrends"
          @select-post="selectPost"
          @close-date="selectDate(null)"
          @close-post="selectPost(null)"
          @create-post="handleCreatePost(selectedDate!)"
          @delete-post="handlePostDelete"
          @publish-post="handlePostPublish"
        />
      </div>
    </div>

    <!-- Account Selection Dialog -->
    <Dialog :open="showAccountSelectDialog" @update:open="(v) => !v && cancelAccountSelect()">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите аккаунт</DialogTitle>
          <DialogDescription>
            В какой аккаунт добавить идею?
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-2 py-4">
          <button
            v-for="account in currentProject.accounts"
            :key="account.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            @click="selectAccountForDrop(account.id)"
          >
            <!-- Network icon -->
            <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg v-if="account.network === 'vk'" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
              </svg>
              <svg v-else-if="account.network === 'youtube'" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <svg v-else-if="account.network === 'telegram'" class="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <svg v-else-if="account.network === 'instagram'" class="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ account.name }}</div>
              <div class="text-sm text-zinc-500 truncate">{{ account.username }}</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
