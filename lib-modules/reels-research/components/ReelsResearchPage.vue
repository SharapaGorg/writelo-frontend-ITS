<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelsFilters from './ReelsFilters.vue'
import ReelsGrid from './ReelsGrid.vue'
import ReelDetailsModal from './ReelDetailsModal.vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import type { TrendingReelDto } from '../types'

const store = useReelsResearchStore()
const { currentWorkspaceId } = useWorkspaceContext()

onMounted(() => {
  if (currentWorkspaceId.value) store.fetchFeed()
})

// Refetch when the user switches workspace from the navbar.
watch(currentWorkspaceId, (id, prev) => {
  if (id && id !== prev) store.fetchFeed()
})

function handleSelect(reel: TrendingReelDto) {
  store.openReel(reel)
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <AppNavbar :breadcrumbs="[{ label: 'Тренды' }]" />

    <div class="border-b border-border px-4 py-3">
      <div class="max-w-7xl mx-auto w-full">
        <ReelsFilters />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div class="max-w-7xl mx-auto w-full px-4 py-6">
        <!-- No workspace -->
        <div
          v-if="!currentWorkspaceId"
          class="py-20 flex flex-col items-center justify-center text-center gap-3"
        >
          <AlertCircle class="size-10 text-muted-foreground" />
          <p class="text-sm text-muted-foreground max-w-sm">
            Выбери воркспейс в шапке, чтобы посмотреть трендовые рилсы.
          </p>
        </div>

        <!-- Loading -->
        <div
          v-else-if="store.isLoading && store.reels.length === 0"
          class="py-20 flex flex-col items-center justify-center text-muted-foreground"
        >
          <Loader2 class="size-8 animate-spin" />
          <p class="text-sm mt-3">Загружаем тренды…</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="store.loadError && store.reels.length === 0"
          class="py-20 flex flex-col items-center justify-center text-center gap-3"
        >
          <AlertCircle class="size-10 text-destructive" />
          <p class="text-sm text-foreground">Не получилось загрузить тренды</p>
          <p class="text-xs text-muted-foreground max-w-md">{{ store.loadError }}</p>
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90"
            @click="store.fetchFeed()"
          >
            <RefreshCw class="size-4" />
            Повторить
          </button>
        </div>

        <!-- Empty -->
        <div
          v-else-if="!store.isLoading && store.filteredReels.length === 0"
          class="py-20 text-center text-sm text-muted-foreground"
        >
          Пока ничего не нашлось. Попробуй другие фильтры.
        </div>

        <!-- Grid -->
        <ReelsGrid v-else @select="handleSelect" />

        <!-- Load more -->
        <div v-if="store.nextCursor && store.reels.length > 0" class="flex justify-center mt-8">
          <button
            type="button"
            :disabled="store.isLoadingMore"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card hover:bg-accent text-sm font-medium disabled:opacity-60"
            @click="store.loadMore()"
          >
            <Loader2 v-if="store.isLoadingMore" class="size-4 animate-spin" />
            Загрузить ещё
          </button>
        </div>
      </div>
    </div>

    <ReelDetailsModal />
  </div>
</template>
