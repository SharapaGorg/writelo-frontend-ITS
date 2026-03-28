<script lang="ts">
export interface ImageAddEvent {
  url: string
  file: File
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { X, Upload, Sparkles } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'

const props = withDefaults(defineProps<{
  images: string[]
  maxImages?: number
  isActive?: boolean
  showGenerateButton?: boolean
}>(), {
  maxImages: 10,
  isActive: false,
  showGenerateButton: true
})

const emit = defineEmits<{
  addImage: [event: ImageAddEvent]
  removeImage: [index: number]
  generate: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const dropZoneRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)

const canAddMore = computed(() => props.images.length < props.maxImages)
const counterText = computed(() => `${props.images.length}/${props.maxImages}`)

const handleFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    Array.from(files).forEach(processFile)
  }
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  if (!canAddMore.value) return
  const files = event.dataTransfer?.files
  if (files) {
    Array.from(files).forEach(processFile)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as Node | null
  if (!dropZoneRef.value?.contains(relatedTarget)) {
    isDragOver.value = false
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) return
  if (!canAddMore.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      emit('addImage', { url: result, file })
    }
  }
  reader.readAsDataURL(file)
}

// Paste from clipboard - only when active
const handlePaste = (event: ClipboardEvent) => {
  if (!props.isActive) return
  if (!canAddMore.value) return

  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        processFile(file)
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

// Re-register paste handler when isActive changes
watch(() => props.isActive, () => {
  document.removeEventListener('paste', handlePaste)
  document.addEventListener('paste', handlePaste)
})
</script>

<template>
  <div class="space-y-3">
    <!-- Header with counter -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Images
      </h4>
      <span
        :class="cn(
          'text-xs font-medium',
          images.length >= maxImages
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-zinc-500 dark:text-zinc-400'
        )"
      >
        {{ counterText }}
      </span>
    </div>

    <!-- Drop zone wrapper -->
    <div
      ref="dropZoneRef"
      :class="cn(
        'relative rounded-lg border-2 border-dashed p-3 transition-all',
        isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
          : 'border-zinc-300 dark:border-zinc-700'
      )"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >

      <!-- Drag overlay -->
      <div
        v-if="isDragOver && canAddMore"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-blue-500/10"
      >
        <div class="flex flex-col items-center">
          <Upload class="h-10 w-10 text-blue-500" />
          <p class="mt-2 text-sm font-medium text-blue-600">Drop images here</p>
        </div>
      </div>

      <!-- Max reached overlay -->
      <div
        v-if="isDragOver && !canAddMore"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-amber-500/10"
      >
        <p class="text-sm font-medium text-amber-600">Maximum images reached</p>
      </div>

      <!-- Images Grid -->
      <div v-if="images.length > 0" class="grid grid-cols-3 gap-2">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
        >
          <img
            :src="image"
            :alt="`Image ${index + 1}`"
            class="h-full w-full object-cover"
          />
          <button
            @click="emit('removeImage', index)"
            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            type="button"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-6 cursor-pointer"
        @click="handleFileSelect"
      >
        <Upload class="h-8 w-8 text-zinc-400 mb-2" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Drop images, paste from clipboard,<br>or click to upload
        </p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        @click="handleFileSelect"
        :disabled="!canAddMore"
        class="gap-1.5"
      >
        <Upload class="h-4 w-4" />
        Upload
      </Button>
      <Button
        v-if="showGenerateButton"
        variant="secondary"
        size="sm"
        @click="emit('generate')"
        class="gap-1.5"
      >
        <Sparkles class="h-4 w-4" />
        Generate
      </Button>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
