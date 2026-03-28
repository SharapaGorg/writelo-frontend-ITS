# Editor-Calendar Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect calendar posts with content editor, showing proper New/Edit mode and scheduled date in header.

**Architecture:** Minimal changes to editor components - move date/time to header, add edit mode detection via route params, prepare stub for post loading API.

**Tech Stack:** Vue 3, Pinia, TypeScript, Tailwind CSS, Lucide icons

---

## Task 1: Remove Carousel from Content Types

**Files:**
- Modify: `lib-modules/content-editor/types/index.ts:1`
- Modify: `lib-modules/content-editor/components/PostPreviewPanel.vue:34-39`

**Step 1: Update ContentType in types**

In `lib-modules/content-editor/types/index.ts`, change line 1:

```typescript
// Before
export type ContentType = 'post' | 'story' | 'reel' | 'carousel'

// After
export type ContentType = 'post' | 'story' | 'reel'
```

**Step 2: Remove Carousel from selector**

In `lib-modules/content-editor/components/PostPreviewPanel.vue`, update the contentTypes array:

```typescript
// Before
const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
  { value: 'carousel', label: 'Carousel' }
]

// After
const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' }
]
```

**Step 3: Verify no TypeScript errors**

Run: `yarn build`
Expected: No type errors

**Step 4: Commit**

```bash
git add lib-modules/content-editor/types/index.ts lib-modules/content-editor/components/PostPreviewPanel.vue
git commit -m "refactor: remove carousel content type"
```

---

## Task 2: Add Edit Mode and PostId to Store

**Files:**
- Modify: `lib-modules/content-editor/stores/contentEditorStore.ts`
- Modify: `lib-modules/content-editor/composables/useContentEditor.ts`

**Step 1: Add postId and isEditMode to store**

In `lib-modules/content-editor/stores/contentEditorStore.ts`, after line 17 (`const conversationId = ref<string | null>(null)`), add:

```typescript
const postId = ref<string | null>(null)
```

After line 20 (`const isReel = computed(...)`), add:

```typescript
const isEditMode = computed(() => postId.value !== null)
```

**Step 2: Add setPostId action**

After the `setConversationId` function (around line 158), add:

```typescript
const setPostId = (id: string | null) => {
  postId.value = id
}
```

**Step 3: Add loadDraft stub function**

After `setPostId`, add:

```typescript
// Stub for loading post data when API is ready
const loadDraft = (post: {
  id: string
  type: 'post' | 'story' | 'reel'
  title: string
  description?: string
  images?: string[]
  scheduledDate?: string | null
  status?: 'draft' | 'ready'
}) => {
  currentDraft.value = {
    id: post.id,
    type: post.type,
    accountId: 'default-account', // TODO: get from post when API ready
    title: post.title,
    description: post.description || '',
    hashtags: [],
    images: post.images || [],
    scheduledDate: post.scheduledDate || null,
    status: post.status || 'draft',
    script: post.type === 'reel' ? { duration: 0, frames: [] } : undefined
  }
  originalDraft.value = JSON.parse(JSON.stringify(currentDraft.value))
}
```

**Step 4: Export new properties and methods**

In the return statement, add:

```typescript
// Add to State section
postId: computed(() => postId.value),

// Add to Getters section
isEditMode,

// Add to Actions section
setPostId,
loadDraft,
```

**Step 5: Update useContentEditor composable**

In `lib-modules/content-editor/composables/useContentEditor.ts`, add to the destructured values from store and return:

```typescript
// Add these to the destructuring from store
postId,
isEditMode,
setPostId,
loadDraft,

// Add to the return statement
postId,
isEditMode,
setPostId,
loadDraft,
```

**Step 6: Verify build**

Run: `yarn build`
Expected: No errors

**Step 7: Commit**

```bash
git add lib-modules/content-editor/stores/contentEditorStore.ts lib-modules/content-editor/composables/useContentEditor.ts
git commit -m "feat: add edit mode and postId to editor store"
```

---

## Task 3: Remove Scheduled Date from PostPreviewPanel

**Files:**
- Modify: `lib-modules/content-editor/components/PostPreviewPanel.vue`

**Step 1: Remove scheduledDate computed and related code**

In `PostPreviewPanel.vue`, remove:

1. Line with `const scheduledDate = computed(...)`
2. The `updateScheduledDate` function
3. The `formattedDate` computed
4. The `CalendarIcon` import from lucide-vue-next

**Step 2: Remove Scheduled Date template section**

Remove this entire section from template:

```vue
<!-- Scheduled Date -->
<section class="space-y-2">
  <label class="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
    <CalendarIcon class="h-4 w-4" />
    Scheduled Date
  </label>
  <div class="relative">
    <Input
      type="datetime-local"
      :value="scheduledDate ?? ''"
      @change="updateScheduledDate"
      class="h-10"
    />
  </div>
  <p v-if="formattedDate" class="text-xs text-zinc-500 dark:text-zinc-400">
    Will be published: {{ formattedDate }}
  </p>
</section>
```

**Step 3: Check if Input component is still used**

If Input is no longer used anywhere else in the file, remove the import:
```typescript
import { Input } from '~/components/ui/input'
```

**Step 4: Verify build**

Run: `yarn build`
Expected: No errors

**Step 5: Commit**

```bash
git add lib-modules/content-editor/components/PostPreviewPanel.vue
git commit -m "refactor: remove scheduled date from post preview panel"
```

---

## Task 4: Update Header with Edit Mode and Date

**Files:**
- Modify: `lib-modules/content-editor/components/ContentEditorLayout.vue`

