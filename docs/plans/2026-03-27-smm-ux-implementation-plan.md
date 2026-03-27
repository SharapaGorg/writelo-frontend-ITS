# SMM UX Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the product from chat-centric AI aggregator to brand-centric SMM platform with calendar as main screen.

**Architecture:**
- New sidebar layout replacing top navbar
- Content Editor with dual-panel (Chat/Images + Preview)
- Reels Script Editor with second-by-second timeline
- Multi-input image generation (up to 14 references)

**Tech Stack:** Vue 3, Nuxt, Pinia, Tailwind CSS, shadcn-vue

**Related Design Doc:** `docs/plans/2026-03-27-smm-ux-redesign.md`

---

## Phase 1: New Layout & Sidebar

### Task 1.1: Create Sidebar Layout Module

**Files:**
- Create: `lib-modules/app-layout/index.ts`
- Create: `lib-modules/app-layout/types/index.ts`
- Create: `lib-modules/app-layout/composables/useAppLayout.ts`
- Create: `lib-modules/app-layout/components/AppSidebar.vue`
- Create: `lib-modules/app-layout/components/AppHeader.vue`
- Create: `lib-modules/app-layout/components/AppLayout.vue`

**Step 1: Create module structure**

```bash
mkdir -p lib-modules/app-layout/{components,composables,types}
```

**Step 2: Create types**

File: `lib-modules/app-layout/types/index.ts`
```typescript
export type SidebarSection = 'calendar' | 'editor' | 'trends' | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
}
```

**Step 3: Create composable**

File: `lib-modules/app-layout/composables/useAppLayout.ts`
```typescript
import { ref, computed } from 'vue'
import type { SidebarSection, SidebarItem } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const sidebarItems: SidebarItem[] = [
    { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
    { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
    { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
  ]

  const bottomItems: SidebarItem[] = [
    { id: 'settings', icon: 'settings', label: 'Настройки', route: '/app/settings' },
  ]

  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }

  function setActiveSection(section: SidebarSection) {
    activeSection.value = section
  }

  return {
    isCollapsed: computed(() => isCollapsed.value),
    activeSection: computed(() => activeSection.value),
    sidebarItems,
    bottomItems,
    toggleSidebar,
    setActiveSection,
  }
}
```

**Step 4: Create AppSidebar component**

File: `lib-modules/app-layout/components/AppSidebar.vue`
```vue
<script setup lang="ts">
import { useAppLayout } from '../composables/useAppLayout'
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'
import {
  Calendar,
  PenSquare,
  TrendingUp,
  Settings,
  PanelLeftClose,
  PanelLeft
} from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import type { SidebarSection } from '../types'

const route = useRoute()
const router = useRouter()
const { isCollapsed, activeSection, sidebarItems, bottomItems, toggleSidebar, setActiveSection } = useAppLayout()

const iconMap: Record<string, any> = {
  calendar: Calendar,
  'pen-square': PenSquare,
  'trending-up': TrendingUp,
  settings: Settings,
}

watch(() => route.path, (path) => {
  const item = [...sidebarItems, ...bottomItems].find(i => path.startsWith(i.route))
  if (item) setActiveSection(item.id)
}, { immediate: true })

function navigate(item: { id: SidebarSection; route: string }) {
  setActiveSection(item.id)
  router.push(item.route)
}
</script>

<template>
  <aside
    :class="cn(
      'flex flex-col h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-200',
      isCollapsed ? 'w-16' : 'w-56'
    )"
  >
    <!-- Toggle button -->
    <div class="flex items-center justify-end p-3 border-b border-zinc-800">
      <button
        @click="toggleSidebar"
        class="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
      >
        <component :is="isCollapsed ? PanelLeft : PanelLeftClose" class="w-5 h-5" />
      </button>
    </div>

    <!-- Main navigation -->
    <nav class="flex-1 py-4">
      <ul class="space-y-1 px-2">
        <li v-for="item in sidebarItems" :key="item.id">
          <button
            @click="navigate(item)"
            :class="cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              activeSection === item.id
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            )"
          >
            <component :is="iconMap[item.icon]" class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Bottom items -->
    <div class="border-t border-zinc-800 py-4 px-2">
      <ul class="space-y-1">
        <li v-for="item in bottomItems" :key="item.id">
          <button
            @click="navigate(item)"
            :class="cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              activeSection === item.id
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            )"
          >
            <component :is="iconMap[item.icon]" class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>
```

**Step 5: Create AppHeader component**

File: `lib-modules/app-layout/components/AppHeader.vue`
```vue
<script setup lang="ts">
import { useProjects } from '~/lib-modules/projects'
import { useUserController } from '~/composables/useUserController'
import { Button } from '~/components/ui/button'
import { User, Crown } from 'lucide-vue-next'

const { projects, selectedProjectId, selectProject } = useProjects()
const { user } = useUserController()
</script>

<template>
  <header class="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4">
    <!-- Brand selector -->
    <div class="flex items-center gap-3">
      <select
        :value="selectedProjectId"
        @change="(e) => selectProject((e.target as HTMLSelectElement).value)"
        class="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.title }}
        </option>
      </select>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-3">
      <!-- Subscription badge -->
      <Button variant="ghost" size="sm" class="text-amber-400 hover:text-amber-300">
        <Crown class="w-4 h-4 mr-1" />
        <span class="text-xs">Premium</span>
      </Button>

      <!-- Profile -->
      <Button variant="ghost" size="icon" class="rounded-full">
        <User class="w-5 h-5" />
      </Button>
    </div>
  </header>
</template>
```

**Step 6: Create AppLayout wrapper**

