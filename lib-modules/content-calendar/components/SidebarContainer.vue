<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import PostPreviewPanel from './PostPreviewPanel.vue'
import NewsSidebar from './NewsSidebar.vue'
import type { CalendarPost, InfoEvent, ContentTag, NewsItem, TrendItem, SocialAccount } from '../types'
import { getFunDayForDate } from '../data/funDays'
import PostCard from './PostCard.vue'

const props = defineProps<{
  selectedDate: string | null
  selectedPost: CalendarPost | null
  postsForDate: CalendarPost[]
  infoEvents: InfoEvent[]
  projectTags: ContentTag[]
  accounts: SocialAccount[]
  news: NewsItem[]
  usedNews: Record<string, string>
  trends: TrendItem[]
  usedTrends: Record<string, string>
  isCreatingPost?: boolean
  isSubmittingPost?: boolean
}>()

const emit = defineEmits<{
  selectPost: [postId: string]
  closeDate: []
  closePost: []
  createPost: []
  submitCreatePost: [title: string]
  cancelCreatePost: []
  deletePost: []
}>()

const newPostTitle = ref('')
const newPostInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.isCreatingPost,
  async (creating) => {
    if (creating) {
      newPostTitle.value = ''
      await nextTick()
      newPostInput.value?.focus()
    }
  }
)

function submitNewPost() {
  if (props.isSubmittingPost) return
  const title = newPostTitle.value.trim()
  if (!title) return
  emit('submitCreatePost', title)
}

function cancelNewPost() {
  if (props.isSubmittingPost) return
  newPostTitle.value = ''
  emit('cancelCreatePost')
}

const activeTab = ref<'context' | 'news'>('news')

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

</script>

<template>
  <aside class="w-full h-full bg-card flex flex-col overflow-hidden">
    <!-- Tabs -->
    <div
      class="flex border-b border-border bg-muted"
    >
      <button
        v-if="showTabs"
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'context'
            ? 'text-foreground border-b-2 border-primary bg-secondary/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="activeTab = 'context'"
      >
        {{ contextTabLabel }}
      </button>
      <button
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'news'
            ? 'text-foreground border-b-2 border-primary bg-secondary/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="activeTab = 'news'"
      >
        Новости
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Post Preview -->
      <PostPreviewPanel
        v-if="selectedPost && activeTab === 'context'"
        :post="selectedPost"
        :project-tags="projectTags"
        :accounts="accounts"
        class="h-full"
        @close="emit('closePost')"
        @delete="emit('deletePost')"
      />

      <!-- Day Detail -->
      <div
        v-else-if="selectedDate && !selectedPost && activeTab === 'context'"
        class="h-full flex flex-col overflow-hidden"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-medium text-foreground">
              {{ formattedDate }}
            </h3>
            <span
              v-if="funDay"
              class="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30 text-xs text-primary flex items-center gap-1"
            >
              <span v-if="funDay.emoji" class="text-sm">{{ funDay.emoji }}</span>
              <span>{{ funDay.title }}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-7 h-7 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground flex items-center justify-center transition-colors"
              title="Создать пост"
              @click="emit('createPost')"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              class="text-muted-foreground hover:text-foreground transition-colors text-lg"
              @click="emit('closeDate')"
            >
              ×
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div
            v-if="isCreatingPost"
            class="mb-3 p-3 rounded-md border border-primary/50 bg-primary/5 space-y-2"
          >
            <label class="text-xs text-muted-foreground">Название поста</label>
            <input
              ref="newPostInput"
              v-model="newPostTitle"
              type="text"
              placeholder="Введите название..."
              :disabled="isSubmittingPost"
              class="w-full px-3 py-2 text-sm rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              @keydown.enter.prevent="submitNewPost"
              @keydown.esc.prevent="cancelNewPost"
            />
            <div class="flex items-center justify-end gap-2">
              <button
                class="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="isSubmittingPost"
                @click="cancelNewPost"
              >
                Отмена
              </button>
              <button
                class="px-3 py-1.5 text-xs rounded-md bg-brand hover:bg-brand/90 disabled:bg-brand/40 disabled:cursor-not-allowed text-brand-foreground transition-colors flex items-center gap-1.5"
                :disabled="!newPostTitle.trim() || isSubmittingPost"
                @click="submitNewPost"
              >
                <Loader2 v-if="isSubmittingPost" class="w-3 h-3 animate-spin" />
                Создать
              </button>
            </div>
          </div>

          <div v-if="infoEvents.length > 0" class="mb-3 space-y-2">
            <div
              v-for="event in infoEvents"
              :key="event.id"
              class="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30"
            >
              <span class="text-amber-400 mt-0.5">★</span>
              <div>
                <span class="text-sm text-amber-600 dark:text-amber-200">{{ event.title }}</span>
                <p v-if="event.description" class="text-xs text-muted-foreground mt-0.5">
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
              :accounts="accounts"
              @select="emit('selectPost', $event)"
            />
          </div>
          <div v-else-if="infoEvents.length === 0" class="text-center py-8 text-muted-foreground text-sm">
            Нет постов на эту дату
          </div>
        </div>
      </div>

      <!-- News Sidebar -->
      <NewsSidebar
        v-else
        :news="news"
        :used-news="usedNews"
        :trends="trends"
        :used-trends="usedTrends"
        class="h-full"
      />
    </div>
  </aside>
</template>
