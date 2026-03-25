<script setup lang="ts">
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelCard from './ReelCard.vue'

const store = useReelsResearchStore()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <ReelCard
      v-for="reel in store.filteredReels"
      :key="reel.id"
      :reel="reel"
    />
  </div>
</template>