File: `lib-modules/app-layout/components/AppLayout.vue`
```vue
<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<template>
  <div class="flex h-screen bg-zinc-950 text-white">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
```

**Step 7: Create module index**

File: `lib-modules/app-layout/index.ts`
```typescript
export { default as AppLayout } from './components/AppLayout.vue'
export { default as AppSidebar } from './components/AppSidebar.vue'
export { default as AppHeader } from './components/AppHeader.vue'
export { useAppLayout } from './composables/useAppLayout'
export * from './types'
```

**Step 8: Commit**

```bash
git add lib-modules/app-layout/
git commit -m "feat(app-layout): create sidebar layout module

- AppSidebar with collapsible navigation
- AppHeader with brand selector and profile
- AppLayout wrapper component
- useAppLayout composable for state management"
```

---

### Task 1.2: Create New Layout File

**Files:**
- Create: `layouts/app.vue`

**Step 1: Create the layout**

File: `layouts/app.vue`
```vue
<script setup lang="ts">
import { AppLayout } from '~/lib-modules/app-layout'
</script>

<template>
  <AppLayout>
    <slot />
  </AppLayout>
</template>
```

**Step 2: Commit**

```bash
git add layouts/app.vue
git commit -m "feat(layouts): add new app layout with sidebar"
```

---

### Task 1.3: Create Calendar Route

**Files:**
- Create: `pages/app/calendar.vue`

**Step 1: Create calendar page**

File: `pages/app/calendar.vue`
```vue
<script setup lang="ts">
import ContentCalendarPage from '~/lib-modules/content-calendar/components/ContentCalendarPage.vue'

definePageMeta({
  layout: 'app'
})
</script>

<template>
  <ContentCalendarPage />
</template>
```

**Step 2: Commit**

```bash
git add pages/app/calendar.vue
git commit -m "feat(pages): add /app/calendar route with new layout"
```

---

## Phase 2: Calendar Enhancement - Account Filters

### Task 2.1: Add Social Account Types

**Files:**
- Modify: `lib-modules/content-calendar/types/index.ts`

**Step 1: Read current types**

Read: `lib-modules/content-calendar/types/index.ts`

**Step 2: Add SocialAccount type**

Add to `lib-modules/content-calendar/types/index.ts`:
```typescript
export interface SocialAccount {
  id: string
  network: SocialNetwork
  name: string
  username: string
  avatarUrl?: string
}
```

**Step 3: Update DemoProject type**

Modify DemoProject interface to include accounts:
```typescript
export interface DemoProject {
  id: string
  name: string
  accounts: SocialAccount[]  // NEW
  posts: CalendarPost[]
  tags: ContentTag[]
  infoEvents?: InfoEvent[]
}
```

**Step 4: Update CalendarPost type**

Change `networks` to `accountIds`:
```typescript
export interface CalendarPost {
  id: string
  title: string
  type: PostType
  status: PostStatus
  accountIds: string[]  // Changed from networks: SocialNetwork[]
  tags: string[]
  date: string
  previews: Partial<Record<SocialNetwork, SocialPreviewData>>
}
```

**Step 5: Commit**

```bash
git add lib-modules/content-calendar/types/
git commit -m "feat(content-calendar): add SocialAccount type for account-based filtering"
```

---

### Task 2.2: Update Demo Data with Accounts

**Files:**
- Modify: `lib-modules/content-calendar/data/demoData.ts`

**Step 1: Read current demo data**

Read: `lib-modules/content-calendar/data/demoData.ts`

**Step 2: Add accounts to demo projects**

Update each demo project to include accounts array and convert post networks to accountIds.

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/data/
git commit -m "feat(content-calendar): update demo data with social accounts"
```

---

### Task 2.3: Update Composable for Account Filtering

**Files:**
- Modify: `lib-modules/content-calendar/composables/useContentCalendar.ts`

**Step 1: Read current composable**

Read: `lib-modules/content-calendar/composables/useContentCalendar.ts`

**Step 2: Replace network filtering with account filtering**

Change `activeNetworks` to `activeAccountIds` and update filtering logic:
```typescript
const activeAccountIds = ref<string[]>([])

// Initialize with all accounts when project changes
watch(selectedProjectId, () => {
  const project = projects.find(p => p.id === selectedProjectId.value)
  if (project) {
    activeAccountIds.value = project.accounts.map(a => a.id)
  }
})

const filteredPosts = computed(() =>
  currentProject.value.posts.filter(post => {
    const matchesAccount = post.accountIds.some(id => activeAccountIds.value.includes(id))
    const matchesStatus = activeStatuses.value.includes(post.status)
    const matchesTags = activeTags.value.length === 0 ||
      post.tags.some(t => activeTags.value.includes(t))
    return matchesAccount && matchesStatus && matchesTags
  })
)
```

**Step 3: Add account toggle function**

```typescript
function toggleAccount(accountId: string) {
  const idx = activeAccountIds.value.indexOf(accountId)
  if (idx === -1) {
    activeAccountIds.value.push(accountId)
  } else if (activeAccountIds.value.length > 1) {
    activeAccountIds.value.splice(idx, 1)
  }
}
```

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/composables/
git commit -m "feat(content-calendar): switch from network to account-based filtering"
```

---

### Task 2.4: Update SocialFilters Component

**Files:**
- Modify: `lib-modules/content-calendar/components/SocialFilters.vue`

**Step 1: Read current component**

Read: `lib-modules/content-calendar/components/SocialFilters.vue`

**Step 2: Update to show accounts instead of networks**

