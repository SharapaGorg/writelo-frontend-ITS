<script setup lang="ts">
import { ArrowLeft, MessageSquare, Image } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'

const { currentDraft, editorMode, setEditorMode, goBackToCalendar } = useContentEditor()

const contentTypeLabel = computed(() => {
  if (!currentDraft) return 'New Content'
  switch (currentDraft.type) {
    case 'post': return 'New Post'
    case 'story': return 'New Story'
    case 'reel': return 'New Reel'
    case 'carousel': return 'New Carousel'
    default: return 'New Content'
  }
})
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <header class="flex items-center gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
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
    <div class="flex flex-1 overflow-hidden">
      <!-- Left panel -->
      <div class="flex w-1/2 flex-col border-r border-zinc-200 dark:border-zinc-800">
        <!-- Mode switcher tabs -->
        <div class="flex border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
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

      <!-- Right panel -->
      <div class="flex w-1/2 flex-col overflow-hidden">
        <slot name="right-panel" />
      </div>
    </div>
  </div>
</template>
