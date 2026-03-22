<!-- lib-modules/workspace/components/ImagePanel.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { ImageGeneratorInput, ImageGeneratorOutput } from '~/lib-modules/imageGenerator'
import { useDemoImageGenerator } from '~/lib-modules/imageGenerator/composables'

// Initialize demo state if in demo mode
const { initializeDemoState } = useDemoImageGenerator()

onMounted(() => {
  initializeDemoState()
})
</script>

<template>
  <div class="flex flex-col h-full p-4 gap-4 overflow-auto">
    <ImageGeneratorInput />
    <ImageGeneratorOutput />
  </div>
</template>
