<script setup lang="ts">
// Message-shaped placeholders to fill the chat while history loads.
// Alternates user / assistant bubbles to mimic the typical conversation rhythm.
const ROWS = [
  { role: 'user' as const, lines: [{ w: '60%' }] },
  { role: 'assistant' as const, lines: [{ w: '95%' }, { w: '88%' }, { w: '72%' }] },
  { role: 'user' as const, lines: [{ w: '40%' }] },
  { role: 'assistant' as const, lines: [{ w: '90%' }, { w: '60%' }] },
]
</script>

<template>
  <div class="mx-auto max-w-[760px] space-y-4 px-4 py-6">
    <div
      v-for="(row, i) in ROWS"
      :key="i"
      :class="row.role === 'user' ? 'flex flex-col items-end gap-1.5' : 'flex flex-col items-start gap-1.5'"
      :style="{ animationDelay: `${i * 0.08}s` }"
      class="skeleton-row"
    >
      <div
        v-for="(line, j) in row.lines"
        :key="j"
        :class="[
          'skeleton-line',
          row.role === 'user' ? 'bg-muted' : 'bg-muted/70',
        ]"
        :style="{ width: line.w }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-row {
  animation: fadeIn 0.25s ease-out forwards;
  opacity: 0;
}

.skeleton-line {
  @apply h-4 rounded;
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
