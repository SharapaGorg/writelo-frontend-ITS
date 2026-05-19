# Mobile Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the entire authenticated app (`/app/*`) usable on phones (`< 768px`) without "open on desktop" walls.

**Architecture:** Replace global sidebar with a fixed bottom tab-bar on mobile (Calendar / Video Analyzer / Trends / ⋯ → MoreSheet). Multi-panel pages adapt by panel role — peer panels (chat/history, edit/preview) become tab strips; config panels (accounts, filters) become Sheets triggered from the navbar.

**Tech Stack:** Vue 3 + Nuxt 3, Tailwind, shadcn-vue (`Sheet`/`Drawer` primitives already exist), VueUse (`@vueuse/core` for `useMediaQuery`), Pinia, vue-i18n.

**Spec:** `docs/superpowers/specs/2026-05-19-mobile-adaptation-design.md`

**Testing approach:** This codebase has no Vue component test suite (only logic tests under `tests/`). UI verification is **manual browser testing by the user**. Each phase ends with a browser-test gate — the engineer runs `yarn dev` (or relies on the user's running `:3000`), the user opens DevTools device mode at 375px width, confirms behaviour, and only then approves a commit. **Do not auto-commit** — wait for the user to say "работает".

---

## File map

**New files:**
- `composables/useViewport.ts` — reactive `isMobile` via VueUse media query.
- `components/molecules/TabStrip.vue` — segmented control for peer panels (assistant, editor, reels-script).
- `lib-modules/app-layout/components/MobileBottomTabBar.vue` — fixed bottom navigation, 4 slots.
- `lib-modules/app-layout/components/MoreSheet.vue` — bottom-sheet listing the rest of the nav + subscription/limits/publications.

**Modified files:**
- `lib-modules/app-layout/components/AppLayout.vue` — hide sidebar on mobile, mount bottom bar, padding for main slot.
- `lib-modules/app-layout/components/AppNavbar.vue` — mobile mode: title instead of breadcrumbs, compact workspace selector.
- `lib-modules/app-layout/index.ts` — re-export new components.
- `lib-modules/assistant/components/AssistantPage.vue` — peer-tabs wiring.
- `lib-modules/content-calendar/components/ContentCalendarPage.vue` — Accounts + Filters Sheets, hide right resizable panel on mobile.
- `lib-modules/content-editor/components/ContentEditorLayout.vue` — Edit/Preview tabs, Accounts Sheet, disable interact.js splitter on mobile.
- `i18n/locales/ru.json` + `i18n/locales/en.json` — labels for new UI.

**Untouched:** all single-column pages (video-analyzer, trends, activity, profile, plans, settings, workspaces, team) — Phase 2 is a verification pass only; fix what breaks, but expect zero structural changes.

---

## Phase 1 — Infrastructure & shell

After this phase, every page is reachable on mobile via the new bottom-bar. Pages may still be ugly inside (panels not yet adapted), but navigation works.

### Task 1.1: `useViewport` composable

**Files:**
- Create: `composables/useViewport.ts`

- [ ] **Step 1: Write the composable**

```ts
// composables/useViewport.ts
import { useMediaQuery } from '@vueuse/core'

const MOBILE_QUERY = '(max-width: 767px)'

export function useViewport() {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  return { isMobile }
}
```

- [ ] **Step 2: Verify type-check**

Run: `yarn nuxt prepare && yarn vue-tsc --noEmit` (or trust IDE) — should pass with no errors referencing the new file.

### Task 1.2: `TabStrip` molecule

This is the peer-tabs primitive used by Assistant (Phase 3) and Editor/Reels-Script (Phase 5). Define it now so all consumers share one styling.

**Files:**
- Create: `components/molecules/TabStrip.vue`

- [ ] **Step 1: Write the component**

```vue
<!-- components/molecules/TabStrip.vue -->
<script setup lang="ts" generic="T extends string">
import { cn } from '~/lib-modules/utils'

interface Tab<TId extends string> {
  id: TId
  label: string
}

const props = defineProps<{
  tabs: readonly Tab<T>[]
  modelValue: T
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function selectTab(id: T) {
  if (id !== props.modelValue) emit('update:modelValue', id)
}
</script>

<template>
  <div
    role="tablist"
    class="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      :class="cn(
        'flex-1 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
        modelValue === tab.id
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )"
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
```

- [ ] **Step 2: Smoke-mount in an existing page (temporary)**

In any easy page (e.g. `pages/app/activity.vue`) add at the top of the template, temporarily:

```vue
<TabStrip
  :tabs="[{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }]"
  v-model="demoTab"
/>
```

With `const demoTab = ref<'a' | 'b'>('a')` in script.

**Verify in browser at `/app/activity`:** two tabs render, click switches active state, classes change.

- [ ] **Step 3: Remove smoke-mount**

Revert the temporary `activity.vue` edits.

### Task 1.3: `MobileBottomTabBar`

**Files:**
- Create: `lib-modules/app-layout/components/MobileBottomTabBar.vue`
- Modify: `i18n/locales/ru.json`, `i18n/locales/en.json` — add `mobileNav.more` key.

- [ ] **Step 1: Add i18n keys**

In `i18n/locales/ru.json` add under a new `mobileNav` block (or merge into existing `sidebar` block):

```json
"mobileNav": { "more": "Ещё" }
```

In `i18n/locales/en.json`:

```json
"mobileNav": { "more": "More" }
```

- [ ] **Step 2: Write the component**

```vue
<!-- lib-modules/app-layout/components/MobileBottomTabBar.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Calendar, ScanSearch, TrendingUp, MoreHorizontal } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import MoreSheet from './MoreSheet.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const moreOpen = ref(false)

interface BarItem {
  id: 'calendar' | 'video-analyzer' | 'trends'
  icon: typeof Calendar
  label: string
  route: string
}

const items = computed<BarItem[]>(() => [
  { id: 'calendar', icon: Calendar, label: t('sidebar.items.calendar'), route: '/app/calendar' },
  { id: 'video-analyzer', icon: ScanSearch, label: t('sidebar.items.videoAnalyzer'), route: '/app/video-analyzer' },
  { id: 'trends', icon: TrendingUp, label: t('sidebar.items.trends'), route: '/app/trends' },
])

function isActive(item: BarItem) {
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

function navigate(item: BarItem) {
  router.push(item.route)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom);"
  >
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      :class="cn(
        'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors',
        isActive(item) ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
      )"
      @click="navigate(item)"
    >
      <span
        v-if="isActive(item)"
        class="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-brand"
      />
      <component :is="item.icon" class="h-5 w-5" />
      <span class="truncate max-w-[68px]">{{ item.label }}</span>
    </button>
    <button
      type="button"
      :class="cn(
        'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors',
        moreOpen ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
      )"
      @click="moreOpen = true"
    >
      <MoreHorizontal class="h-5 w-5" />
      <span>{{ t('mobileNav.more') }}</span>
    </button>

    <MoreSheet v-model:open="moreOpen" />
  </nav>
</template>
```

> Note: this imports `MoreSheet` which is created in Task 1.4. Order matters — write Task 1.4 next before browser-testing.

### Task 1.4: `MoreSheet`

**Files:**
- Create: `lib-modules/app-layout/components/MoreSheet.vue`

- [ ] **Step 1: Write the component**

```vue
<!-- lib-modules/app-layout/components/MoreSheet.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import {
  Sparkles,
  PenSquare,
  Briefcase,
  Users,
  History,
  User,
  Settings,
  Crown,
  LogIn,
  Send,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useAppLayout } from '../composables/useAppLayout'
import { useUserController } from '~/composables/user'
import { useSettings } from '~/composables/settings'
import { usePlans } from '~/lib-modules/plans'
import LimitsPanel from './LimitsPanel.vue'
import PublicationsPanel from './PublicationsPanel.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const settings = useSettings()
const subscription = computed(() => settings.getSubscription())
const isFreePlan = computed(() => {
  const sub = subscription.value
  return !sub || sub.price === 0
})
const planTitle = computed(() => subscription.value?.title ?? t('sidebar.freePlanFallback'))
const { isBusinessPlan } = usePlans()

const iconMap = {
  'sparkles': Sparkles,
  'pen-square': PenSquare,
  'briefcase': Briefcase,
  'users': Users,
  'history': History,
  'user': User,
  'settings': Settings,
} as const

// All sidebar items EXCEPT those already in the bottom bar
const BOTTOM_BAR_IDS = new Set(['calendar', 'video-analyzer', 'trends'])

const { sidebarItems, bottomItems } = useAppLayout()
const restItems = computed(() => [
  ...sidebarItems.value.filter(i => !BOTTOM_BAR_IDS.has(i.id)),
  ...bottomItems.value,
])

function isActive(itemRoute: string) {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

function navigate(itemRoute: string) {
  emit('update:open', false)
  router.push(itemRoute)
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="bottom" class="h-[92vh] flex flex-col gap-0 p-0">
      <SheetHeader class="p-4 border-b border-border">
        <SheetTitle class="text-lg font-semibold">Writelo</SheetTitle>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-4 py-3">
        <!-- Subscription chip -->
        <button
          v-if="isAuthenticated"
          type="button"
          :class="cn(
            'w-full flex items-center gap-2 rounded-md border px-3 py-2 text-left mb-2 transition-colors hover:bg-accent',
            isFreePlan
              ? 'border-border bg-muted/50'
              : 'border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/60'
          )"
          @click="navigate('/app/plans')"
        >
          <component
            :is="isFreePlan ? Sparkles : Crown"
            :class="cn(
              'h-4 w-4 shrink-0',
              isFreePlan ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
            )"
          />
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium truncate">
              {{ isFreePlan ? t('sidebar.freePlanLabel') : planTitle }}
            </div>
            <div v-if="isBusinessPlan" class="text-[11px] text-muted-foreground truncate">
              {{ t('sidebar.teamPlanLabel') }}
            </div>
            <div v-if="isFreePlan" class="text-[11px] text-muted-foreground truncate">
              {{ t('sidebar.openPlans') }}
            </div>
          </div>
        </button>

        <LimitsPanel />
        <PublicationsPanel />

        <!-- Nav items -->
        <nav class="mt-2 flex flex-col gap-1">
          <button
            v-for="item in restItems"
            :key="item.id"
            type="button"
            :class="cn(
              'w-full flex items-center gap-3 px-3 h-11 rounded-md text-sm font-medium transition-colors',
              isActive(item.route)
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/60'
            )"
            @click="navigate(item.route)"
          >
            <component :is="iconMap[item.icon as keyof typeof iconMap] ?? User" class="h-5 w-5 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </nav>

        <!-- Unauth login -->
        <Button
          v-if="!isAuthenticated"
          variant="default"
          class="w-full mt-3 gap-2 bg-brand text-brand-foreground hover:bg-brand/90 justify-start"
          @click="navigate('/auth')"
        >
          <LogIn class="h-5 w-5" />
          <span>{{ t('sidebar.login') }}</span>
        </Button>

        <a
          href="https://t.me/sharapagorg"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 flex items-center gap-3 px-3 h-10 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Send class="h-4 w-4 shrink-0" />
          <span>{{ t('sidebar.contactMe') }}</span>
        </a>
      </div>
    </SheetContent>
  </Sheet>
</template>
```

### Task 1.5: `AppLayout` restructure

**Files:**
- Modify: `lib-modules/app-layout/components/AppLayout.vue`

- [ ] **Step 1: Update layout to mount bottom bar and hide sidebar on mobile**

Replace the full file with:

```vue
<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import MobileBottomTabBar from './MobileBottomTabBar.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Sidebar — desktop only -->
    <AppSidebar class="hidden md:flex" />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 overflow-auto bg-background pb-14 md:pb-0">
        <slot />
      </main>
    </div>

    <!-- Bottom tab bar — mobile only (component handles md:hidden) -->
    <MobileBottomTabBar />
  </div>
</template>
```

> Note: `AppSidebar.vue` root element is `<aside class="flex ...">`. Adding `hidden md:flex` class via prop merge will work because Vue merges class attrs. Verify by inspecting in browser — should completely remove from layout flow on mobile.

### Task 1.6: `AppNavbar` mobile mode

**Files:**
- Modify: `lib-modules/app-layout/components/AppNavbar.vue`

- [ ] **Step 1: Update navbar template — responsive layout**

Replace the `<header>` block with:

```vue
<template>
  <header
    class="flex items-center h-14 md:h-16 px-3 md:px-6 border-b border-border bg-background gap-2 md:grid md:grid-cols-3"
  >
    <!-- Mobile: page title (last breadcrumb segment) -->
    <div class="flex-1 min-w-0 md:hidden">
      <h1 class="text-base font-semibold truncate">
        {{ props.breadcrumbs[props.breadcrumbs.length - 1]?.label }}
      </h1>
    </div>

    <!-- Desktop: full breadcrumbs -->
    <nav class="hidden md:flex items-center gap-1.5 text-sm min-w-0">
      <template v-for="(item, index) in props.breadcrumbs" :key="index">
        <ChevronRight
          v-if="index > 0"
          class="h-4 w-4 text-muted-foreground shrink-0"
        />
        <NuxtLink
          v-if="item.to && index < props.breadcrumbs.length - 1"
          :to="item.to"
          class="text-muted-foreground hover:text-foreground truncate transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else-if="index < props.breadcrumbs.length - 1"
          class="text-muted-foreground truncate"
        >
          {{ item.label }}
        </span>
        <span v-else class="text-foreground font-medium truncate">
          {{ item.label }}
        </span>
      </template>
    </nav>

    <!-- Workspace selector -->
    <div class="flex justify-center shrink-0">
      <Select
        v-if="props.showWorkspaceSelector && workspaces.length > 0"
        v-model="selectedWorkspaceId"
      >
        <SelectTrigger
          class="bg-card border-border w-[140px] md:w-[260px]"
        >
          <span class="flex items-center gap-2 min-w-0 w-full">
            <span class="truncate">{{ currentWorkspaceName || t('navbar.selectBrand') }}</span>
            <RoleBadge v-if="isBusinessPlan" :role="currentRole" class="shrink-0 hidden md:inline-flex" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="ws in workspaces"
            :key="ws.id"
            :value="ws.id"
            class="cursor-pointer"
          >
            <span class="flex items-center justify-between gap-2 w-full min-w-0">
              <span class="truncate">{{ ws.name }}</span>
              <RoleBadge v-if="isBusinessPlan" :role="ws.role" class="shrink-0" />
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <NuxtLink
        v-else-if="props.showWorkspaceSelector"
        to="/app/workspaces"
        class="inline-flex"
      >
        <Button variant="default" class="h-9 gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus class="h-4 w-4" />
          <span class="hidden md:inline">{{ t('navbar.createBrand') }}</span>
        </Button>
      </NuxtLink>
    </div>

    <!-- Right-side actions -->
    <div class="flex items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
```

> Note: on mobile, the 3-col grid collapses to flex. Page title takes available space, workspace selector shrinks to 140px, actions slot stays on the right. `RoleBadge` hidden in trigger on mobile to save room.

### Task 1.7: Export new components

**Files:**
- Modify: `lib-modules/app-layout/index.ts`

- [ ] **Step 1: Add exports**

Append to existing exports:

```ts
export { default as MobileBottomTabBar } from './components/MobileBottomTabBar.vue'
export { default as MoreSheet } from './components/MoreSheet.vue'
```

### Task 1.8: Phase 1 browser-test gate

- [ ] **Step 1: Verify shell behaviour**

Tell the user: "Phase 1 ready. Открой DevTools → device mode (375px), пройдись по `/app/calendar`, `/app/assistant`, `/app/profile`. Должно быть:
1. AppSidebar не виден на мобиле.
2. Снизу — bar с 4 кнопками: Calendar / Video Analyzer / Trends / Ещё.
3. Тап на Calendar/Video Analyzer/Trends → переход на страницу, активная иконка подсвечена.
4. Тап на Ещё → выезжает sheet снизу со списком (Assistant, Editor, Workspaces..., Profile, Settings) + subscription chip сверху.
5. AppNavbar: на мобиле слева заголовок страницы, по центру компактный workspace-селектор (~140px), справа всё как было.
6. На desktop (≥768px) всё как было — sidebar слева, breadcrumbs, центр-селектор."

- [ ] **Step 2: Wait for the user to say "работает" before committing**

- [ ] **Step 3: Commit**

```bash
git add composables/useViewport.ts \
  components/molecules/TabStrip.vue \
  lib-modules/app-layout/components/MobileBottomTabBar.vue \
  lib-modules/app-layout/components/MoreSheet.vue \
  lib-modules/app-layout/components/AppLayout.vue \
  lib-modules/app-layout/components/AppNavbar.vue \
  lib-modules/app-layout/index.ts \
  i18n/locales/ru.json i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat(app-layout): mobile shell — bottom tab-bar, MoreSheet, responsive navbar

Phase 1 of the mobile adaptation. AppSidebar hidden < md, replaced by a
fixed bottom tab-bar (Calendar / Video Analyzer / Trends / Ещё). The "Ещё"
slot opens a full-height bottom sheet with the rest of the navigation,
subscription chip, limits and publications. AppNavbar collapses to flex
on mobile with page title + compact workspace selector.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Single-column page sweep

Pure visual pass over already-single-column pages. Look for: horizontal overflow, fixed pixel widths that bust 375px, hover-only affordances, dialog widths.

**Pages to check (in order):**
1. `/app/video-analyzer` (and `/app/video-analyzer/[id]` if any)
2. `/app/trends`
3. `/app/activity`
4. `/app/profile`
5. `/app/plans`
6. `/app/settings`
7. `/app/workspaces`
8. `/app/team`

### Task 2.1: Audit each page at 375px and 768px

**Files:** likely modified — page-specific components under `lib-modules/<feature>/components/`. List explicitly when you find issues.

- [ ] **Step 1: For each page, in DevTools mobile mode, log findings**

Use a scratch markdown:
```
- video-analyzer: filter chips wrap fine, video grid 1-col on mobile — ok
- trends: drag-drop modal too tall, fixes max-h-[80vh] on mobile
- profile: cards stack — ok
- ...
```

- [ ] **Step 2: Apply fixes**

For each finding, write a small targeted edit. Stay focused: padding/max-width/overflow tweaks. Don't refactor.

Typical patterns:
- `max-w-md` → `max-w-md w-full px-4`
- `text-3xl` → `text-2xl md:text-3xl`
- Fixed `w-[500px]` modals → `w-full max-w-[500px] sm:w-[500px]`

- [ ] **Step 3: Phase 2 browser-test gate**

Tell the user: "Phase 2 ready. Пройдись по всем одноколоночным страницам на 375px — список того, что я правил: \[bullets per page\]. Скажи если где-то ещё рвёт."

- [ ] **Step 4: Wait for "работает", then commit**

```bash
git add lib-modules/<paths actually modified>
git commit -m "$(cat <<'EOF'
fix(app): mobile polish for single-column pages

Phase 2 of the mobile adaptation. Pure visual fixes (padding, max-width,
font-size, dialog sizing) across video-analyzer, trends, activity,
profile, plans, settings, workspaces, team. No structural changes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

> If a page has NO issues, that's fine — don't fabricate edits. Phase ends with whatever fixes were genuinely needed.

---

## Phase 3 — Assistant (peer-tabs pattern)

Introduce the Chat/History tab pattern. This is the FIRST place `TabStrip` is wired into a real page.

### Task 3.1: Wire TabStrip into AssistantPage

**Files:**
- Modify: `lib-modules/assistant/components/AssistantPage.vue`
- Modify: `i18n/locales/ru.json`, `i18n/locales/en.json` — add `assistantPage.tabs.chat` / `assistantPage.tabs.history`.

- [ ] **Step 1: Add i18n keys**

In `ru.json` under `assistantPage`:
```json
"tabs": { "chat": "Чат", "history": "История" }
```
In `en.json` under `assistantPage`:
```json
"tabs": { "chat": "Chat", "history": "History" }
```

- [ ] **Step 2: Rewrite AssistantPage template**

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces } from '~/lib-modules/workspaces'
import { useViewport } from '~/composables/useViewport'
import TabStrip from '~/components/molecules/TabStrip.vue'
import AssistantChat from './AssistantChat.vue'
import AssistantHistoryPanel from './AssistantHistoryPanel.vue'

