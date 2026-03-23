<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toastError } from '~/scripts/features/utils/toater'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGES = 10

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dropZoneRef = ref<HTMLDivElement | null>(null)

const images = computed(() => props.modelValue)
const canAddMore = computed(() => images.value.length < MAX_IMAGES)

function handleFiles(files: FileList | File[]) {
  const fileArray = Array.from(files)

  for (const file of fileArray) {
    if (images.value.length >= MAX_IMAGES) {
      toastError(`Максимум ${MAX_IMAGES} изображений`)
      break
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toastError(`Неподдерживаемый формат: ${file.name}`)
      continue
    }

    if (file.size > MAX_FILE_SIZE) {
      toastError(`Файл слишком большой: ${file.name} (макс. 10MB)`)
      continue
    }

    const url = URL.createObjectURL(file)
    emit('update:modelValue', [...images.value, url])
  }
}

function removeImage(index: number) {
  const url = images.value[index]
  URL.revokeObjectURL(url)
  const newImages = [...images.value]
  newImages.splice(index, 1)
  emit('update:modelValue', newImages)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
    input.value = '' // Reset for re-selection
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  const imageFiles: File[] = []
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) imageFiles.push(file)
    }
  }

  if (imageFiles.length > 0) {
    e.preventDefault()
    handleFiles(imageFiles)
  }
}

onMounted(() => {
  document.addEventListener('paste', onPaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', onPaste)
  // Cleanup object URLs
  images.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
})
</script>

<template>
  <div class="space-y-3">
    <!-- Image grid -->
    <div v-if="images.length > 0" class="grid grid-cols-3 gap-2">
      <div
        v-for="(img, idx) in images"
        :key="img"
        class="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 group"
      >
        <img
          :src="img"
          class="w-full h-full object-cover"
          alt=""
        />
        <button
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          @click="removeImage(idx)"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Drop zone -->
    <div
      v-if="canAddMore"
      ref="dropZoneRef"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragging
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
      ]"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @click="openFilePicker"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        class="hidden"
        @change="onFileSelect"
      />

      <svg class="w-8 h-8 mx-auto mb-2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>

      <p class="text-sm text-zinc-400 mb-1">
        Перетащите изображения сюда
      </p>
      <p class="text-xs text-zinc-500">
        или кликните для выбора (Ctrl+V для вставки)
      </p>
      <p class="text-xs text-zinc-600 mt-2">
        {{ images.length }}/{{ MAX_IMAGES }} изображений
      </p>
    </div>

    <!-- Limit reached message -->
    <div
      v-else
      class="text-center py-3 text-xs text-zinc-500"
    >
      Достигнут лимит изображений ({{ MAX_IMAGES }})
    </div>
  </div>
</template>
