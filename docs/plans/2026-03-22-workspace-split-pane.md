# Workspace Split-Pane Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement VS Code-style split panel system for simultaneous work with multiple chats and image generators.

**Architecture:** New `lib-modules/workspace/` module with WorkspaceLayout managing 1-3 resizable panels. Each panel renders either chat or image generator components. State synced to URL for sharing.

**Tech Stack:** Vue 3, Pinia, Tailwind CSS, Nuxt 3 routing, existing shadcn-vue components

---

## Task 1: Types and Constants

**Files:**
- Create: `lib-modules/workspace/types/index.ts`

**Step 1: Create types file**

```typescript
// lib-modules/workspace/types/index.ts

export type PanelType = 'chat' | 'image'

export interface Panel {
  id: string
  type: PanelType
  chatId?: string
}

export interface WorkspaceState {
  panels: Panel[]
  sizes: number[]
  activePanelId: string
}

export const MIN_PANEL_WIDTH_PERCENT = 20
export const MAX_PANELS = 3
export const DEFAULT_PANEL_TYPE: PanelType = 'chat'
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/types/index.ts
git commit -m "feat(workspace): add types and constants"
```

---

## Task 2: URL Parsing Utilities

**Files:**
- Create: `lib-modules/workspace/helpers/urlParser.ts`

**Step 1: Create URL parser**

```typescript
// lib-modules/workspace/helpers/urlParser.ts

import type { Panel, PanelType } from '../types'
import { generateUUID } from '~/scripts/features/utils'

export function parsePanelsFromUrl(panelsParam: string | null): Panel[] {
  if (!panelsParam) {
    return [{ id: generateUUID(), type: 'chat' }]
  }

  const panelStrings = panelsParam.split(',').filter(Boolean)
  if (panelStrings.length === 0) {
    return [{ id: generateUUID(), type: 'chat' }]
  }

  return panelStrings.slice(0, 3).map((str) => {
    const [type, chatId] = str.split(':')
    const panelType: PanelType = type === 'image' ? 'image' : 'chat'

    return {
      id: generateUUID(),
      type: panelType,
      chatId: panelType === 'chat' ? chatId : undefined
    }
  })
}

export function parseSizesFromUrl(sizesParam: string | null, panelCount: number): number[] {
  if (!sizesParam) {
    return distributeEqually(panelCount)
  }

  const sizes = sizesParam.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)

  if (sizes.length !== panelCount) {
    return distributeEqually(panelCount)
  }

  const total = sizes.reduce((a, b) => a + b, 0)
  return sizes.map((s) => (s / total) * 100)
}

export function serializePanelsToUrl(panels: Panel[]): string {
  return panels.map((p) => {
    if (p.type === 'image') return 'image'
    return p.chatId ? `chat:${p.chatId}` : 'chat'
  }).join(',')
}

export function serializeSizesToUrl(sizes: number[]): string {
  return sizes.map((s) => Math.round(s)).join(',')
}

function distributeEqually(count: number): number[] {
  const base = Math.floor(100 / count)
  const remainder = 100 - base * count
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
}
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/helpers/urlParser.ts
git commit -m "feat(workspace): add URL parsing utilities"
```

---

## Task 3: Workspace Store

**Files:**
- Create: `lib-modules/workspace/stores/workspaceStore.ts`

**Step 1: Create store**