const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { t } = useI18n()
const { isMobile } = useViewport()

type Tab = 'chat' | 'history'
const activeTab = ref<Tab>('chat')

const tabs = computed(() => [
  { id: 'chat' as const, label: t('assistantPage.tabs.chat') },
  { id: 'history' as const, label: t('assistantPage.tabs.history') },
])

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: t('assistantPage.breadcrumb') }]"
      :show-workspace-selector="true"
    />

    <!-- Mobile tab strip -->
    <div v-if="isMobile" class="px-3 py-2 border-b border-border">
      <TabStrip :tabs="tabs" v-model="activeTab" />
    </div>

    <div class="flex min-h-0 flex-1">
      <!-- Chat: full-width on mobile when active; flex-1 on desktop -->
      <div
        v-show="!isMobile || activeTab === 'chat'"
        class="min-w-0 flex-1"
      >
        <AssistantChat />
      </div>
      <!-- History: full-width on mobile when active; fixed right panel on desktop -->
      <AssistantHistoryPanel
        v-show="!isMobile || activeTab === 'history'"
        :class="isMobile ? 'flex-1 w-full' : ''"
      />
    </div>
  </div>
</template>
```

> Note: `v-show` (not `v-if`) so chat scroll position / streaming state aren't destroyed on tab switch. `AssistantHistoryPanel` keeps its desktop fixed width via its own classes; on mobile we add `flex-1 w-full` via :class override.

- [ ] **Step 3: Inspect AssistantHistoryPanel's root width**

Read `lib-modules/assistant/components/AssistantHistoryPanel.vue` and check the root element's classes. If it uses `w-[320px]` or similar fixed width:
- Either accept the :class override above (Tailwind class-merge wins last → `flex-1 w-full` overrides)
- Or wrap the inner with conditional classes: `:class="isMobile ? 'w-full' : 'w-[320px]'"` (cleaner)

Pick whichever fits the existing style of that file.

- [ ] **Step 4: Phase 3 browser-test gate**

Tell the user: "Phase 3 ready. На `/app/assistant` на 375px должны быть табы Чат/История сверху. Переключение мгновенное, состояние чата не теряется. На desktop (≥768px) ничего не изменилось — Chat слева, History справа."

- [ ] **Step 5: Wait for "работает", then commit**

```bash
git add lib-modules/assistant/components/AssistantPage.vue \
  lib-modules/assistant/components/AssistantHistoryPanel.vue \
  i18n/locales/ru.json i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat(assistant): mobile peer-tabs for Chat/History

