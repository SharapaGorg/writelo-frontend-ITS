<script setup lang="ts">

import AttachImageZone from './AttachImageZone.vue'
import ImageGeneratorPromptField from "./ImageGeneratorPromptField.vue"
import ImagesAspectRatios from "./ImagesAspectRatios.vue"
import GenerateImageButton from "./GenerateImageButton.vue";

import {BadgeInfo} from 'lucide-vue-next'

import '../styles/index.css'

</script>

<template>
  <div class="flex flex-col gap-y-4 items-center">
    <div class="image-generator-block image-generator-input__container">
      <AttachImageZone/>
      <ImageGeneratorPromptField/>
      <ImagesAspectRatios/>
      <GenerateImageButton/>
    </div>

    <div class="image-generator-input__hint-container">
      <BadgeInfo class="image-generator-input__hint-icon"/>
      <span class="image-generator-input__clue">{{ $t('imageGenerator.input.hint') }}</span>
    </div>
  </div>
</template>

<style scoped>

.image-generator-input__container {
  @apply flex flex-col w-fit gap-y-4
}

.image-generator-input__hint-container {
  @apply w-[350px] lg:w-[400px] mx-auto flex items-start gap-x-3
  px-4 py-3 rounded-lg
  bg-muted/50 dark:bg-muted/20
  border border-border/50
  transition-all duration-200
}

.image-generator-input__hint-container:hover {
  @apply bg-muted/70 dark:bg-muted/30
  border-border
}

.image-generator-input__hint-icon {
  @apply w-4 h-4 flex-shrink-0 mt-0.5
  text-muted-foreground/70
}

.image-generator-input__clue {
  @apply text-xs text-muted-foreground leading-relaxed select-none
}

</style>