Update template to iterate over `currentProject.accounts` and use `toggleAccount(account.id)`.

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/components/SocialFilters.vue
git commit -m "feat(content-calendar): update SocialFilters to show accounts"
```

---

## Phase 3: Content Editor Module - Foundation

### Task 3.1: Create Content Editor Module Structure

**Files:**
- Create: `lib-modules/content-editor/index.ts`
- Create: `lib-modules/content-editor/types/index.ts`
- Create: `lib-modules/content-editor/stores/contentEditorStore.ts`
- Create: `lib-modules/content-editor/composables/useContentEditor.ts`

**Step 1: Create directories**

```bash
mkdir -p lib-modules/content-editor/{components,composables,stores,types,helpers}
```

**Step 2: Create types**

File: `lib-modules/content-editor/types/index.ts`
```typescript
export type ContentType = 'post' | 'story' | 'reel' | 'carousel'
export type EditorMode = 'chat' | 'images'

export interface ContentDraft {
  id: string
  type: ContentType
  accountId: string
  title: string
  description: string
  hashtags: string[]
  images: string[]  // URLs or base64
  scheduledDate: string | null
  status: 'draft' | 'ready'
  // Reel-specific
  script?: ReelScript
}

export interface ReelScript {
  duration: number  // total seconds
  frames: ReelFrame[]
}

export interface ReelFrame {
  second: number
  description: string
  voiceover: string
  visualUrl?: string
}
```

**Step 3: Create store**

File: `lib-modules/content-editor/stores/contentEditorStore.ts`
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentType, EditorMode, ContentDraft, ReelFrame } from '../types'
import { generateUUID } from '~/scripts/features/utils'

export const useContentEditorStore = defineStore('contentEditor', () => {
  // State
  const currentDraft = ref<ContentDraft | null>(null)
  const editorMode = ref<EditorMode>('chat')
  const isSaving = ref(false)

  // Getters
  const isReel = computed(() => currentDraft.value?.type === 'reel')
  const hasUnsavedChanges = computed(() => currentDraft.value !== null)

  // Actions
  function createNewDraft(type: ContentType, accountId: string) {
    currentDraft.value = {
      id: generateUUID(),
      type,
      accountId,
      title: '',
      description: '',
      hashtags: [],
      images: [],
      scheduledDate: null,
      status: 'draft',
      script: type === 'reel' ? { duration: 30, frames: [] } : undefined,
    }
  }

  function setEditorMode(mode: EditorMode) {
    editorMode.value = mode
  }

  function updateDraft(updates: Partial<ContentDraft>) {
    if (currentDraft.value) {
      currentDraft.value = { ...currentDraft.value, ...updates }
    }
  }

  function addImage(url: string) {
    if (currentDraft.value) {
      currentDraft.value.images.push(url)
    }
  }

  function removeImage(index: number) {
    if (currentDraft.value) {
      currentDraft.value.images.splice(index, 1)
    }
  }

  // Reel-specific
  function updateFrame(second: number, data: Partial<ReelFrame>) {
    if (!currentDraft.value?.script) return

    const existingIndex = currentDraft.value.script.frames.findIndex(f => f.second === second)
    if (existingIndex >= 0) {
      currentDraft.value.script.frames[existingIndex] = {
        ...currentDraft.value.script.frames[existingIndex],
        ...data,
      }
    } else {
      currentDraft.value.script.frames.push({
        second,
        description: '',
        voiceover: '',
        ...data,
      })
    }
  }

  function setDuration(seconds: number) {
    if (currentDraft.value?.script) {
      currentDraft.value.script.duration = seconds
      // Remove frames beyond new duration
      currentDraft.value.script.frames = currentDraft.value.script.frames.filter(
        f => f.second < seconds
      )
    }
  }

  function clearDraft() {
    currentDraft.value = null
  }

  return {
    // State
    currentDraft,
    editorMode,
    isSaving,
    // Getters
    isReel,
    hasUnsavedChanges,
    // Actions
    createNewDraft,
    setEditorMode,
    updateDraft,
    addImage,
    removeImage,
    updateFrame,
    setDuration,
    clearDraft,
  }
})
```

**Step 4: Create composable**

File: `lib-modules/content-editor/composables/useContentEditor.ts`
```typescript
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentEditorStore } from '../stores/contentEditorStore'
import type { ContentType } from '../types'

export function useContentEditor() {
  const store = useContentEditorStore()
  const router = useRouter()

  function startNewContent(type: ContentType, accountId: string) {
    store.createNewDraft(type, accountId)
    router.push('/app/editor')
  }

  function openExistingContent(postId: string) {
    // TODO: Load from API
    router.push(`/app/editor/${postId}`)
  }

  async function saveDraft() {
    if (!store.currentDraft) return

    store.isSaving = true
    try {
      // TODO: API call to save
      console.log('Saving draft:', store.currentDraft)
    } finally {
      store.isSaving = false
    }
  }

  function goBackToCalendar() {
    router.push('/app/calendar')
  }

  return {
    // From store
    currentDraft: computed(() => store.currentDraft),
    editorMode: computed(() => store.editorMode),
    isReel: computed(() => store.isReel),
    isSaving: computed(() => store.isSaving),
    // Actions
    startNewContent,
    openExistingContent,
    saveDraft,
    goBackToCalendar,
    setEditorMode: store.setEditorMode,
    updateDraft: store.updateDraft,
    addImage: store.addImage,
    removeImage: store.removeImage,
    updateFrame: store.updateFrame,
    setDuration: store.setDuration,
    clearDraft: store.clearDraft,
    createNewDraft: store.createNewDraft,
  }
}
```

**Step 5: Create index**

