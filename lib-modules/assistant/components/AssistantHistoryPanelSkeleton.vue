<script setup lang="ts">
// Title-bar placeholders shown while the conversation list fetches.
// Widths vary so the column doesn't read as a flat block.
const ROWS = [
  { w: '85%' },
  { w: '60%' },
  { w: '72%' },
  { w: '50%' },
  { w: '78%' },
  { w: '65%' },
  { w: '90%' },
]
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="(row, i) in ROWS"
      :key="i"
      class="skeleton-row flex items-center gap-2 rounded-md px-2 py-1.5"
      :style="{ animationDelay: `${i * 0.06}s` }"
    >
      <div class="skeleton-line h-3 flex-1 rounded" :style="{ maxWidth: row.w }"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-row {
  animation: fadeIn 0.2s ease-out forwards;
  opacity: 0;
}

.skeleton-line {
  @apply bg-muted-foreground/30;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
