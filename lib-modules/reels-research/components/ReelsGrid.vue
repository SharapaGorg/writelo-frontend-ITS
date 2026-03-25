<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'
import type { ReelItem } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  dragStart: [reel: ReelItem]
  dragEnd: [reel: ReelItem, x: number, y: number]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.id"
      :reel="reel"
      @drag-start="(reel) => emit('dragStart', reel)"
      @drag-end="(reel, x, y) => emit('dragEnd', reel, x, y)"
    />
  </div>
</template>