File: `lib-modules/content-editor/index.ts`
```typescript
export { useContentEditor } from './composables/useContentEditor'
export { useContentEditorStore } from './stores/contentEditorStore'
export * from './types'
```

**Step 6: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): create module foundation with store and composable"
```

---

### Task 3.2: Create Content Editor Layout Component

**Files:**
- Create: `lib-modules/content-editor/components/ContentEditorLayout.vue`

**Step 1: Create dual-panel layout**

File: `lib-modules/content-editor/components/ContentEditorLayout.vue`
```vue
<script setup lang="ts">
import { useContentEditor } from '../composables/useContentEditor'
import { Button } from '~/components/ui/button'
import { ArrowLeft, MessageSquare, Image } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'

const {
  currentDraft,
  editorMode,
  goBackToCalendar,
  setEditorMode
} = useContentEditor()
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" @click="goBackToCalendar">
          <ArrowLeft class="w-5 h-5" />
        </Button>
        <span class="text-sm font-medium">
          {{ currentDraft ? 'Редактирование' : 'Новый контент' }}
        </span>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left panel -->
      <div class="w-1/2 border-r border-zinc-800 flex flex-col">
        <!-- Mode switcher -->
        <div class="h-10 border-b border-zinc-800 flex items-center px-2 shrink-0">
          <button
            @click="setEditorMode('chat')"
            :class="cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
              editorMode === 'chat'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            )"
          >
            <MessageSquare class="w-4 h-4" />
            Чат
          </button>
          <button
            @click="setEditorMode('images')"
            :class="cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
              editorMode === 'images'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            )"
          >
            <Image class="w-4 h-4" />
            Картинки
          </button>
        </div>

        <!-- Left panel content -->
        <div class="flex-1 overflow-auto">
          <slot name="left-panel" />
        </div>
      </div>

      <!-- Right panel (preview) -->
      <div class="w-1/2 flex flex-col">
        <slot name="right-panel" />
      </div>
    </div>
  </div>
</template>
```

**Step 2: Update index exports**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as ContentEditorLayout } from './components/ContentEditorLayout.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add dual-panel layout component"
```

---

### Task 3.3: Create Editor Page

**Files:**
- Create: `pages/app/editor/[[postId]].vue`

**Step 1: Create editor page**

File: `pages/app/editor/[[postId]].vue`
```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ContentEditorLayout, useContentEditor } from '~/lib-modules/content-editor'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { currentDraft, createNewDraft, editorMode } = useContentEditor()

onMounted(() => {
  const postId = route.params.postId as string | undefined
  if (postId) {
    // TODO: Load existing post
    console.log('Loading post:', postId)
  } else if (!currentDraft.value) {
    // Create default new draft
    createNewDraft('post', 'default-account')
  }
})
</script>

<template>
  <ContentEditorLayout>
    <template #left-panel>
      <div v-if="editorMode === 'chat'" class="p-4">
        <p class="text-zinc-400 text-sm">Чат с ИИ (будет реализован)</p>
      </div>
      <div v-else class="p-4">
        <p class="text-zinc-400 text-sm">Генерация картинок (будет реализован)</p>
      </div>
    </template>

    <template #right-panel>
      <div class="p-4">
        <p class="text-zinc-400 text-sm">Превью поста (будет реализован)</p>
      </div>
    </template>
  </ContentEditorLayout>
</template>
```

**Step 2: Commit**

```bash
git add pages/app/editor/
git commit -m "feat(pages): add content editor page with catch-all route"
```

---

## Phase 4: Chat Panel Integration

### Task 4.1: Create Chat Panel Component

**Files:**
- Create: `lib-modules/content-editor/components/EditorChatPanel.vue`

**Step 1: Create chat panel**

File: `lib-modules/content-editor/components/EditorChatPanel.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useContentEditor } from '../composables/useContentEditor'
import { Message, SendMessageSection } from '~/lib-modules/conversations'
import { Button } from '~/components/ui/button'
import { Copy } from 'lucide-vue-next'

const { currentDraft, updateDraft } = useContentEditor()

// Local chat state (separate from global conversations)
const messages = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
const isGenerating = ref(false)

function applyToDescription(text: string) {
  if (currentDraft.value) {
    updateDraft({ description: text })
  }
}

function applyHashtags(hashtags: string[]) {
  if (currentDraft.value) {
    updateDraft({ hashtags })
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Messages -->
    <div class="flex-1 overflow-auto p-4 space-y-4">
      <div v-if="messages.length === 0" class="text-center text-zinc-500 py-8">
        <p>Спроси ИИ помочь с текстом, хештегами или идеями</p>
      </div>

      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="[
          'p-3 rounded-lg max-w-[80%]',
          msg.role === 'user'
            ? 'bg-blue-600 ml-auto'
            : 'bg-zinc-800'
        ]"
      >
        <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>

        <!-- Quick actions for assistant messages -->
        <div v-if="msg.role === 'assistant'" class="mt-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            @click="applyToDescription(msg.content)"
          >
            <Copy class="w-3 h-3 mr-1" />
            В описание
          </Button>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-zinc-800 p-4">
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="Напиши сообщение..."
          class="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="() => {/* TODO: send message */}"
        />
        <Button>Отправить</Button>
      </div>
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as EditorChatPanel } from './components/EditorChatPanel.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add chat panel with AI assistance"
```

---

## Phase 5: Multi-Input Image Generation

### Task 5.1: Create Image Stack Component

**Files:**
- Create: `lib-modules/content-editor/components/ImageStack.vue`

**Step 1: Create stacked cards UI**

File: `lib-modules/content-editor/components/ImageStack.vue`
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'