Phase 3 of the mobile adaptation. On < md, AssistantPage gets a top
TabStrip switching between full-width Chat and full-width History. Uses
v-show to preserve chat scroll/stream state across switches.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4 — Calendar (config-Sheet pattern)

Adapt the heaviest multi-panel page. Accounts and Filters become Sheets triggered from the navbar; the right resizable panel doesn't render on mobile at all.

### Task 4.1: Inventory current calendar panels

**Files:**
- Read: `lib-modules/content-calendar/components/ContentCalendarPage.vue` (full file)
- Read: `lib-modules/content-calendar/components/SidebarContainer.vue` (the right resizable panel host)
- Read: `lib-modules/content-calendar/components/AccountsSidebar.vue`

- [ ] **Step 1: Map current layout**

Note in scratch what HTML structure ContentCalendarPage uses (root flex, side panels, grid). The plan can't be exhaustive here because we haven't read the entire file yet. The engineer is expected to read those three components before writing code.

### Task 4.2: Wrap AccountsSidebar in a mobile Sheet

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`
- Modify: `i18n/locales/ru.json`, `i18n/locales/en.json` — add `contentCalendar.mobile.accounts` and `contentCalendar.mobile.filters`.

- [ ] **Step 1: Add i18n keys**

```json
// ru
"mobile": { "accounts": "Аккаунты", "filters": "Фильтры" }
// en
"mobile": { "accounts": "Accounts", "filters": "Filters" }
```

- [ ] **Step 2: Add Sheet-wrap logic in ContentCalendarPage**

In `<script setup>`, add:

```ts
import { useViewport } from '~/composables/useViewport'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Users, SlidersHorizontal } from 'lucide-vue-next'

