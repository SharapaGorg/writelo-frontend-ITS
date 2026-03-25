<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import type { BookmarkedReel } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  dragStart: [reel: BookmarkedReel, event: DragEvent]
}>()

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function onDragStart(reel: BookmarkedReel, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'reel',
      reel
    }))
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('dragStart', reel, event)
}

function truncateDescription(text: string, maxLength = 60): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
</script>

<template>
  <aside class="w-full h-full bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Закладки Reels</h3>
      <p class="text-xs text-zinc-500 mt-0.5">Перетащите в календарь для создания идеи</p>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
      <!-- Empty state -->
      <div
        v-if="store.bookmarks.length === 0"
        class="flex flex-col items-center justify-center py-8 px-4 text-center"
      >
        <div class="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Нет сохраненных Reels</p>
        <NuxtLink
          to="/app/reels-research"
          class="text-sm text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          Перейти к исследованию Reels
        </NuxtLink>
      </div>

      <!-- Bookmarks list -->
      <div
        v-for="reel in store.bookmarks"
        :key="reel.id"
        class="p-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing group relative"
        draggable="true"
        @dragstart="onDragStart(reel, $event)"
      >
        <!-- Remove button -->
        <button
          class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 hover:bg-red-500 dark:hover:bg-red-500 text-zinc-600 dark:text-zinc-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Удалить из закладок"
          @click.stop="store.removeBookmark(reel.id)"
        >
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div class="flex gap-2">
          <!-- Thumbnail -->
          <div class="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-700">
            <img
              :src="reel.thumbnail"
              :alt="reel.description"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <!-- Author -->
            <div class="flex items-center gap-1 mb-1">
              <div class="w-4 h-4 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                <img
                  v-if="reel.authorAvatar"
                  :src="reel.authorAvatar"
                  :alt="reel.author"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-[8px] text-zinc-500 dark:text-zinc-400">
                  {{ reel.author.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span class="text-xs text-zinc-500 dark:text-zinc-400 truncate">@{{ reel.author }}</span>
            </div>

            <!-- Description -->
            <p class="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 mb-1">
              {{ truncateDescription(reel.description) }}
            </p>

            <!-- Views -->
            <div class="flex items-center gap-1 text-xs text-zinc-400">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{{ formatNumber(reel.views) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
