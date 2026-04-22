<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import interact from 'interactjs'
import { MessageSquare, Image } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import { AccountsSidebar } from '~/lib-modules/content-calendar'
import { AppNavbar, type BreadcrumbItem } from '~/lib-modules/app-layout'

const {
  currentDraft,
  editorMode,
  setEditorMode,
  activePanel,
  setActivePanel,
  isEditMode,
  selectedAccountId,
  selectAccount,
  currentProjectAccounts
} = useContentEditor()

const isLeftActive = computed(() => activePanel.value === 'left')
const isRightActive = computed(() => activePanel.value === 'right')

// Resizable panel state
const leftPanelWidth = ref(50) // percentage
const resizeHandleRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const MIN_PANEL_WIDTH = 25 // minimum 25%
const MAX_PANEL_WIDTH = 75 // maximum 75%

onMounted(() => {
  if (!resizeHandleRef.value || !containerRef.value) return

  interact(resizeHandleRef.value).draggable({
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent'
      })
    ],
    listeners: {
      start() {
        isDragging.value = true
      },
      move(event) {
        if (!containerRef.value) return
        const containerRect = containerRef.value.getBoundingClientRect()
        const newX = event.clientX - containerRect.left
        const newPercent = (newX / containerRect.width) * 100
        leftPanelWidth.value = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newPercent))
      },
      end() {
        isDragging.value = false
      }
    }
  })
})

onUnmounted(() => {
  if (resizeHandleRef.value) {
    interact(resizeHandleRef.value).unset()
  }
})

const headerTitle = computed(() => {
  if (isEditMode.value && currentDraft.value?.title) {
    return currentDraft.value.title
  }
  return 'Новый пост'
})

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Календарь', to: '/app/calendar' },
  { label: headerTitle.value },
])
</script>

<template>
  <div :class="cn('flex h-full flex-col', isDragging && 'select-none')">
    <AppNavbar :breadcrumbs="breadcrumbs" show-workspace-selector />

    <!-- Main content area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Accounts Sidebar -->
      <AccountsSidebar
        :accounts="currentProjectAccounts"
        :selected-account-id="selectedAccountId ?? undefined"
        :single-select="true"
        @select="selectAccount"
      />

      <!-- Panels container -->
      <div ref="containerRef" class="flex flex-1 overflow-hidden">
        <!-- Left panel -->
        <div
          :class="cn(
            'relative flex flex-col border-r border-zinc-200 dark:border-zinc-800'
          )"
          :style="{ width: `${leftPanelWidth}%` }"
          @click="setActivePanel('left')"
          @focusin="setActivePanel('left')"
        >
          <!-- Active panel border overlay -->
          <div
            v-if="isLeftActive"
            class="absolute inset-0 border border-blue-400/50 dark:border-blue-500/40 rounded-sm pointer-events-none z-10"
          />
          <!-- Mode switcher tabs -->
          <div class="flex border-b border-zinc-200 px-2 py-2 dark:border-zinc-800 select-none">
            <button
              @click="setEditorMode('chat')"
              :class="cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                editorMode === 'chat'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300'
              )"
            >
              <MessageSquare class="h-4 w-4" />
              Chat
            </button>
            <button
              @click="setEditorMode('images')"
              :class="cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                editorMode === 'images'
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300'
              )"
            >
              <Image class="h-4 w-4" />
              Images
            </button>
          </div>

          <!-- Left panel content slot -->
          <div class="flex-1 overflow-hidden">
            <slot name="left-panel" />
          </div>
        </div>

        <!-- Resize handle -->
        <div
          ref="resizeHandleRef"
          :class="cn(
            'w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-blue-500/50 transition-colors',
            isDragging && 'bg-blue-500'
          )"
        />

        <!-- Right panel -->
        <div
          class="relative flex flex-1 flex-col overflow-hidden"
          @click="setActivePanel('right')"
          @focusin="setActivePanel('right')"
        >
          <!-- Active panel border overlay -->
          <div
            v-if="isRightActive"
            class="absolute inset-0 border border-blue-400/50 dark:border-blue-500/40 rounded-sm pointer-events-none z-10"
          />
          <slot name="right-panel" />
        </div>
      </div>
    </div>
  </div>
</template>
