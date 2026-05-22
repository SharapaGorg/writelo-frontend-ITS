<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'
import type { TrendingReelDto } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  select: [reel: TrendingReelDto]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.reelId"
      :reel="reel"
      @select="(r) => emit('select', r)"
    />
  </div>
</template>