**Step 1: Add imports and composable values**

Update imports at top of script:

```typescript
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import interact from 'interactjs'
import { ArrowLeft, MessageSquare, Image, CalendarIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
```

Update destructuring from useContentEditor:

```typescript
const {
  currentDraft,
  editorMode,
  setEditorMode,
  goBackToCalendar,
  activePanel,
  setActivePanel,
  isEditMode,
  updateDraft
} = useContentEditor()
```

**Step 2: Update contentTypeLabel computed**

Replace the existing `contentTypeLabel` computed:

```typescript
const contentTypeLabel = computed(() => {
  if (!currentDraft.value) return 'New Content'
  const typeLabels: Record<string, string> = {
    post: 'Post',
    story: 'Story',
    reel: 'Reel'
  }
  const prefix = isEditMode.value ? 'Edit' : 'New'
  return `${prefix} ${typeLabels[currentDraft.value.type] || 'Content'}`
})
```

**Step 3: Add formatted date computed**

After contentTypeLabel, add:

```typescript
const formattedScheduledDate = computed(() => {
  if (!currentDraft.value?.scheduledDate) return null
  const date = new Date(currentDraft.value.scheduledDate)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateDraft({ scheduledDate: target.value || null })
}
```

**Step 4: Update header template**

Replace the header section:

```vue
<!-- Header -->
<header class="flex items-center gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 select-none">
  <Button
    variant="ghost"
    size="icon"
    @click="goBackToCalendar"
    class="h-8 w-8"
  >
    <ArrowLeft class="h-4 w-4" />
  </Button>

  <h1 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
    {{ contentTypeLabel }}
  </h1>

  <div class="flex-1" />

  <!-- Scheduled Date -->
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="gap-2">
        <CalendarIcon class="h-4 w-4" />
        <span v-if="formattedScheduledDate">{{ formattedScheduledDate }}</span>
        <span v-else class="text-zinc-500">Дата не выбрана</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-3" align="end">
      <input
        type="datetime-local"
        :value="currentDraft?.scheduledDate ?? ''"
        @change="handleDateChange"
        class="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
    </PopoverContent>
  </Popover>
</header>
```

**Step 5: Verify build**

Run: `yarn build`
Expected: No errors

**Step 6: Test visually**

Run: `yarn dev`
Navigate to `/app/editor` and verify:
- Header shows "New Post"
- Date picker button is visible
- Clicking date picker opens popover

**Step 7: Commit**

```bash
git add lib-modules/content-editor/components/ContentEditorLayout.vue
git commit -m "feat: add edit mode indicator and scheduled date to editor header"
```

---

## Task 5: Update Editor Page to Handle PostId

**Files:**
- Modify: `pages/app/editor/[[postId]].vue`

**Step 1: Update imports and composable**

```typescript
const {
  currentDraft,
  createNewDraft,
  editorMode,
  conversationId,
  setConversationId,
  loadChatMessages,
  setPostId,
  clearDraft
} = useContentEditor()
```

**Step 2: Update onMounted logic**

Replace the onMounted hook:

```typescript
onMounted(async () => {
  const postId = route.params.postId as string | undefined
  const chatId = route.query.chat as string | undefined

  if (postId) {
    // Set edit mode
    setPostId(postId)

    // TODO: Load post data when API is ready
    // try {
    //   const post = await apiController.getPost(postId)
    //   loadDraft(post)
    // } catch (error) {
    //   console.error('Failed to load post:', error)
    //   router.replace('/app/calendar')
    // }

    console.log('Edit mode: post ID =', postId, '(API not implemented yet)')

    // For now, create empty draft if none exists
    if (!currentDraft.value) {
      createNewDraft('post', 'default-account')
    }
  } else {
    // New post mode
    setPostId(null)
    if (!currentDraft.value) {
      createNewDraft('post', 'default-account')
    }
  }

  // Load existing chat if chat ID in URL
  if (chatId && chatId !== conversationId.value) {
    try {
      const conversation = await apiController.getConversation(chatId)
      if (conversation?.messages?.length) {
        setConversationId(chatId)
        loadChatMessages(conversation.messages)
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
      router.replace({ query: { ...route.query, chat: undefined } })
    }
  }
})
```

**Step 3: Verify build**

Run: `yarn build`
Expected: No errors

**Step 4: Test navigation**

Run: `yarn dev`
1. Navigate to `/app/editor` - should show "New Post"
2. Navigate to `/app/editor/some-id` - should show "Edit Post" (with console log)

**Step 5: Commit**

```bash
git add pages/app/editor/\\[\\[postId\\]\\].vue
git commit -m "feat: handle postId in editor page for edit mode"
```

---

## Task 6: Final Verification

**Step 1: Full build check**

Run: `yarn build`
Expected: Success with no errors

**Step 2: Visual verification**

Run: `yarn dev`

Test scenarios:
1. `/app/editor` - New Post mode, date picker in header
2. `/app/editor/test-123` - Edit Post mode (console shows "Edit mode")
3. Type selector shows only: Post, Story, Reel (no Carousel)
4. Date picker works and updates draft

**Step 3: Commit any remaining changes**

```bash
git status
# If any unstaged changes, add and commit
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Remove Carousel type | types, PostPreviewPanel |
| 2 | Add isEditMode to store | store, composable |
| 3 | Remove date from PostPreviewPanel | PostPreviewPanel |
| 4 | Add date to header | ContentEditorLayout |
| 5 | Handle postId in page | [[postId]].vue |
| 6 | Final verification | - |