```typescript
// lib-modules/workspace/stores/workspaceStore.ts

import { defineStore } from 'pinia'
import type { Panel, PanelType, WorkspaceState } from '../types'
import { MAX_PANELS, MIN_PANEL_WIDTH_PERCENT } from '../types'
import { generateUUID } from '~/scripts/features/utils'
import {
  parsePanelsFromUrl,
  parseSizesFromUrl,
  serializePanelsToUrl,
  serializeSizesToUrl
} from '../helpers/urlParser'

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    panels: [],
    sizes: [],
    activePanelId: ''
  }),

  getters: {
    panelCount: (state) => state.panels.length,
    canAddPanel: (state) => state.panels.length < MAX_PANELS,
    canRemovePanel: (state) => state.panels.length > 1,
    activePanel: (state) => state.panels.find((p) => p.id === state.activePanelId)
  },

  actions: {
    initFromUrl(panelsParam: string | null, sizesParam: string | null) {
      this.panels = parsePanelsFromUrl(panelsParam)
      this.sizes = parseSizesFromUrl(sizesParam, this.panels.length)
      this.activePanelId = this.panels[0]?.id || ''
    },

    addPanel(type: PanelType, chatId?: string, afterPanelId?: string) {
      if (!this.canAddPanel) return

      const newPanel: Panel = {
        id: generateUUID(),
        type,
        chatId: type === 'chat' ? chatId : undefined
      }

      const insertIndex = afterPanelId
        ? this.panels.findIndex((p) => p.id === afterPanelId) + 1
        : this.panels.length

      this.panels.splice(insertIndex, 0, newPanel)
      this.redistributeSizes()
      this.activePanelId = newPanel.id
    },

    removePanel(panelId: string) {
      if (!this.canRemovePanel) return

      const index = this.panels.findIndex((p) => p.id === panelId)
      if (index === -1) return

      this.panels.splice(index, 1)
      this.redistributeSizes()

      if (this.activePanelId === panelId) {
        this.activePanelId = this.panels[Math.min(index, this.panels.length - 1)]?.id || ''
      }
    },

    splitPanel(panelId: string, type: PanelType = 'chat') {
      this.addPanel(type, undefined, panelId)
    },

    updatePanelChat(panelId: string, chatId: string) {
      const panel = this.panels.find((p) => p.id === panelId)
      if (panel && panel.type === 'chat') {
        panel.chatId = chatId
      }
    },

    setActivePanel(panelId: string) {
      if (this.panels.some((p) => p.id === panelId)) {
        this.activePanelId = panelId
      }
    },

    resizePanels(newSizes: number[]) {
      if (newSizes.length !== this.panels.length) return

      const clampedSizes = newSizes.map((s) =>
        Math.max(MIN_PANEL_WIDTH_PERCENT, Math.min(100 - MIN_PANEL_WIDTH_PERCENT * (this.panels.length - 1), s))
      )

      const total = clampedSizes.reduce((a, b) => a + b, 0)
      this.sizes = clampedSizes.map((s) => (s / total) * 100)
    },

    redistributeSizes() {
      const count = this.panels.length
      const base = Math.floor(100 / count)
      const remainder = 100 - base * count
      this.sizes = Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
    },

    getUrlParams(): { panels: string; sizes: string } {
      return {
        panels: serializePanelsToUrl(this.panels),
        sizes: serializeSizesToUrl(this.sizes)
      }
    }
  }
})
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/stores/workspaceStore.ts
git commit -m "feat(workspace): add workspace store with panel management"
```

---

## Task 4: useWorkspace Composable

**Files:**
- Create: `lib-modules/workspace/composables/useWorkspace.ts`

**Step 1: Create composable**

```typescript
// lib-modules/workspace/composables/useWorkspace.ts

import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { PanelType } from '../types'

export function useWorkspace() {
  const store = useWorkspaceStore()
  const route = useRoute()
  const router = useRouter()

  const { panels, sizes, activePanelId, canAddPanel, canRemovePanel } = storeToRefs(store)

  function initFromRoute() {
    const panelsParam = route.query.panels as string | null
    const sizesParam = route.query.sizes as string | null
    store.initFromUrl(panelsParam, sizesParam)
  }

  function syncToUrl() {
    const { panels: panelsParam, sizes: sizesParam } = store.getUrlParams()
    router.replace({
      query: {
        ...route.query,
        panels: panelsParam,
        sizes: sizesParam
      }
    })
  }

  function addPanel(type: PanelType, chatId?: string) {
    store.addPanel(type, chatId)
    syncToUrl()
  }

  function removePanel(panelId: string) {
    store.removePanel(panelId)
    syncToUrl()
  }

  function splitPanel(panelId: string, type: PanelType = 'chat') {
    store.splitPanel(panelId, type)
    syncToUrl()
  }

  function updatePanelChat(panelId: string, chatId: string) {
    store.updatePanelChat(panelId, chatId)
    syncToUrl()
  }

  function setActivePanel(panelId: string) {
    store.setActivePanel(panelId)
  }

  function resizePanels(newSizes: number[]) {
    store.resizePanels(newSizes)
    syncToUrl()
  }

  function resetSizes() {
    store.redistributeSizes()
    syncToUrl()
  }

  return {
    panels,
    sizes,
    activePanelId,
    canAddPanel,
    canRemovePanel,
    initFromRoute,
    addPanel,
    removePanel,
    splitPanel,
    updatePanelChat,
    setActivePanel,
    resizePanels,
    resetSizes
  }
}
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/composables/useWorkspace.ts
git commit -m "feat(workspace): add useWorkspace composable with URL sync"
```

