<script setup lang="ts">
import type { ReelItem } from '../types'
import { useReelsResearchStore } from '../stores/reelsResearchStore'

const props = defineProps<{
  reel: ReelItem
}>()

const store = useReelsResearchStore()

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function handleCardClick() {
  window.open(props.reel.url, '_blank')
}

function handleBookmarkClick(e: Event) {
  e.stopPropagation()
  store.toggleBookmark(props.reel)
}
</script>

<template>
  <div
    class="group cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden transition-all hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-lg"
    @click="handleCardClick"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-[9/16] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <img
        :src="reel.thumbnail"
        :alt="reel.description"
        class="w-full h-full object-cover"
      />

      <!-- Hover overlay with play icon -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="w-16 h-16 rounded-full bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center">
          <svg class="w-8 h-8 text-zinc-800 dark:text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <!-- Bookmark button (top-right) -->
      <button
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        @click="handleBookmarkClick"
      >
        <svg
          class="w-5 h-5 transition-colors"
          :class="store.isBookmarked(reel.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <!-- Views badge (bottom-left) -->
      <div class="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium flex items-center gap-1">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ formatNumber(reel.views) }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3">
      <!-- Author row -->
      <div class="flex items-center gap-2 mb-2">
        <div class="w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
          <img
            v-if="reel.authorAvatar"
            :src="reel.authorAvatar"
            :alt="reel.author"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
            {{ reel.author.charAt(0).toUpperCase() }}
          </div>
        </div>
        <span class="text-sm text-zinc-600 dark:text-zinc-400 truncate">@{{ reel.author }}</span>
      </div>

      <!-- Description -->
      <p class="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 mb-3">
        {{ reel.description }}
      </p>

      <!-- Metrics row -->
      <div class="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <!-- Likes -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{{ formatNumber(reel.likes) }}</span>
        </div>

        <!-- Comments -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{{ formatNumber(reel.comments) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
