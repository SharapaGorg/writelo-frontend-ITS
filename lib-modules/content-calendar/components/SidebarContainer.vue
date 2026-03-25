<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PostPreviewPanel from './PostPreviewPanel.vue'
import NewsSidebar from './NewsSidebar.vue'
import { BookmarksSidebar } from '~/lib-modules/reels-research'
import type { CalendarPost, InfoEvent, ContentTag, NewsItem, TrendItem } from '../types'
import { getFunDayForDate } from '../data/funDays'
import PostCard from './PostCard.vue'

const props = defineProps<{
  selectedDate: string | null
  selectedPost: CalendarPost | null
  postsForDate: CalendarPost[]
  infoEvents: InfoEvent[]
  projectTags: ContentTag[]
  news: NewsItem[]
  usedNews: Record<string, string>
  trends: TrendItem[]
  usedTrends: Record<string, string>
  createTag: (name: string) => string
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  closeDate: []
  closePost: []
  createPost: []
  updatePost: [updates: Partial<CalendarPost>]
  deletePost: []
  createChat: []
}>()

const activeTab = ref<'context' | 'news' | 'bookmarks'>('news')

const showTabs = computed(() =>
  props.selectedDate !== null || props.selectedPost !== null
)

const contextTabLabel = computed(() =>
  props.selectedPost ? 'Пост' : 'День'
)

watch([() => props.selectedDate, () => props.selectedPost], ([newDate, newPost], [oldDate, oldPost]) => {
  if ((newDate && newDate !== oldDate) || (newPost && newPost !== oldPost)) {
    activeTab.value = 'context'
  }
  if (!newDate && !newPost) {
    activeTab.value = 'news'
  }
})

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const d = new Date(props.selectedDate)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })
})

const funDay = computed(() =>
  props.selectedDate ? getFunDayForDate(props.selectedDate) : null
)

function handlePostUpdate(updates: Partial<CalendarPost>) {
  emit('updatePost', updates)
}
</script>

<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <!-- Tabs -->
    <div
      class="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
    >
      <button
        v-if="showTabs"
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'context'
            ? 'text-zinc-900 dark:text-white border-b-2 border-purple-500 bg-zinc-200/50 dark:bg-zinc-800/50'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
        ]"
        @click="activeTab = 'context'"
      >
        {{ contextTabLabel }}
      </button>
      <button
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'news'
            ? 'text-zinc-900 dark:text-white border-b-2 border-purple-500 bg-zinc-200/50 dark:bg-zinc-800/50'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
        ]"
        @click="activeTab = 'news'"
      >
        Новости
      </button>
      <button
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'bookmarks'
            ? 'text-zinc-900 dark:text-white border-b-2 border-purple-500 bg-zinc-200/50 dark:bg-zinc-800/50'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
        ]"
        @click="activeTab = 'bookmarks'"
      >
        Закладки
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Post Preview -->
      <PostPreviewPanel
        v-if="selectedPost && activeTab === 'context'"
        :post="selectedPost"
        :project-tags="projectTags"
        :create-tag="createTag"
        class="h-full"
        @close="emit('closePost')"
        @update="handlePostUpdate"
        @delete="emit('deletePost')"
        @create-chat="emit('createChat')"
      />

      <!-- Day Detail -->
      <div
        v-else-if="selectedDate && !selectedPost && activeTab === 'context'"
        class="h-full flex flex-col overflow-hidden"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {{ formattedDate }}
            </h3>
            <span
              v-if="funDay"
              class="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs text-purple-600 dark:text-purple-200 flex items-center gap-1"
            >
              <span v-if="funDay.emoji" class="text-sm">{{ funDay.emoji }}</span>
              <span>{{ funDay.title }}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors"
              title="Создать пост"
              @click="emit('createPost')"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-lg"
              @click="emit('closeDate')"
            >
              ×
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
          <div v-if="infoEvents.length > 0" class="mb-3 space-y-2">
            <div
              v-for="event in infoEvents"
              :key="event.id"
              class="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
            >
              <span class="text-amber-400 mt-0.5">★</span>
              <div>
                <span class="text-sm text-amber-600 dark:text-amber-200">{{ event.title }}</span>
                <p v-if="event.description" class="text-xs text-zinc-500 mt-0.5">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="postsForDate.length > 0" class="space-y-2">
            <PostCard
              v-for="post in postsForDate"
              :key="post.id"
              :post="post"
              :project-tags="projectTags"
              @select="emit('selectPost', $event)"
            />
          </div>
          <div v-else-if="infoEvents.length === 0" class="text-center py-8 text-zinc-500 text-sm">
            Нет постов на эту дату
          </div>
        </div>
      </div>

      <!-- Bookmarks Sidebar -->
      <BookmarksSidebar
        v-else-if="activeTab === 'bookmarks'"
        class="h-full"
      />

      <!-- News Sidebar -->
      <NewsSidebar
        v-else-if="activeTab === 'news'"
        :news="news"
        :used-news="usedNews"
        :trends="trends"
        :used-trends="usedTrends"
        class="h-full"
      />
    </div>
  </aside>
</template>