interface Props {
  images: string[]
  maxImages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 14
})

const emit = defineEmits<{
  (e: 'add', file: File): void
  (e: 'remove', index: number): void
}>()

const activeIndex = ref(0)
const fileInput = ref<HTMLInputElement>()

const canAddMore = computed(() => props.images.length < props.maxImages)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('add', file)
    input.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function setActive(index: number) {
  activeIndex.value = index
}
</script>

<template>
  <div class="space-y-4">
    <!-- Stack visualization -->
    <div class="relative h-48 flex items-center justify-center">
      <div
        v-if="images.length === 0"
        class="text-center text-zinc-500"
      >
        <p class="text-sm">Добавьте референсы</p>
        <p class="text-xs">(продукты бренда и т.д.)</p>
      </div>

      <!-- Stacked cards -->
      <div
        v-for="(img, idx) in images"
        :key="idx"
        :style="{
          transform: `translateX(${(idx - activeIndex) * 20}px) scale(${idx === activeIndex ? 1 : 0.9})`,
          zIndex: idx === activeIndex ? 10 : images.length - Math.abs(idx - activeIndex),
          opacity: idx === activeIndex ? 1 : 0.7,
        }"
        :class="cn(
          'absolute w-32 h-32 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2',
          idx === activeIndex ? 'border-blue-500' : 'border-transparent'
        )"
        @click="setActive(idx)"
      >
        <img :src="img" class="w-full h-full object-cover" />

        <!-- Remove button -->
        <button
          v-if="idx === activeIndex"
          @click.stop="emit('remove', idx)"
          class="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Navigation dots -->
    <div v-if="images.length > 1" class="flex justify-center gap-1">
      <button
        v-for="(_, idx) in images"
        :key="idx"
        :class="cn(
          'w-2 h-2 rounded-full transition-colors',
          idx === activeIndex ? 'bg-blue-500' : 'bg-zinc-600'
        )"
        @click="setActive(idx)"
      />
    </div>

    <!-- Add button -->
    <div class="flex items-center justify-between">
      <button
        v-if="canAddMore"
        @click="triggerFileInput"
        class="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
      >
        <Plus class="w-4 h-4" />
        Добавить фото
      </button>
      <span class="text-xs text-zinc-500">{{ images.length }}/{{ maxImages }}</span>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as ImageStack } from './components/ImageStack.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add ImageStack component with stacked cards UI"
```

---

### Task 5.2: Create Image Generation Panel

**Files:**
- Create: `lib-modules/content-editor/components/EditorImagesPanel.vue`

**Step 1: Create images panel**

File: `lib-modules/content-editor/components/EditorImagesPanel.vue`
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useContentEditor } from '../composables/useContentEditor'
import ImageStack from './ImageStack.vue'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Sparkles, Copy, Download, ArrowRight } from 'lucide-vue-next'

const { addImage } = useContentEditor()

// Local state for generation
const referenceImages = ref<string[]>([])
const prompt = ref('')
const aspectRatio = ref('1:1')
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)

const aspectRatios = [
  { value: '1:1', label: '1:1 (Квадрат)' },
  { value: '4:5', label: '4:5 (Пост)' },
  { value: '9:16', label: '9:16 (Сторис)' },
  { value: '16:9', label: '16:9 (Широкий)' },
]

async function handleAddReference(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      referenceImages.value.push(e.target.result as string)
    }
  }
  reader.readAsDataURL(file)
}

function handleRemoveReference(index: number) {
  referenceImages.value.splice(index, 1)
}

async function generate() {
  if (!prompt.value) return

  isGenerating.value = true
  try {
    // TODO: Call API with referenceImages and prompt
    // Simulating for now
    await new Promise(resolve => setTimeout(resolve, 2000))
    generatedImage.value = 'https://placehold.co/512x512/1a1a1a/white?text=Generated'
  } finally {
    isGenerating.value = false
  }
}

function addToPost() {
  if (generatedImage.value) {
    addImage(generatedImage.value)
  }
}
</script>

<template>
  <div class="flex flex-col h-full p-4 space-y-4 overflow-auto">
    <!-- Reference images stack -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-zinc-300">Референсы</h3>
      <ImageStack
        :images="referenceImages"
        @add="handleAddReference"
        @remove="handleRemoveReference"
      />
    </div>

    <div class="border-t border-zinc-800 pt-4 space-y-4">
      <!-- Prompt -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-zinc-300">Промпт</label>
        <Textarea
          v-model="prompt"
          placeholder="Опиши, что нужно сгенерировать..."
          class="min-h-[80px] bg-zinc-800 border-zinc-700"
        />
      </div>

      <!-- Aspect ratio -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-zinc-300">Соотношение сторон</label>
        <Select v-model="aspectRatio">
          <SelectTrigger class="bg-zinc-800 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="ar in aspectRatios" :key="ar.value" :value="ar.value">
              {{ ar.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Generate button -->
      <Button
        @click="generate"
        :disabled="!prompt || isGenerating"
        class="w-full"
      >
        <Sparkles class="w-4 h-4 mr-2" />
        {{ isGenerating ? 'Генерация...' : 'Сгенерировать' }}
      </Button>
    </div>

    <!-- Result -->
    <div v-if="generatedImage" class="border-t border-zinc-800 pt-4 space-y-3">
      <h3 class="text-sm font-medium text-zinc-300">Результат</h3>

      <div class="rounded-lg overflow-hidden bg-zinc-800">
        <img :src="generatedImage" class="w-full" />
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm">
          <Copy class="w-4 h-4 mr-1" />
          Копировать
        </Button>
        <Button variant="outline" size="sm">
          <Download class="w-4 h-4 mr-1" />
          Скачать
        </Button>
        <Button size="sm" @click="addToPost">
          <ArrowRight class="w-4 h-4 mr-1" />
          В пост
        </Button>
      </div>
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as EditorImagesPanel } from './components/EditorImagesPanel.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add image generation panel with multi-input support"
```

