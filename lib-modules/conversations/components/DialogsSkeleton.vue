<template>
  <div class="flex flex-col gap-2 px-2 py-2">
    <div
      v-for="i in 3"
      :key="i"
      class="skeleton-item"
      :style="{ animationDelay: `${i * 0.1}s` }"
    >
      <div class="skeleton-bar" :style="{ width: widths[i - 1] }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const widths = ['85%', '70%', '60%'];
</script>

<style scoped>
.skeleton-item {
  @apply h-10 rounded-md bg-gray-100 dark:bg-gray-800/50 flex items-center px-3;
  animation: fadeIn 0.3s ease-out forwards;
  opacity: 0;
}

.skeleton-bar {
  @apply h-4 rounded bg-gray-200 dark:bg-gray-700;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
