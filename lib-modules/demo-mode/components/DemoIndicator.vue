<template>
  <Transition name="fade">
    <div v-if="isDemoMode" class="demo-indicator">
      DEMO
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useDemoMode } from '../composables/useDemoMode'

const { isDemoMode } = useDemoMode()
</script>

<style scoped>
.demo-indicator {
  @apply fixed top-2 right-2 z-50;
  @apply px-1.5 py-0.5 rounded text-[10px] font-mono;
  @apply bg-black/30 text-white/50;
  @apply pointer-events-none select-none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