---

## Phase 6: Reels Script Editor

### Task 6.1: Create Timeline Component

**Files:**
- Create: `lib-modules/content-editor/components/ReelTimeline.vue`

**Step 1: Create timeline**

File: `lib-modules/content-editor/components/ReelTimeline.vue`
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ReelScript, ReelFrame } from '../types'
import { cn } from '~/lib-modules/utils'

interface Props {
  script: ReelScript
  currentSecond: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'seek', second: number): void
}>()

const timelineRef = ref<HTMLDivElement>()

const secondsArray = computed(() =>
  Array.from({ length: props.script.duration }, (_, i) => i)
)

const frameSeconds = computed(() =>
  new Set(props.script.frames.map(f => f.second))
)

function handleClick(event: MouseEvent) {
  if (!timelineRef.value) return

  const rect = timelineRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width
  const second = Math.floor(percentage * props.script.duration)

  emit('seek', Math.max(0, Math.min(second, props.script.duration - 1)))
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="space-y-2">
    <!-- Time display -->
    <div class="flex justify-between text-xs text-zinc-500">
      <span>{{ formatTime(currentSecond) }}</span>
      <span>{{ formatTime(script.duration) }}</span>
    </div>

    <!-- Timeline bar -->
    <div
      ref="timelineRef"
      class="relative h-8 bg-zinc-800 rounded-lg cursor-pointer overflow-hidden"
      @click="handleClick"
    >
      <!-- Second markers -->
      <div class="absolute inset-0 flex">
        <div
          v-for="sec in secondsArray"
          :key="sec"
          :class="cn(
            'flex-1 border-r border-zinc-700/50 relative',
            frameSeconds.has(sec) && 'bg-blue-900/30'
          )"
        >
          <!-- Frame indicator -->
          <div
            v-if="frameSeconds.has(sec)"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
          />
        </div>
      </div>

      <!-- Current position indicator -->
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transition-all duration-100"
        :style="{ left: `${(currentSecond / script.duration) * 100}%` }"
      />
    </div>

    <!-- Second numbers (sparse) -->
    <div class="flex justify-between text-xs text-zinc-600">
      <span v-for="i in 5" :key="i">
        {{ formatTime(Math.floor(((i - 1) / 4) * script.duration)) }}
      </span>
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as ReelTimeline } from './components/ReelTimeline.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add ReelTimeline component with frame indicators"
```

---

### Task 6.2: Create Frame Editor Component

**Files:**
- Create: `lib-modules/content-editor/components/FrameEditor.vue`

**Step 1: Create frame editor**

File: `lib-modules/content-editor/components/FrameEditor.vue`
```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { ReelFrame } from '../types'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Upload, Sparkles, HelpCircle } from 'lucide-vue-next'

interface Props {
  second: number
  frame: ReelFrame | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', data: Partial<ReelFrame>): void
  (e: 'generateVisual'): void
  (e: 'uploadVisual'): void
}>()

const description = computed({
  get: () => props.frame?.description ?? '',
  set: (val) => emit('update', { description: val })
})

const voiceover = computed({
  get: () => props.frame?.voiceover ?? '',
  set: (val) => emit('update', { voiceover: val })
})
</script>