const { isMobile } = useViewport()
const accountsSheetOpen = ref(false)
const filtersSheetOpen = ref(false)
```

In template, replace the current `<AccountsSidebar ... />` inline render with:

```vue
<!-- Desktop: inline -->
<AccountsSidebar v-if="!isMobile" v-bind="<existing props>" />

<!-- Mobile: in a left Sheet -->
<Sheet v-if="isMobile" v-model:open="accountsSheetOpen">
  <SheetContent side="left" class="w-[88vw] max-w-[320px] p-0 flex flex-col">
    <SheetHeader class="p-4 border-b border-border">
      <SheetTitle>{{ t('contentCalendar.mobile.accounts') }}</SheetTitle>
    </SheetHeader>
    <div class="flex-1 overflow-y-auto">
      <AccountsSidebar v-bind="<existing props>" />
    </div>
  </SheetContent>
</Sheet>
```

Use the `<AppNavbar>`'s `actions` slot to add the trigger button:

```vue
<AppNavbar :breadcrumbs="[...]" :show-workspace-selector="true">
  <template #actions>
    <Button v-if="isMobile" variant="ghost" size="icon" @click="accountsSheetOpen = true">
      <Users class="h-5 w-5" />
    </Button>
    <Button v-if="isMobile" variant="ghost" size="icon" @click="filtersSheetOpen = true">
      <SlidersHorizontal class="h-5 w-5" />
    </Button>
    <!-- any existing actions stay -->
  </template>
