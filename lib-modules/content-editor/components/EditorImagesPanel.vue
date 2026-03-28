<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import ImageDropZone, { type ImageAddEvent } from './ImageDropZone.vue'
import { useContentEditor } from '../composables/useContentEditor'

// Image generator components
import ImagesAspectRatios from '~/lib-modules/imageGenerator/components/ImagesAspectRatios.vue'
import ImageGeneratorPromptField from '~/lib-modules/imageGenerator/components/ImageGeneratorPromptField.vue'
import GenerateImageButton from '~/lib-modules/imageGenerator/components/GenerateImageButton.vue'
import GeneratorOutputImage from '~/lib-modules/imageGenerator/components/GeneratorOutputImage.vue'
import { useImageGeneratorStore } from '~/lib-modules/imageGenerator/stores'

const { addImage, activePanel, setActivePanel } = useContentEditor()
const imageStore = useImageGeneratorStore()

const isActivePanel = computed(() => activePanel.value === 'left')

// Handle panel focus
const handlePanelFocus = () => {
  setActivePanel('left')
}

// Local state for reference images
const referenceImages = ref<string[]>([])

const handleAddImage = (event: ImageAddEvent) => {
  referenceImages.value.push(event.url)
}

const handleRemoveImage = (index: number) => {
  referenceImages.value.splice(index, 1)
}

// Add generated image to post
const addToPost = () => {
  if (!imageStore.outputFile) return
  const url = URL.createObjectURL(imageStore.outputFile)
  addImage(url)
}
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto" @click="handlePanelFocus" @focusin="handlePanelFocus">
    <div class="flex-1 space-y-6 p-4">
      <!-- Reference Images -->
      <section>
        <ImageDropZone
          :images="referenceImages"
          :max-images="14"
          :is-active="isActivePanel"
          :show-generate-button="false"
          @add-image="handleAddImage"
          @remove-image="handleRemoveImage"
        />
      </section>

      <!-- Divider -->
      <div class="border-t border-zinc-200 dark:border-zinc-700" />

      <!-- Prompt -->
      <section>
        <ImageGeneratorPromptField />
      </section>

      <!-- Aspect Ratio -->
      <section>
        <ImagesAspectRatios />
      </section>

      <!-- Generate Button -->
      <GenerateImageButton class="w-full" />

      <!-- Output -->
      <section v-if="imageStore.outputFile || imageStore.isGenerating">
        <div class="border-t border-zinc-200 dark:border-zinc-700 mb-6" />

        <GeneratorOutputImage />

        <!-- Add to Post button -->
        <div v-if="imageStore.outputFile && !imageStore.isGenerating" class="mt-4">
          <Button
            variant="secondary"
            size="sm"
            @click="addToPost"
            class="w-full gap-1.5"
          >
            <ArrowRight class="h-4 w-4" />
            Add to Post
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>