<template>
  <div class="space-y-4 p-4 bg-zinc-900 rounded-lg">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium">Секунда {{ second }}</h3>
    </div>

    <!-- Visual preview -->
    <div class="space-y-2">
      <label class="text-xs text-zinc-400">Визуал (опционально)</label>
      <div
        v-if="frame?.visualUrl"
        class="w-full aspect-[9/16] max-w-[200px] rounded-lg overflow-hidden bg-zinc-800"
      >
        <img :src="frame.visualUrl" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-full aspect-[9/16] max-w-[200px] rounded-lg bg-zinc-800 flex items-center justify-center"
      >
        <HelpCircle class="w-8 h-8 text-zinc-600" />
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="emit('uploadVisual')">
          <Upload class="w-3 h-3 mr-1" />
          Загрузить
        </Button>
        <Button variant="outline" size="sm" @click="emit('generateVisual')">
          <Sparkles class="w-3 h-3 mr-1" />
          Сгенерировать
        </Button>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label class="text-xs text-zinc-400">Описание кадра</label>
      <Textarea
        v-model="description"
        placeholder="Что происходит в этом кадре..."
        class="min-h-[60px] bg-zinc-800 border-zinc-700 text-sm"
      />
    </div>

    <!-- Voiceover/Text -->
    <div class="space-y-2">
      <label class="text-xs text-zinc-400">Текст / Войсовер</label>
      <Textarea
        v-model="voiceover"
        placeholder="Что говорить или показывать текстом..."
        class="min-h-[60px] bg-zinc-800 border-zinc-700 text-sm"
      />
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as FrameEditor } from './components/FrameEditor.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add FrameEditor component for reel script editing"
```

---

### Task 6.3: Create Reel Script Panel

**Files:**
- Create: `lib-modules/content-editor/components/ReelScriptPanel.vue`

**Step 1: Create reel script panel**

File: `lib-modules/content-editor/components/ReelScriptPanel.vue`
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useContentEditor } from '../composables/useContentEditor'
import ReelTimeline from './ReelTimeline.vue'
import FrameEditor from './FrameEditor.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import type { ReelFrame } from '../types'

const { currentDraft, updateDraft, updateFrame, setDuration } = useContentEditor()

const currentSecond = ref(0)

const script = computed(() => currentDraft.value?.script)

const currentFrame = computed(() =>
  script.value?.frames.find(f => f.second === currentSecond.value)
)

const durationOptions = [15, 30, 45, 60, 90]

function handleSeek(second: number) {
  currentSecond.value = second
}

function handleFrameUpdate(data: Partial<ReelFrame>) {
  updateFrame(currentSecond.value, data)
}

function handleDurationChange(value: string) {
  setDuration(parseInt(value))
}
</script>

<template>
  <div v-if="script" class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-zinc-800 space-y-4">
      <!-- Duration selector -->
      <div class="flex items-center gap-3">
        <label class="text-sm text-zinc-400">Длительность:</label>
        <Select :model-value="String(script.duration)" @update:model-value="handleDurationChange">
          <SelectTrigger class="w-24 bg-zinc-800 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="d in durationOptions" :key="d" :value="String(d)">
              {{ d }} сек
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Timeline -->
      <ReelTimeline
        :script="script"
        :current-second="currentSecond"
        @seek="handleSeek"
      />
    </div>

    <!-- Frame editor -->
    <div class="flex-1 overflow-auto p-4">
      <FrameEditor
        :second="currentSecond"
        :frame="currentFrame"
        @update="handleFrameUpdate"
        @generate-visual="() => {/* TODO */}"
        @upload-visual="() => {/* TODO */}"
      />
    </div>

    <!-- Bottom: Reel description & hashtags -->
    <div class="border-t border-zinc-800 p-4 space-y-3">
      <div class="space-y-2">
        <label class="text-xs text-zinc-400">Описание рилса</label>
        <Textarea
          :model-value="currentDraft?.description"
          @update:model-value="(val) => updateDraft({ description: val })"
          placeholder="Описание для рилса..."
          class="min-h-[60px] bg-zinc-800 border-zinc-700 text-sm"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs text-zinc-400">Хештеги</label>
        <Input
          :model-value="currentDraft?.hashtags.join(' ')"
          @update:model-value="(val) => updateDraft({ hashtags: val.split(' ').filter(Boolean) })"
          placeholder="#рилс #контент"
          class="bg-zinc-800 border-zinc-700"
        />
      </div>
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as ReelScriptPanel } from './components/ReelScriptPanel.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add ReelScriptPanel with timeline and frame editing"
```

---

## Phase 7: Post Preview Panel

### Task 7.1: Create Post Preview Component

**Files:**
- Create: `lib-modules/content-editor/components/PostPreviewPanel.vue`

**Step 1: Create post preview**

File: `lib-modules/content-editor/components/PostPreviewPanel.vue`
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useContentEditor } from '../composables/useContentEditor'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { CalendarIcon, Save, Check, ImagePlus, X } from 'lucide-vue-next'
import type { ContentType } from '../types'

const { currentDraft, updateDraft, saveDraft, isSaving, removeImage } = useContentEditor()

const contentTypes: Array<{ value: ContentType; label: string }> = [
  { value: 'post', label: 'Пост' },
  { value: 'story', label: 'Сторис' },
  { value: 'reel', label: 'Рилс' },
  { value: 'carousel', label: 'Карусель' },
]

function handleTypeChange(type: string) {
  updateDraft({
    type: type as ContentType,
    script: type === 'reel' ? { duration: 30, frames: [] } : undefined
  })
}

function markAsReady() {
  updateDraft({ status: 'ready' })
  saveDraft()
}
</script>

