<script setup lang="ts">

import {useCurrentConversation} from "~/lib-modules/conversations";
import {ImageGeneratorOutput, ImageGeneratorInput, ImageHistorySlider} from "~/lib-modules/imageGenerator";
import {useDemoImageGenerator} from "~/lib-modules/imageGenerator/composables";

useCurrentConversation().clearConversation();

// Initialize demo state if in demo mode
const { initializeDemoState } = useDemoImageGenerator();
onMounted(() => {
  initializeDemoState();
});

</script>

<template>
  <div class="basic-page-wrapper">
    <div class="image-container__container">
      <ImageGeneratorInput/>
      <ImageGeneratorOutput/>
    </div>
    <div class="image-history__wrapper">
      <ImageHistorySlider/>
    </div>
  </div>
</template>

<style scoped>

.image-container__container {
  @apply p-4 gap-10 grid grid-cols-1 md:grid-cols-2
}

.image-history__wrapper {
  @apply px-4 pb-20 mt-6;
}

</style>