</AppNavbar>
```

> Note: copy the exact props currently passed to `AccountsSidebar` — they include account list, selected ids, handlers (`@toggle-account`, `@unlink-request`, etc.). Don't drop any.

### Task 4.3: Hide right resizable panel on mobile, replace with Filters Sheet

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`

- [ ] **Step 1: Identify the right panel block**

Look for `SidebarContainer` (or the wrapper that holds Filters/Day detail/Right preview). It's almost certainly wrapped in some `<aside>` or `<div class="w-[280px] ... resize ...">`.

- [ ] **Step 2: Wrap in `v-if="!isMobile"`**

```vue
<SidebarContainer v-if="!isMobile" ... />
```

- [ ] **Step 3: Add a Filters Sheet replicating the most-used filter controls**

Look at `SocialFilters.vue` (already in the calendar components). If it's the active filter UI, move that subtree behind:

```vue
<Sheet v-if="isMobile" v-model:open="filtersSheetOpen">
  <SheetContent side="right" class="w-[88vw] max-w-[360px] p-0 flex flex-col">
    <SheetHeader class="p-4 border-b border-border">
      <SheetTitle>{{ t('contentCalendar.mobile.filters') }}</SheetTitle>
    </SheetHeader>
    <div class="flex-1 overflow-y-auto p-4">
      <SocialFilters v-bind="<existing props>" />
    </div>
  </SheetContent>
</Sheet>
```

