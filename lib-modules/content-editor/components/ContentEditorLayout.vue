<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import interact from 'interactjs'
import { ArrowLeft, MessageSquare, Image } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'

const { currentDraft, editorMode, setEditorMode, goBackToCalendar } = useContentEditor()

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

const contentTypeLabel = computed(() => {
  if (!currentDraft.value) return 'New Content'
  switch (currentDraft.value.type) {
    case 'post': return 'New Post'
    case 'story': return 'New Story'
    case 'reel': return 'New Reel'
    case 'carousel': return 'New Carousel'
    default: return 'New Content'
  }
})
</script>

<template>
  <div :class="cn('flex h-full flex-col', isDragging && 'select-none')">
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
    </header>

    <!-- Main content area -->
    <div ref="containerRef" class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div
        class="flex flex-col border-r border-zinc-200 dark:border-zinc-800"
        :style="{ width: `${leftPanelWidth}%` }"
      >
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
        class="flex flex-1 flex-col overflow-hidden"
      >
        <slot name="right-panel" />
      </div>
    </div>
  </div>
</template>
