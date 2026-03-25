<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'
import type { ReelItem } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  dragStart: [reel: ReelItem, event: DragEvent]
  dragEnd: [reel: ReelItem, event: DragEvent]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.id"
      :reel="reel"
      @drag-start="(reel, event) => emit('dragStart', reel, event)"
      @drag-end="(reel, event) => emit('dragEnd', reel, event)"
    />
  </div>
</template>