> If `SidebarContainer` mounts BOTH filters AND day-detail-preview, only filters move into the Sheet on mobile. Day-detail/preview becomes a separate concern handled by `DayDetailPanel` — it likely opens as a mobile-friendly modal already, but verify.

### Task 4.4: Test calendar grid at 375px

- [ ] **Step 1: Visual check the calendar grid itself**

The 7-column month grid at 375px = ~50px per cell. That's tight but workable. Look for:
- Day cells truncating titles — ok, expected.
- Multiple-post indicators stacking — should already use dots.
- Month-prev/next buttons in header — ensure tap targets ≥40px.

Apply small fixes if anything overflows. Don't redesign the grid.

### Task 4.5: Phase 4 browser-test gate

- [ ] **Step 1: Verify**

Tell the user: "Phase 4 ready. На `/app/calendar` на 375px:
1. Календарь на всю ширину. AccountsSidebar и правая панель — НЕТ в DOM.
2. В навбаре справа две иконки: Users (Accounts) и Sliders (Filters).
3. Тап Users → выезжает sheet слева с тем же списком аккаунтов и обработчиками.
4. Тап Sliders → выезжает sheet справа с фильтрами.
5. На desktop ничего не изменилось — обе панели inline, никаких лишних кнопок в навбаре."

- [ ] **Step 2: Wait for "работает", then commit**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue \
  i18n/locales/ru.json i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat(content-calendar): mobile sheets for Accounts and Filters

