# Sidebar Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move day details into sidebar with tab-based navigation between context (day/post) and news.

**Architecture:** Create `SidebarContainer.vue` that manages tabs and renders either DayDetailPanel, PostPreviewPanel, or NewsSidebar. Remove DayDetailPanel from main layout and integrate SidebarContainer into the resizable sidebar area.

**Tech Stack:** Vue 3, Tailwind CSS

---

### Task 1: Create SidebarContainer component

**Files:**
- Create: `lib-modules/content-calendar/components/SidebarContainer.vue`

**Step 1: Create the component**

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PostPreviewPanel from './PostPreviewPanel.vue'
import NewsSidebar from './NewsSidebar.vue'
import type { CalendarPost, InfoEvent, ContentTag, NewsItem } from '../types'
import { getFunDayForDate } from '../data/funDays'
import PostCard from './PostCard.vue'

const props = defineProps<{
  // Selection state
  selectedDate: string | null
  selectedPost: CalendarPost | null
  // Day data
  postsForDate: CalendarPost[]
  infoEvents: InfoEvent[]
  // Project data
  projectTags: ContentTag[]
  news: NewsItem[]
  usedNews: Record<string, string>
  // Functions passed through
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

// Tab state
const activeTab = ref<'context' | 'news'>('news')

// Show tabs only when something is selected
const showTabs = computed(() =>
  props.selectedDate !== null || props.selectedPost !== null
)

// First tab label
const contextTabLabel = computed(() =>
  props.selectedPost ? 'Пост' : 'День'
)

// Auto-switch to context tab when selection changes
watch([() => props.selectedDate, () => props.selectedPost], ([newDate, newPost], [oldDate, oldPost]) => {
  if ((newDate && newDate !== oldDate) || (newPost && newPost !== oldPost)) {
    activeTab.value = 'context'
  }
  // If nothing selected, switch to news
  if (!newDate && !newPost) {
    activeTab.value = 'news'
  }
})

// Day panel helpers
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
  <aside class="w-full h-full bg-zinc-900/50 flex flex-col overflow-hidden">
    <!-- Tabs (only when something selected) -->
    <div
      v-if="showTabs"
      class="flex border-b border-zinc-800 bg-zinc-900"
    >
      <button
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'context'
            ? 'text-white border-b-2 border-purple-500 bg-zinc-800/50'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
        ]"
        @click="activeTab = 'context'"
      >
        {{ contextTabLabel }}
      </button>
      <button
        :class="[
          'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
          activeTab === 'news'
            ? 'text-white border-b-2 border-purple-500 bg-zinc-800/50'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
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
        <!-- Day header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-medium text-zinc-100">
              {{ formattedDate }}
            </h3>
            <span
              v-if="funDay"
              class="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1"
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
              class="text-zinc-500 hover:text-white transition-colors text-lg"
              @click="emit('closeDate')"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Day content -->
        <div class="flex-1 overflow-y-auto p-3">
          <!-- Info events -->
          <div v-if="infoEvents.length > 0" class="mb-3 space-y-2">
            <div
              v-for="event in infoEvents"
              :key="event.id"
              class="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
            >
              <span class="text-amber-400 mt-0.5">★</span>
              <div>
                <span class="text-sm text-amber-200">{{ event.title }}</span>
                <p v-if="event.description" class="text-xs text-zinc-500 mt-0.5">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Posts -->
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

      <!-- News Sidebar (default or when news tab active) -->
      <NewsSidebar
        v-else
        :news="news"
        :used-news="usedNews"
        class="h-full"
      />
    </div>
  </aside>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/content-calendar/components/SidebarContainer.vue
git commit -m "feat(content-calendar): add SidebarContainer with tabs"
```

---

### Task 2: Update ContentCalendarPage to use SidebarContainer

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`

**Step 1: Add import**

After other component imports (around line 8), add:

```typescript
import SidebarContainer from './SidebarContainer.vue'
```

**Step 2: Remove DayDetailPanel import**

Remove this line:

```typescript
import DayDetailPanel from './DayDetailPanel.vue'
```

**Step 3: Remove DayDetailPanel from template**

Remove this block (around lines 404-413):

```vue
        <DayDetailPanel
          v-if="selectedDate"
          :date="selectedDate"
          :posts="postsForSelectedDate"
          :info-events="infoEventsForSelectedDate"
          :project-tags="currentProject.tags"
          @select-post="selectPost"
          @close="selectDate(null)"
          @create-post="handleCreatePost(selectedDate!)"
        />
```

**Step 4: Replace sidebar content**

Replace the current sidebar content (PostPreviewPanel and NewsSidebar) with SidebarContainer.

Change from:

```vue
        <PostPreviewPanel
          v-if="selectedPost"
          :post="selectedPost"
          :project-tags="currentProject.tags"
          :create-tag="createTag"
          @close="selectPost(null)"
          @update="handlePostUpdate"
          @delete="handlePostDelete"
          @create-chat="handleCreateChat"
        />
        <NewsSidebar
          v-else
          :news="currentProject.news"
          :used-news="usedNews"
        />
```

To:

```vue
        <SidebarContainer
          :selected-date="selectedDate"
          :selected-post="selectedPost"
          :posts-for-date="postsForSelectedDate"
          :info-events="infoEventsForSelectedDate"
          :project-tags="currentProject.tags"
          :news="currentProject.news"
          :used-news="usedNews"
          :create-tag="createTag"
          @select-post="selectPost"
          @close-date="selectDate(null)"
          @close-post="selectPost(null)"
          @create-post="handleCreatePost(selectedDate!)"
          @update-post="handlePostUpdate"
          @delete-post="handlePostDelete"
          @create-chat="handleCreateChat"
        />
```

**Step 5: Commit**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue
git commit -m "feat(content-calendar): integrate SidebarContainer, remove DayDetailPanel from layout"
```

---

### Task 3: Export SidebarContainer and cleanup

**Files:**
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Add export (optional)**

If needed for external use, add to index.ts:

```typescript
export { default as SidebarContainer } from './components/SidebarContainer.vue'
```

**Step 2: Verify DayDetailPanel is still exported**

Keep DayDetailPanel export if it exists — it may be used elsewhere or we may remove it in a future cleanup.

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/index.ts
git commit -m "chore(content-calendar): export SidebarContainer"
```

---

### Task 4: Test and verify

**Step 1: Manual testing checklist**

Run `yarn dev` and verify on /ideas:

- [ ] Nothing selected → Only news, no tabs
- [ ] Click day → Tabs appear, "День" tab active, shows posts/events
- [ ] Click post from day → Tabs change to "Пост | Новости", post preview shown
- [ ] Click "Новости" tab → News visible, selection preserved
- [ ] Click "День/Пост" tab → Return to context view
- [ ] Close post (×) → Return to day view
- [ ] Close day (×) → Return to news only

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat(content-calendar): complete sidebar tabs implementation

- Add SidebarContainer with tab navigation
- Move day details from bottom panel to sidebar
- Auto-switch tabs on selection change
- News always accessible via tab"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create SidebarContainer | SidebarContainer.vue |
| 2 | Integrate into ContentCalendarPage | ContentCalendarPage.vue |
| 3 | Export and cleanup | index.ts |
| 4 | Test and verify | - |
