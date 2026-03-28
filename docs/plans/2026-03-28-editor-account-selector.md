# Editor Account Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add account selection sidebar to the post editor, sharing project context with calendar via Pinia store.

**Architecture:** Create a shared Pinia store for project/account state. Refactor `useContentCalendar` to consume it. Extend `AccountsSidebar` with single-select mode. Integrate sidebar into editor layout.

**Tech Stack:** Vue 3, Pinia, TypeScript, Tailwind CSS

---

## Task 1: Create Shared Project Store

**Files:**
- Create: `lib-modules/content-calendar/stores/contentProjectStore.ts`
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Create the store file**

```typescript
// lib-modules/content-calendar/stores/contentProjectStore.ts
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { SocialAccount } from '../types'
import { demoProjects as initialDemoProjects } from '../data/demoData'

export const useContentProjectStore = defineStore('contentProject', () => {
  // State
  const projects = reactive([...initialDemoProjects])
  const selectedProjectId = ref<string>('coffee-shop')

  // Computed
  const currentProject = computed(() =>
    projects.find(p => p.id === selectedProjectId.value) ?? projects[0]
  )

  const currentProjectAccounts = computed<SocialAccount[]>(() =>
    currentProject.value?.accounts ?? []
  )

  // Actions
  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
  }

  return {
    projects,
    selectedProjectId,
    currentProject,
    currentProjectAccounts,
    selectProject
  }
})
```

**Step 2: Export from module index**

Add to `lib-modules/content-calendar/index.ts`:

```typescript
export { useContentProjectStore } from './stores/contentProjectStore'
```

**Step 3: Verify store works**

Run: `yarn dev` and check no errors in console.

**Step 4: Commit**

```bash
git add lib-modules/content-calendar/stores/contentProjectStore.ts lib-modules/content-calendar/index.ts
git commit -m "feat(content-calendar): add shared project store"
```

---

## Task 2: Refactor useContentCalendar to Use Store

**Files:**
- Modify: `lib-modules/content-calendar/composables/useContentCalendar.ts`

**Step 1: Import and use the store**

Replace local project state with store:

```typescript
// At the top of the file, add:
import { useContentProjectStore } from '../stores/contentProjectStore'

// Inside useContentCalendar function, replace:
// const projects = reactive([...initialDemoProjects])
// const selectedProjectId = ref<string>('coffee-shop')
// With:
const projectStore = useContentProjectStore()
const { projects, selectedProjectId, currentProject } = storeToRefs(projectStore)
```

**Step 2: Remove local currentProject computed**

Delete:
```typescript
// DELETE THIS:
const currentProject = computed(() =>
  projects.find(p => p.id === selectedProjectId.value) ?? projects[0]
)
```

**Step 3: Update selectProject to use store**

Replace:
```typescript
function selectProject(projectId: string) {
  selectedProjectId.value = projectId
  selectedDate.value = null
  selectedPostId.value = null
}
```

With:
```typescript
function selectProject(projectId: string) {
  projectStore.selectProject(projectId)
  selectedDate.value = null
  selectedPostId.value = null
}
```

**Step 4: Verify calendar still works**

Run: `yarn dev`, navigate to `/app/calendar`, verify:
- Projects load
- Switching projects works
- Posts display correctly

**Step 5: Commit**

```bash
git add lib-modules/content-calendar/composables/useContentCalendar.ts
git commit -m "refactor(content-calendar): use shared project store"
```

---

## Task 3: Add Single-Select Mode to AccountsSidebar

**Files:**
- Modify: `lib-modules/content-calendar/components/AccountsSidebar.vue`

**Step 1: Update props interface**

Change props:

```typescript
const props = withDefaults(defineProps<{
  accounts: SocialAccount[]
  activeAccountIds?: string[]
  selectedAccountId?: string
  singleSelect?: boolean
}>(), {
  activeAccountIds: () => [],
  singleSelect: false
})
```

**Step 2: Update emit interface**

Change emits:

```typescript
const emit = defineEmits<{
  toggle: [accountId: string]
  select: [accountId: string]
}>()
```

**Step 3: Update isActive function**

Replace:

```typescript
function isActive(accountId: string): boolean {
  return props.activeAccountIds.includes(accountId)
}
```

With:

```typescript
function isActive(accountId: string): boolean {
  if (props.singleSelect) {
    return props.selectedAccountId === accountId
  }
  return props.activeAccountIds.includes(accountId)
}
```

**Step 4: Update click handler**

In template, change the button click:

```vue
@click="props.singleSelect ? emit('select', account.id) : emit('toggle', account.id)"
```

**Step 5: Verify calendar still works**

Run: `yarn dev`, navigate to `/app/calendar`, verify account toggling still works.

**Step 6: Commit**

```bash
git add lib-modules/content-calendar/components/AccountsSidebar.vue
git commit -m "feat(AccountsSidebar): add single-select mode"
```

---

## Task 4: Add Account Selection to Content Editor Store

**Files:**
- Modify: `lib-modules/content-editor/stores/contentEditorStore.ts`

**Step 1: Add selectedAccountId state**

After line 18 (`const postId = ref<string | null>(null)`), add:

```typescript
const selectedAccountId = ref<string | null>(null)
```

**Step 2: Add selectAccount action**

After `setPostId` function, add:

```typescript
const selectAccount = (accountId: string) => {
  selectedAccountId.value = accountId
  // Also update the draft if it exists
  if (currentDraft.value) {
    currentDraft.value = { ...currentDraft.value, accountId }
  }
}
```