---

## Task 5: ResizeHandle Component

**Files:**
- Create: `lib-modules/workspace/components/ResizeHandle.vue`

**Step 1: Create component**

```vue
<!-- lib-modules/workspace/components/ResizeHandle.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  resize: [deltaPercent: number]
  resizeEnd: []
  resetSizes: []
}>()

const isDragging = ref(false)
const startX = ref(0)
const containerWidth = ref(0)

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  startX.value = e.clientX
  containerWidth.value = (e.target as HTMLElement).parentElement?.parentElement?.offsetWidth || 1

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value
  const deltaPercent = (deltaX / containerWidth.value) * 100

  emit('resize', deltaPercent)
  startX.value = e.clientX
}

function onMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  emit('resizeEnd')
}

function onDoubleClick() {
  emit('resetSizes')
}
</script>

<template>
  <div
    class="w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/50 transition-colors"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
  />
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/components/ResizeHandle.vue
git commit -m "feat(workspace): add ResizeHandle component"
```

---

## Task 6: PanelHeader Component

**Files:**
- Create: `lib-modules/workspace/components/PanelHeader.vue`

**Step 1: Create component**

```vue
<!-- lib-modules/workspace/components/PanelHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Panel } from '../types'

const props = defineProps<{
  panel: Panel
  title?: string
  canClose: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  close: []
  contextmenu: [event: MouseEvent]
}>()

const displayTitle = computed(() => {
  if (props.panel.type === 'image') {
    return 'Image Generator'
  }
  return props.title || 'New Chat'
})

const icon = computed(() => {
  return props.panel.type === 'image' ? 'image' : 'message-square'
})

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  emit('contextmenu', e)
}
</script>

<template>
  <div
    class="flex items-center justify-between h-10 px-3 border-b bg-muted/50 shrink-0"
    :class="{ 'border-l-2 border-l-primary': isActive }"
    @contextmenu="onContextMenu"
  >
    <div class="flex items-center gap-2 min-w-0">
      <component
        :is="icon === 'image' ? 'svg' : 'svg'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
      >
        <use v-if="icon === 'image'" href="/icons/image.svg#icon" />
        <use v-else href="/icons/chats.svg#icon" />
      </component>
      <span class="text-sm truncate">{{ displayTitle }}</span>
    </div>

    <button
      v-if="canClose"
      class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      @click="emit('close')"
    >
      <span class="text-lg leading-none">&times;</span>
    </button>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/components/PanelHeader.vue
git commit -m "feat(workspace): add PanelHeader component"
```

---

## Task 7: PanelContextMenu Component

**Files:**
- Create: `lib-modules/workspace/components/PanelContextMenu.vue`

**Step 1: Create component**

```vue
<!-- lib-modules/workspace/components/PanelContextMenu.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '~/components/ui/context-menu'
import type { Panel, PanelType } from '../types'

const props = defineProps<{
  panel: Panel
  canSplit: boolean
  canClose: boolean
}>()

const emit = defineEmits<{
  splitRight: [type: PanelType]
  close: []
  openChat: []
}>()

const isOpen = ref(false)
</script>

<template>
  <ContextMenu v-model:open="isOpen">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>

    <ContextMenuContent class="w-48">
      <ContextMenuItem
        v-if="canSplit"
        @click="emit('splitRight', 'chat')"
      >
        Split Right (Chat)
      </ContextMenuItem>

      <ContextMenuItem
        v-if="canSplit"
        @click="emit('splitRight', 'image')"
      >
        Split Right (Image)
      </ContextMenuItem>

      <ContextMenuItem
        v-if="panel.type === 'chat'"
        @click="emit('openChat')"
      >
        Open Chat...
      </ContextMenuItem>

      <ContextMenuItem
        v-if="canClose"
        class="text-destructive"
        @click="emit('close')"
      >
        Close
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/components/PanelContextMenu.vue
git commit -m "feat(workspace): add PanelContextMenu component"
```

---

## Task 8: WorkspacePanel Component

**Files:**
- Create: `lib-modules/workspace/components/WorkspacePanel.vue`

**Step 1: Create component**