<template>
  <div v-if="currentDraft" class="flex flex-col h-full">
    <!-- Header with type selector -->
    <div class="p-4 border-b border-zinc-800 flex items-center gap-3">
      <Select :model-value="currentDraft.type" @update:model-value="handleTypeChange">
        <SelectTrigger class="w-32 bg-zinc-800 border-zinc-700">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="ct in contentTypes" :key="ct.value" :value="ct.value">
            {{ ct.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Content area -->
    <div class="flex-1 overflow-auto p-4 space-y-4">
      <!-- Images (for post/story/carousel) -->
      <div v-if="currentDraft.type !== 'reel'" class="space-y-2">
        <label class="text-xs text-zinc-400">Изображения</label>

        <div v-if="currentDraft.images.length > 0" class="grid grid-cols-2 gap-2">
          <div
            v-for="(img, idx) in currentDraft.images"
            :key="idx"
            class="relative aspect-square rounded-lg overflow-hidden bg-zinc-800"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              @click="removeImage(idx)"
              class="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>

        <div
          v-else
          class="aspect-square max-w-[200px] rounded-lg bg-zinc-800 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:bg-zinc-700/50"
        >
          <ImagePlus class="w-8 h-8 mb-2" />
          <span class="text-xs">Добавь через генератор</span>
        </div>
      </div>

      <!-- Description -->
      <div v-if="currentDraft.type !== 'reel'" class="space-y-2">
        <label class="text-xs text-zinc-400">Описание</label>
        <Textarea
          :model-value="currentDraft.description"
          @update:model-value="(val) => updateDraft({ description: val })"
          placeholder="Текст поста..."
          class="min-h-[120px] bg-zinc-800 border-zinc-700"
        />
      </div>

      <!-- Hashtags -->
      <div v-if="currentDraft.type !== 'reel'" class="space-y-2">
        <label class="text-xs text-zinc-400">Хештеги</label>
        <Input
          :model-value="currentDraft.hashtags.join(' ')"
          @update:model-value="(val) => updateDraft({ hashtags: val.split(' ').filter(Boolean) })"
          placeholder="#smm #контент"
          class="bg-zinc-800 border-zinc-700"
        />
      </div>

      <!-- Reel script editor -->
      <div v-if="currentDraft.type === 'reel'">
        <slot name="reel-script" />
      </div>

      <!-- Date -->
      <div class="space-y-2">
        <label class="text-xs text-zinc-400">Дата публикации</label>
        <div class="flex items-center gap-2">
          <CalendarIcon class="w-4 h-4 text-zinc-500" />
          <Input
            type="date"
            :model-value="currentDraft.scheduledDate || ''"
            @update:model-value="(val) => updateDraft({ scheduledDate: val || null })"
            class="bg-zinc-800 border-zinc-700"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-4 border-t border-zinc-800 flex gap-2">
      <Button variant="outline" @click="saveDraft" :disabled="isSaving" class="flex-1">
        <Save class="w-4 h-4 mr-2" />
        Сохранить черновик
      </Button>
      <Button @click="markAsReady" :disabled="isSaving" class="flex-1">
        <Check class="w-4 h-4 mr-2" />
        Готов
      </Button>
    </div>
  </div>
</template>
```

**Step 2: Export from index**

Add to `lib-modules/content-editor/index.ts`:
```typescript
export { default as PostPreviewPanel } from './components/PostPreviewPanel.vue'
```

**Step 3: Commit**

```bash
git add lib-modules/content-editor/
git commit -m "feat(content-editor): add PostPreviewPanel with content type switching"
```

---

## Phase 8: Integration & Routing

### Task 8.1: Update Editor Page with All Panels

**Files:**
- Modify: `pages/app/editor/[[postId]].vue`

**Step 1: Update editor page**

File: `pages/app/editor/[[postId]].vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  PostPreviewPanel,
  ReelScriptPanel,
  useContentEditor
} from '~/lib-modules/content-editor'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { currentDraft, createNewDraft, editorMode, isReel } = useContentEditor()

onMounted(() => {
  const postId = route.params.postId as string | undefined
  if (postId) {
    // TODO: Load existing post
    console.log('Loading post:', postId)
  } else if (!currentDraft.value) {
    createNewDraft('post', 'default-account')
  }
})
</script>

<template>
  <ContentEditorLayout>
    <template #left-panel>
      <EditorChatPanel v-if="editorMode === 'chat'" />
      <EditorImagesPanel v-else />
    </template>

    <template #right-panel>
      <PostPreviewPanel v-if="!isReel">
        <template #reel-script>
          <!-- Not used for non-reel content -->
        </template>
      </PostPreviewPanel>

      <ReelScriptPanel v-else />
    </template>
  </ContentEditorLayout>
</template>
```

**Step 2: Commit**

```bash
git add pages/app/editor/
git commit -m "feat(pages): integrate all editor panels into editor page"
```

---

### Task 8.2: Add Trends Route

**Files:**
- Create: `pages/app/trends.vue`

**Step 1: Create trends page**

File: `pages/app/trends.vue`
```vue
<script setup lang="ts">
import ReelsResearchPage from '~/lib-modules/reels-research/components/ReelsResearchPage.vue'

definePageMeta({
  layout: 'app'
})
</script>

<template>
  <ReelsResearchPage />
</template>
```

**Step 2: Commit**

```bash
git add pages/app/trends.vue
git commit -m "feat(pages): add /app/trends route"
```

---

### Task 8.3: Add Settings Route

**Files:**
- Create: `pages/app/settings.vue`

**Step 1: Create settings page placeholder**

File: `pages/app/settings.vue`
```vue
<script setup lang="ts">
definePageMeta({
  layout: 'app'
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Настройки</h1>
    <p class="text-zinc-400">Страница настроек (будет реализована)</p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add pages/app/settings.vue
git commit -m "feat(pages): add /app/settings route placeholder"
```

---

### Task 8.4: Configure Default Route Redirect

**Files:**
- Modify: `pages/app/index.vue` (create if doesn't exist)

**Step 1: Create redirect page**

File: `pages/app/index.vue`
```vue
<script setup lang="ts">
definePageMeta({
  layout: false
})

navigateTo('/app/calendar', { replace: true })
</script>

<template>
  <div />
</template>
```

**Step 2: Commit**

```bash
git add pages/app/index.vue
git commit -m "feat(pages): redirect /app to /app/calendar"
```

---

## Final: Summary Commit

**Step 1: Create summary commit**

```bash
git add -A
git commit -m "feat: complete SMM UX redesign implementation

Major changes:
- New sidebar layout (lib-modules/app-layout)
- Content Editor with dual-panel layout
- Reels Script Editor with timeline
- Multi-input image generation (ImageStack)
- Account-based calendar filtering
- New routes: /app/calendar, /app/editor, /app/trends, /app/settings

See docs/plans/2026-03-27-smm-ux-redesign.md for design details"
```

---

## Testing Checklist

After implementation, verify:

- [ ] `/app/calendar` loads with new sidebar layout
- [ ] Sidebar navigation works between sections
- [ ] Brand selector in header shows projects
- [ ] Calendar shows posts filtered by accounts (not networks)
- [ ] Click on calendar day opens editor
- [ ] Editor dual-panel layout works
- [ ] Chat/Images mode switcher works
- [ ] Image stack accepts up to 14 images
- [ ] Content type switcher (post/story/reel/carousel) works
- [ ] Reel timeline shows seconds
- [ ] Frame editor updates frame data
- [ ] Save draft / Ready buttons work
