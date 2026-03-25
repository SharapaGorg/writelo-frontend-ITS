<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'
import type { ReelItem } from '../types'

const store = useReelsResearchStore()

const emit = defineEmits<{
  dragStart: [reel: ReelItem, event: DragEvent]
  mouseDown: [reel: ReelItem]
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.id"
      :reel="reel"
      @drag-start="(reel, event) => emit('dragStart', reel, event)"
      @mouse-down="(reel) => emit('mouseDown', reel)"
    />
  </div>
</template>