**Step 3: Update createNewDraft to set selectedAccountId**

In `createNewDraft` function, after creating the draft object, add:

```typescript
selectedAccountId.value = accountId
```

**Step 4: Export new state and action**

In return statement, add:

```typescript
selectedAccountId: computed(() => selectedAccountId.value),
// ...
selectAccount,
```

**Step 5: Commit**

```bash
git add lib-modules/content-editor/stores/contentEditorStore.ts
git commit -m "feat(content-editor): add account selection state"
```

---

## Task 5: Update useContentEditor Composable

**Files:**
- Modify: `lib-modules/content-editor/composables/useContentEditor.ts`

**Step 1: Import project store**

At top:

```typescript
import { useContentProjectStore } from '~/lib-modules/content-calendar'
```

**Step 2: Add project store to composable**

Inside `useContentEditor` function:

```typescript
const projectStore = useContentProjectStore()
const { currentProjectAccounts } = storeToRefs(projectStore)
```

**Step 3: Add selectedAccountId to storeToRefs**

Add to the destructuring:

```typescript
const {
  // ... existing
  selectedAccountId
} = storeToRefs(store)
```

**Step 4: Export new values**

In return statement:

```typescript
return {
  // ... existing state
  selectedAccountId,
  currentProjectAccounts,

  // ... existing actions
  selectAccount: store.selectAccount,
}
```

**Step 5: Commit**

```bash
git add lib-modules/content-editor/composables/useContentEditor.ts
git commit -m "feat(content-editor): expose account selection in composable"
```

---

## Task 6: Add AccountsSidebar to Editor Layout

**Files:**
- Modify: `lib-modules/content-editor/components/ContentEditorLayout.vue`

**Step 1: Import AccountsSidebar and project store**

Add imports:

```typescript
import { AccountsSidebar, useContentProjectStore } from '~/lib-modules/content-calendar'
import { storeToRefs } from 'pinia'
```

**Step 2: Add store usage**

After existing useContentEditor:

```typescript
const projectStore = useContentProjectStore()
const { currentProjectAccounts } = storeToRefs(projectStore)

const { selectedAccountId, selectAccount } = useContentEditor()
```

**Step 3: Add sidebar to template**

In template, wrap main content in a flex container with sidebar. Replace the main content area (line 88):

```vue
<!-- Main content area -->
<div class="flex flex-1 overflow-hidden">
  <!-- Accounts Sidebar -->
  <AccountsSidebar
    :accounts="currentProjectAccounts"
    :selected-account-id="selectedAccountId ?? undefined"
    :single-select="true"
    @select="selectAccount"
  />

  <!-- Existing panels container -->
  <div ref="containerRef" class="flex flex-1 overflow-hidden">
    <!-- Left panel... existing code -->
  </div>
</div>
```

**Step 4: Verify layout**

Run: `yarn dev`, navigate to `/app/editor`, verify:
- Sidebar appears on the left
- Accounts from current project are shown
- Clicking an account selects it (radio behavior)

**Step 5: Commit**

```bash
git add lib-modules/content-editor/components/ContentEditorLayout.vue
git commit -m "feat(editor): add accounts sidebar to layout"
```

---

## Task 7: Initialize Account on Editor Load

**Files:**
- Modify: `pages/app/editor/[[postId]].vue`

**Step 1: Import project store**

Add:

```typescript
import { useContentProjectStore } from '~/lib-modules/content-calendar'
import { storeToRefs } from 'pinia'
```

**Step 2: Get current project accounts**

After existing useContentEditor:

```typescript
const projectStore = useContentProjectStore()
const { currentProjectAccounts } = storeToRefs(projectStore)
```

**Step 3: Update createNewDraft call**

Replace hardcoded `'default-account'`:

```typescript
// Before:
createNewDraft('post', 'default-account')

// After:
const defaultAccountId = currentProjectAccounts.value[0]?.id || ''
createNewDraft('post', defaultAccountId)
```

**Step 4: Verify initialization**

Run: `yarn dev`, navigate to `/app/editor`:
- First account should be pre-selected
- Draft should have correct accountId

**Step 5: Commit**

```bash
git add pages/app/editor/[[postId]].vue
git commit -m "feat(editor): initialize with first project account"
```

---

## Task 8: Export AccountsSidebar from Module

**Files:**
- Modify: `lib-modules/content-calendar/index.ts`

**Step 1: Add AccountsSidebar export**

```typescript
export { default as AccountsSidebar } from './components/AccountsSidebar.vue'
```

**Step 2: Verify import works**

Check that `ContentEditorLayout.vue` imports without errors.

**Step 3: Commit**

```bash
git add lib-modules/content-calendar/index.ts
git commit -m "feat(content-calendar): export AccountsSidebar component"
```

---

## Task 9: Final Integration Test

**Step 1: Test calendar flow**

1. Go to `/app/calendar`
2. Switch projects - verify accounts update
3. Toggle accounts - verify filtering works

**Step 2: Test editor flow**

1. Go to `/app/editor`
2. Verify sidebar shows current project accounts
3. Click different account - verify selection changes
4. Create post - verify accountId is set correctly

**Step 3: Test navigation flow**

1. In calendar, select a project
2. Navigate to editor
3. Verify same project's accounts are shown
4. Navigate back to calendar
5. Verify project selection persisted

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: integration issues"
```
