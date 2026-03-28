<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Sparkles, Copy, Download, ArrowRight, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import ImageStack from './ImageStack.vue'
import { useContentEditor } from '../composables/useContentEditor'

const { addImage, activePanel, setActivePanel } = useContentEditor()

const isActivePanel = computed(() => activePanel.value === 'left')

// Handle panel focus
const handlePanelFocus = () => {
  setActivePanel('left')
}

// Paste from clipboard for reference images
const handlePaste = (event: ClipboardEvent) => {
  if (!isActivePanel.value) return
  if (referenceImages.value.length >= 14) return

  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        handleAddImage(file)
      }
    }
  }
}

onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})

// Local state
const referenceImages = ref<string[]>([])
const prompt = ref('')
const aspectRatio = ref('1:1')
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)

const aspectRatioOptions = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:5', label: '4:5 (Portrait)' },
  { value: '9:16', label: '9:16 (Story)' },
  { value: '16:9', label: '16:9 (Landscape)' }
]

const canGenerate = computed(() => prompt.value.trim().length > 0 && !isGenerating.value)

const handleAddImage = (file: File) => {
  // Convert file to base64 for display
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      referenceImages.value.push(result)
    }
  }
  reader.readAsDataURL(file)
}

const handleRemoveImage = (index: number) => {
  referenceImages.value.splice(index, 1)
}

const generate = async () => {
  if (!canGenerate.value) return

  isGenerating.value = true
  generatedImage.value = null

  try {
    // TODO: Replace with actual API call
    // Simulate image generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Placeholder: create a simple gradient image as mock result
    generatedImage.value = createMockImage()
  } catch (error) {
    console.error('Image generation failed:', error)
  } finally {
    isGenerating.value = false
  }
}

const createMockImage = (): string => {
  // Create a simple canvas-based placeholder image
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, '#6366f1')
    gradient.addColorStop(0.5, '#8b5cf6')
    gradient.addColorStop(1, '#ec4899')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    ctx.fillStyle = 'white'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Generated Image', 256, 256)
  }
  return canvas.toDataURL('image/png')
}

const copyImage = async () => {
  if (!generatedImage.value) return
  try {
    const response = await fetch(generatedImage.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
  } catch (error) {
    console.error('Failed to copy image:', error)
  }
}

const downloadImage = () => {
  if (!generatedImage.value) return
  const link = document.createElement('a')
  link.href = generatedImage.value
  link.download = `generated-${Date.now()}.png`
  link.click()
}

const addToPost = () => {
  if (!generatedImage.value) return
  addImage(generatedImage.value)
}
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto" @click="handlePanelFocus" @focusin="handlePanelFocus">
    <div class="flex-1 space-y-6 p-4">
      <!-- References Section -->
      <section>
        <h3 class="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Reference Images
        </h3>
        <ImageStack
          :images="referenceImages"
          :max-images="14"
          @add="handleAddImage"
          @remove="handleRemoveImage"
        />
        <p class="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Add up to 14 product photos as references
        </p>
      </section>

      <!-- Divider -->
      <div class="border-t border-zinc-200 dark:border-zinc-700" />

      <!-- Prompt Section -->
      <section>
        <label class="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Prompt
        </label>
        <Textarea
          v-model="prompt"
          placeholder="Describe the promotional image you want to generate..."
          class="min-h-24 resize-none"
        />
      </section>

      <!-- Aspect Ratio Section -->
      <section>
        <label class="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Aspect Ratio
        </label>
        <Select v-model="aspectRatio">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in aspectRatioOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      <!-- Generate Button -->
      <Button
        @click="generate"
        :disabled="!canGenerate"
        class="w-full gap-2"
      >
        <Loader2 v-if="isGenerating" class="h-4 w-4 animate-spin" />
        <Sparkles v-else class="h-4 w-4" />
        {{ isGenerating ? 'Generating...' : 'Generate' }}
      </Button>

      <!-- Result Section -->
      <template v-if="generatedImage">
        <div class="border-t border-zinc-200 dark:border-zinc-700" />

        <section>
          <h3 class="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Result
          </h3>

          <!-- Generated Image -->
          <div class="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <img
              :src="generatedImage"
              alt="Generated image"
              class="w-full object-contain"
            />
          </div>

          <!-- Action Buttons -->
          <div class="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="copyImage"
              class="gap-1.5"
            >
              <Copy class="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="downloadImage"
              class="gap-1.5"
            >
              <Download class="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="secondary"
              size="sm"
              @click="addToPost"
              class="gap-1.5"
            >
              <ArrowRight class="h-4 w-4" />
              Add to Post
            </Button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
