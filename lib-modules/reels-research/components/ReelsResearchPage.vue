<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'

const store = useReelsResearchStore()
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-zinc-900">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Исследование Reels
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Анализируй популярные рилсы и сохраняй лучшие идеи
          </p>
        </div>

        <!-- Bookmarks counter -->
        <NuxtLink
          to="/app/workspace"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <svg class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {{ store.bookmarksCount }} в закладках
          </span>
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <ReelsFilters />
      </div>

      <!-- Grid -->
      <ReelsGrid />
    </div>
  </div>
</template>
