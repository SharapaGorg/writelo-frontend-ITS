<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2, ScanSearch } from 'lucide-vue-next'
import AnalysisHistoryCard from './AnalysisHistoryCard.vue'
import type { ShortVideoAnalysisHistoryItemDto } from '../types'

const { t } = useI18n()

const props = defineProps<{
  items: ShortVideoAnalysisHistoryItemDto[]
  isLoading: boolean
}>()

const showSkeleton = computed(() => props.isLoading && props.items.length === 0)
const showEmpty = computed(() => !props.isLoading && props.items.length === 0)
</script>

<template>
  <div>
    <div v-if="showSkeleton" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="i in 4"
        :key="i"
        class="flex h-64 animate-pulse flex-col overflow-hidden rounded-lg border border-border bg-card"
      >
        <div class="h-36 w-full bg-muted" />
        <div class="flex-1 space-y-2 p-3">
          <div class="h-3 w-2/3 rounded bg-muted" />
          <div class="h-3 w-1/2 rounded bg-muted" />
        </div>
      </div>
    </div>

    <div
      v-else-if="showEmpty"
      class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-8 py-16 text-center"
    >
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ScanSearch class="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 class="mb-1 text-lg font-semibold">{{ t('videoAnalyzer.grid.emptyTitle') }}</h3>
      <p class="max-w-md text-sm text-muted-foreground">
        {{ t('videoAnalyzer.grid.emptyDesc') }}
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnalysisHistoryCard
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </div>

    <div
      v-if="isLoading && items.length > 0"
      class="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"
    >
      <Loader2 class="h-3 w-3 animate-spin" />
      {{ t('videoAnalyzer.grid.refreshing') }}
    </div>
  </div>
</template>
