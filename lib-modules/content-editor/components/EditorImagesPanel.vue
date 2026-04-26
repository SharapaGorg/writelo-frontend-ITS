<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

// Local state for reference images (url + file)
const referenceImages = ref<string[]>([])
const referenceFiles = ref<File[]>([])

const handleAddImage = (event: ImageAddEvent) => {
  referenceImages.value.push(event.url)
  referenceFiles.value.push(event.file)
}

const handleRemoveImage = (index: number) => {
  referenceImages.value.splice(index, 1)
  referenceFiles.value.splice(index, 1)
}

// Sync first reference image with imageGeneratorStore for API
watch(referenceFiles, (files) => {
  if (files.length > 0) {
    imageStore.setImage(files[0])
  } else {
    imageStore.clearImage()
  }
}, { immediate: true })

// Reverse sync: when store.attachedImage changes externally (e.g. "modify" button)
watch(() => imageStore.attachedImage, (file) => {
  if (!file) return

  // Check if this file is already in our list
  const isAlreadyAdded = referenceFiles.value.some(f => f === file)
  if (isAlreadyAdded) return

  referenceImages.value = [URL.createObjectURL(file)]
  referenceFiles.value = [file]
})

// Add generated image to post
const addToPost = () => {
  const file = imageStore.outputFile
  if (!file) return
  addImage({
    previewUrl: URL.createObjectURL(file),
    fileType: 'image',
    file,
  })
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
      <div class="border-t border-border" />

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
        <div class="border-t border-border mb-6" />

        <GeneratorOutputImage />

        <!-- Add to Post button -->
        <div v-if="imageStore.outputFile && !imageStore.isGenerating">
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
