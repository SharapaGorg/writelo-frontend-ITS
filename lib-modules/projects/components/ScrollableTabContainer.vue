<template>
  <div
      ref="scrollContainer"
      class="flex gap-1 p-2 overflow-x-auto scrollbar-hide"
      style="scroll-behavior: smooth;"
      @wheel="handleWheel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const scrollContainer = ref<HTMLElement>()

const handleWheel = (event: WheelEvent) => {
  if (scrollContainer.value) {
    event.preventDefault()
    scrollContainer.value.scrollLeft += event.deltaY
  }
}

onMounted(() => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('wheel', handleWheel, { passive: false })
    }
  })
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('wheel', handleWheel)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