Phase 4 of the mobile adaptation. On < md, AccountsSidebar and the right
resizable panel are removed from the inline layout. Two icon buttons in
the navbar open them as left/right Sheets respectively. Desktop layout
unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5 — Editor + Reels-Script (shared layout)

Both pages use the same `ContentEditorLayout`. One change touches both. Peer tabs for Edit/Preview, Accounts Sheet, disable drag-resize splitter.

### Task 5.1: Read the layout & figure out splitter wiring

**Files:**
- Read: `lib-modules/content-editor/components/ContentEditorLayout.vue` (full file)
- Read: `lib-modules/content-editor/composables/useContentEditor.ts`

- [ ] **Step 1: Find the interact.js setup**

It's around line 75-80 (resizable panel state). The setup is in `onMounted` and bound to `resizeHandleRef`. We need a `v-if="!isMobile"` on the handle element so interact.js never attaches.

- [ ] **Step 2: Find the two panels (left/right)**

`activePanel` ref is `'left' | 'right'`. The two panels are likely Editor (left) and PostPreviewPanel (right), each with `leftPanelWidth`-driven flex-basis.

### Task 5.2: Add peer tabs + Sheet wrap

**Files:**
- Modify: `lib-modules/content-editor/components/ContentEditorLayout.vue`
- Modify: `i18n/locales/ru.json`, `i18n/locales/en.json` — add `contentEditor.tabs.edit`, `contentEditor.tabs.preview`, `contentEditor.mobile.accounts`.

- [ ] **Step 1: Add i18n keys**

```json
// ru
"tabs": { "edit": "Текст", "preview": "Превью" },
"mobile": { "accounts": "Аккаунты" }
// en
"tabs": { "edit": "Edit", "preview": "Preview" },
"mobile": { "accounts": "Accounts" }
```

- [ ] **Step 2: Add tabs + Sheet wiring**

In script setup, add:

```ts
import { useViewport } from '~/composables/useViewport'
import TabStrip from '~/components/molecules/TabStrip.vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Users } from 'lucide-vue-next'

const { isMobile } = useViewport()
const accountsSheetOpen = ref(false)

type EditorTab = 'edit' | 'preview'
const activeTab = ref<EditorTab>('edit')
const tabs = computed(() => [
  { id: 'edit' as const, label: t('contentEditor.tabs.edit') },
  { id: 'preview' as const, label: t('contentEditor.tabs.preview') },
])
```

In template, structure:

```vue
<template>
  <div class="flex h-full flex-col">
    <AppNavbar :breadcrumbs="[...]" :show-workspace-selector="true">
      <template #actions>
        <Button v-if="isMobile" variant="ghost" size="icon" @click="accountsSheetOpen = true">
          <Users class="h-5 w-5" />
        </Button>
        <!-- existing actions stay -->
      </template>
    </AppNavbar>

    <!-- Mobile tab strip -->
    <div v-if="isMobile" class="px-3 py-2 border-b border-border">
      <TabStrip :tabs="tabs" v-model="activeTab" />
    </div>

    <div class="flex min-h-0 flex-1" ref="containerRef">
      <!-- AccountsSidebar: desktop inline, mobile sheet -->
      <AccountsSidebar v-if="!isMobile" v-bind="<existing props>" />
      <Sheet v-if="isMobile" v-model:open="accountsSheetOpen">
        <SheetContent side="left" class="w-[88vw] max-w-[320px] p-0 flex flex-col">
          <SheetHeader class="p-4 border-b border-border">
            <SheetTitle>{{ t('contentEditor.mobile.accounts') }}</SheetTitle>
          </SheetHeader>
          <div class="flex-1 overflow-y-auto">
            <AccountsSidebar v-bind="<existing props>" />
          </div>
        </SheetContent>
      </Sheet>

      <!-- Left/Edit panel -->
      <div
        v-show="!isMobile || activeTab === 'edit'"
        :class="cn(
          'min-w-0 overflow-hidden',
          isMobile ? 'flex-1 w-full' : ''
        )"
        :style="!isMobile ? { flexBasis: `${leftPanelWidth}%` } : undefined"
      >
        <!-- existing left panel content (EditorChatPanel / FrameEditor / etc.) -->
      </div>

      <!-- Resize handle — desktop only -->
      <div
        v-if="!isMobile"
        ref="resizeHandleRef"
        class="w-1 cursor-col-resize bg-border hover:bg-brand transition-colors"
      />

      <!-- Right/Preview panel -->
      <div
        v-show="!isMobile || activeTab === 'preview'"
        :class="cn(
          'min-w-0 overflow-hidden',
          isMobile ? 'flex-1 w-full' : ''
        )"
        :style="!isMobile ? { flexBasis: `${100 - leftPanelWidth}%` } : undefined"
      >
        <!-- existing right panel content (PostPreviewPanel) -->
      </div>
    </div>
  </div>
</template>
```

> Note: keep the `interact.js` `onMounted` setup as-is — it bails harmlessly when `resizeHandleRef.value === null` (which happens on mobile because of `v-if`). If it doesn't bail (look for a null check), add one:

```ts
onMounted(() => {
  if (!resizeHandleRef.value) return  // mobile: handle not rendered
  interact(resizeHandleRef.value).draggable({ /* existing */ })
})
```

### Task 5.3: Phase 5 browser-test gate

- [ ] **Step 1: Verify both pages**

Tell the user: "Phase 5 ready. На `/app/editor` И `/app/reels-script` на 375px:
1. Сверху табы Текст/Превью.
2. По одной панели за раз, состояние сохраняется при переключении.
3. В навбаре справа иконка Users — открывает Sheet с AccountsSidebar слева.
4. Никаких драг-разделителей. На desktop всё как было — две панели, ресайз работает."

- [ ] **Step 2: Wait for "работает", then commit**

```bash
git add lib-modules/content-editor/components/ContentEditorLayout.vue \
  i18n/locales/ru.json i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat(content-editor): mobile Edit/Preview tabs, Accounts sheet, disable splitter

Phase 5 of the mobile adaptation. ContentEditorLayout (shared by
/app/editor and /app/reels-script) gets a top TabStrip switching between
Edit and Preview on < md. AccountsSidebar moves into a left Sheet
triggered from the navbar. interact.js drag-resize splitter is not
mounted on mobile.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Wrap-up

After all five phases pass:

- [ ] **Step 1: End-to-end smoke at 375px**

Walk through: bottom-bar nav → calendar → open Accounts sheet → open Filters sheet → tap "Ещё" → go to Assistant → switch Chat/History → tap "Ещё" → go to Editor → switch Edit/Preview → open Accounts sheet → tap "Ещё" → go to Profile. Every transition should work without horizontal scroll, hidden buttons, or dead taps.

- [ ] **Step 2: End-to-end smoke at 768px and 1280px**

Desktop should be visually identical to pre-change. If anything shifted on desktop, that's a bug — fix.

- [ ] **Step 3: User signs off the whole rollout**

Final user confirmation before merging to master (or whatever branch policy). No auto-commit here either — the per-phase commits are the artifacts.

## Out of scope for this plan

- New mobile-only UI flows (e.g. swipe gestures on calendar to change month).
- Touch optimisation of existing drag-and-drop in editor's image stack.
- PWA / install banner / native-app feel beyond bottom-tab-bar.
- Audit of every `Dialog`/`AlertDialog` for width compatibility (handled opportunistically in Phase 2 if it breaks; no proactive sweep).

These can each be their own follow-up plan if needed.