```vue
<!-- lib-modules/workspace/components/WorkspacePanel.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Panel, PanelType } from '../types'
import PanelHeader from './PanelHeader.vue'
import PanelContextMenu from './PanelContextMenu.vue'

const props = defineProps<{
  panel: Panel
  title?: string
  widthPercent: number
  isActive: boolean
  canSplit: boolean
  canClose: boolean
}>()

const emit = defineEmits<{
  click: []
  close: []
  splitRight: [type: PanelType]
  openChat: []
}>()

const style = computed(() => ({
  width: `${props.widthPercent}%`,
  minWidth: '20%'
}))
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden border-r last:border-r-0"
    :class="{ 'ring-1 ring-primary/30': isActive }"
    :style="style"
    @click="emit('click')"
  >
    <PanelContextMenu
      :panel="panel"
      :can-split="canSplit"
      :can-close="canClose"
      @split-right="(type) => emit('splitRight', type)"
      @close="emit('close')"
      @open-chat="emit('openChat')"
    >
      <PanelHeader
        :panel="panel"
        :title="title"
        :can-close="canClose"
        :is-active="isActive"
        @close="emit('close')"
      />
    </PanelContextMenu>

    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/components/WorkspacePanel.vue
git commit -m "feat(workspace): add WorkspacePanel component"
```

---

## Task 9: WorkspaceLayout Component

**Files:**
- Create: `lib-modules/workspace/components/WorkspaceLayout.vue`

**Step 1: Create component**

```vue
<!-- lib-modules/workspace/components/WorkspaceLayout.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Panel, PanelType } from '../types'
import WorkspacePanel from './WorkspacePanel.vue'
import ResizeHandle from './ResizeHandle.vue'

const props = defineProps<{
  panels: Panel[]
  sizes: number[]
  activePanelId: string
  canAddPanel: boolean
  canRemovePanel: boolean
  getPanelTitle?: (panel: Panel) => string | undefined
}>()

const emit = defineEmits<{
  'update:activePanelId': [id: string]
  removePanel: [id: string]
  splitPanel: [panelId: string, type: PanelType]
  resize: [sizes: number[]]
  resetSizes: []
  openChat: [panelId: string]
}>()

const localSizes = ref<number[]>([])

function startResize() {
  localSizes.value = [...props.sizes]
}

function handleResize(index: number, deltaPercent: number) {
  if (localSizes.value.length === 0) {
    localSizes.value = [...props.sizes]
  }

  const newSizes = [...localSizes.value]
  newSizes[index] += deltaPercent
  newSizes[index + 1] -= deltaPercent
  localSizes.value = newSizes
}

function handleResizeEnd() {
  if (localSizes.value.length > 0) {
    emit('resize', localSizes.value)
    localSizes.value = []
  }
}

const displaySizes = computed(() =>
  localSizes.value.length > 0 ? localSizes.value : props.sizes
)
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-background">
    <template v-for="(panel, index) in panels" :key="panel.id">
      <WorkspacePanel
        :panel="panel"
        :title="getPanelTitle?.(panel)"
        :width-percent="displaySizes[index]"
        :is-active="activePanelId === panel.id"
        :can-split="canAddPanel"
        :can-close="canRemovePanel"
        @click="emit('update:activePanelId', panel.id)"
        @close="emit('removePanel', panel.id)"
        @split-right="(type) => emit('splitPanel', panel.id, type)"
        @open-chat="emit('openChat', panel.id)"
      >
        <slot :name="`panel-${panel.id}`" :panel="panel" />
      </WorkspacePanel>

      <ResizeHandle
        v-if="index < panels.length - 1"
        @resize="(delta) => handleResize(index, delta)"
        @resize-end="handleResizeEnd"
        @reset-sizes="emit('resetSizes')"
        @mousedown="startResize"
      />
    </template>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/components/WorkspaceLayout.vue
git commit -m "feat(workspace): add WorkspaceLayout component"
```

---

## Task 10: Module Index

**Files:**
- Create: `lib-modules/workspace/index.ts`

**Step 1: Create index**

```typescript
// lib-modules/workspace/index.ts

export { default as WorkspaceLayout } from './components/WorkspaceLayout.vue'
export { default as WorkspacePanel } from './components/WorkspacePanel.vue'
export { default as ResizeHandle } from './components/ResizeHandle.vue'
export { default as PanelHeader } from './components/PanelHeader.vue'
export { default as PanelContextMenu } from './components/PanelContextMenu.vue'

export { useWorkspace } from './composables/useWorkspace'
export { useWorkspaceStore } from './stores/workspaceStore'

export * from './types'
```

**Step 2: Commit**

```bash
git add lib-modules/workspace/index.ts
git commit -m "feat(workspace): add module index with public API"
```

---

## Task 11: Workspace Page

**Files:**
- Create: `pages/app/workspace.vue`

**Step 1: Create page**

```vue
<!-- pages/app/workspace.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { WorkspaceLayout, useWorkspace, type Panel, type PanelType } from '~/lib-modules/workspace'
import { MessagesSection, SendMessageSection } from '~/lib-modules/conversations'
import { ImageGeneratorInput, ImageGeneratorOutput } from '~/lib-modules/imageGenerator'
import { useCurrentConversationStore } from '~/lib-modules/conversations'
import { isMobile } from '~/scripts/features/utils'

definePageMeta({
  layout: 'default'
})

const {
  panels,
  sizes,
  activePanelId,
  canAddPanel,
  canRemovePanel,
  initFromRoute,
  removePanel,
  splitPanel,
  setActivePanel,
  resizePanels,
  resetSizes,
  updatePanelChat
} = useWorkspace()

const conversationStore = useCurrentConversationStore()

onMounted(() => {
  if (isMobile()) {
    navigateTo('/app/conversations')
    return
  }
  initFromRoute()
})

function getPanelTitle(panel: Panel): string | undefined {
  if (panel.type === 'chat') {
    return conversationStore.conversationTitle || undefined
  }
  return undefined
}

function handleSplitPanel(panelId: string, type: PanelType) {
  splitPanel(panelId, type)
}

function handleOpenChat(panelId: string) {
  // TODO: открыть диалог выбора чата
  console.log('Open chat selector for panel:', panelId)
}
</script>

<template>
  <div class="h-[calc(100vh-var(--navbar-height,60px))]">
    <WorkspaceLayout
      :panels="panels"
      :sizes="sizes"
      :active-panel-id="activePanelId"
      :can-add-panel="canAddPanel"
      :can-remove-panel="canRemovePanel"
      :get-panel-title="getPanelTitle"
      @update:active-panel-id="setActivePanel"
      @remove-panel="removePanel"
      @split-panel="handleSplitPanel"
      @resize="resizePanels"
      @reset-sizes="resetSizes"
      @open-chat="handleOpenChat"
    >
      <template v-for="panel in panels" :key="panel.id" #[`panel-${panel.id}`]="{ panel: p }">
        <div v-if="p.type === 'chat'" class="flex flex-col h-full">
          <div class="flex-1 overflow-auto">
            <MessagesSection />
          </div>
          <SendMessageSection />
        </div>

        <div v-else-if="p.type === 'image'" class="flex flex-col h-full p-4 gap-4 overflow-auto">
          <ImageGeneratorInput />
          <ImageGeneratorOutput />
        </div>
      </template>
    </WorkspaceLayout>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add pages/app/workspace.vue
git commit -m "feat(workspace): add workspace page with panel rendering"
```

---

## Task 12: Add Navigation Link

**Files:**
- Modify: Check navbar component and add workspace link

**Step 1: Find navbar file**

Run: `grep -r "image-generator" components/organisms/ --include="*.vue" -l`

**Step 2: Add workspace link to navbar** (implementation depends on navbar structure)

**Step 3: Commit**

```bash
git add components/organisms/*.vue
git commit -m "feat(workspace): add workspace link to navbar"
```

---

## Task 13: Final Cleanup and Test

**Step 1: Verify all files created**

Run: `ls -la lib-modules/workspace/`

Expected output:
```
components/
composables/
helpers/
stores/
types/
index.ts
```

**Step 2: Run dev server and test**

Run: `yarn dev`

Navigate to: `http://localhost:3000/app/workspace?panels=chat,image&sizes=50,50`

**Step 3: Test functionality**
- Verify two panels render
- Drag resize handle between panels
- Right-click header → Split Right
- Close panel button
- URL updates on changes

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(workspace): complete split-pane workspace implementation"
```

---

## Future Tasks (Out of Scope)

These items are documented but not part of this implementation:

1. **Multi-instance stores** - Modify `imageGeneratorStore` and `currentConversationStore` to support multiple instances per panel
2. **Chat selector dialog** - Implement "Open Chat..." functionality
3. **Redirects** - Add redirects from old routes to workspace
4. **Keyboard shortcuts** - Add shortcuts for panel navigation
5. **Project integration** - Connect project context to chat panels
