<script lang="ts">
export interface ImageAddEvent {
  url: string
  file: File
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { X, Upload, Sparkles, Plus, AlertTriangle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { toastError } from '~/scripts/features/utils/toater'

// Backend rejects files >16 MiB on /uploads/init. We use the server-config value if
// available, falling back to the same constant so client-side validation matches.
const FALLBACK_MAX_FILE_SIZE = 16 * 1024 * 1024

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(mb < 10 ? 1 : 0)} МБ`
}

const props = withDefaults(defineProps<{
  images: string[]
  maxImages?: number
  isActive?: boolean
  showGenerateButton?: boolean
  acceptVideo?: boolean
}>(), {
  maxImages: 10,
  isActive: false,
  showGenerateButton: true,
  acceptVideo: false
})

const emit = defineEmits<{
  addImage: [event: ImageAddEvent]
  removeImage: [index: number]
  generate: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const dropZoneRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)

// Локальная пометка файлов, которые были отвергнуты (сейчас — только по размеру).
// В draft не попадают, нужны только чтобы показать пользователю, ЧТО именно не прошло.
interface RejectedFile {
  id: string
  name: string
  size: number
  reason: string
}
const rejectedFiles = ref<RejectedFile[]>([])

function dismissRejected(id: string) {
  rejectedFiles.value = rejectedFiles.value.filter(r => r.id !== id)
}

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

const isValidFileType = (file: File): boolean => {
  if (props.acceptVideo) {
    return file.type.startsWith('video/')
  }
  return file.type.startsWith('image/')
}

const maxFileSize = computed(
  () => useSettings().getConfig()?.filesConfig?.maxFileSizeBytes ?? FALLBACK_MAX_FILE_SIZE,
)

const processFile = (file: File) => {
  if (!isValidFileType(file)) return
  if (!canAddMore.value) return

  if (file.size > maxFileSize.value) {
    const reason = `${formatBytes(file.size)} (лимит ${formatBytes(maxFileSize.value)})`
    rejectedFiles.value = [
      ...rejectedFiles.value,
      { id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, size: file.size, reason },
    ]
    toastError(`«${file.name}» — слишком большой: ${reason}`)
    return
  }

  // Blob URL instead of base64: FullHD image as a data-URL can be multi-MB of
  // reactive string state + forces `<img>` to re-decode full-res on every render.
  const url = URL.createObjectURL(file)
  emit('addImage', { url, file })
}

// Paste from clipboard - only when active
const handlePaste = (event: ClipboardEvent) => {
  if (!props.isActive) return
  if (!canAddMore.value) return

  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    const isValidType = props.acceptVideo
      ? item.type.startsWith('video/')
      : item.type.startsWith('image/')

    if (isValidType) {
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
      <h4 class="text-sm font-medium text-foreground">
        {{ acceptVideo ? 'Видео' : $t('editor.media.header') }}
      </h4>
      <span
        v-if="!acceptVideo"
        :class="cn(
          'text-xs font-medium',
          images.length >= maxImages
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground'
        )"
      >
        {{ counterText }}
      </span>
    </div>

    <!-- Drop zone wrapper -->
    <div
      ref="dropZoneRef"
      :class="cn(
        'relative rounded-md border-2 border-dashed p-3 transition-all',
        isDragOver
          ? 'border-ring bg-accent'
          : 'border-border'
      )"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >

      <!-- Drag overlay -->
      <div
        v-if="isDragOver && canAddMore"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-ring/10"
      >
        <div class="flex flex-col items-center">
          <Upload class="h-10 w-10 text-primary" />
          <p class="mt-2 text-sm font-medium text-primary">{{ acceptVideo ? 'Перетащите видео сюда' : $t('editor.media.dropHere') }}</p>
        </div>
      </div>

      <!-- Max reached overlay -->
      <div
        v-if="isDragOver && !canAddMore"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-amber-500/10"
      >
        <p class="text-sm font-medium text-amber-600">{{ $t('editor.media.max') }}</p>
      </div>

      <!-- Images/Video Grid -->
      <div v-if="images.length > 0 || rejectedFiles.length > 0" :class="acceptVideo ? '' : 'grid grid-cols-3 gap-2'">
        <div
          v-for="(media, index) in images"
          :key="index"
          :class="cn(
            'group relative overflow-hidden rounded-md bg-muted',
            acceptVideo ? 'aspect-video w-full' : 'aspect-square'
          )"
        >
          <video
            v-if="acceptVideo"
            :src="media"
            class="h-full w-full object-cover"
            controls
          />
          <img
            v-else
            :src="media"
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

        <!-- Rejected files (size limit etc.) — отрисовываются вместе с сеткой,
             чтобы пользователь видел, какой файл не пропустился -->
        <div
          v-for="rejected in rejectedFiles"
          :key="rejected.id"
          class="aspect-square relative flex flex-col items-center justify-center gap-1 rounded-md border-2 border-destructive/60 bg-destructive/10 p-2 text-center"
          :title="`${rejected.name} — ${rejected.reason}`"
        >
          <AlertTriangle class="h-5 w-5 text-destructive shrink-0" />
          <div class="text-[10px] font-medium text-destructive line-clamp-2 break-all">
            {{ rejected.name }}
          </div>
          <div class="text-[10px] text-destructive/80">{{ rejected.reason }}</div>
          <button
            type="button"
            class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
            @click="dismissRejected(rejected.id)"
          >
            <X class="h-3 w-3" />
          </button>
        </div>

        <!-- Add-more tile (images only — video is single-file mode) -->
        <button
          v-if="!acceptVideo && canAddMore"
          type="button"
          class="aspect-square flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-ring hover:text-foreground hover:bg-accent transition-colors"
          @click="handleFileSelect"
        >
          <Plus class="h-5 w-5" />
          <span class="text-[11px] font-medium">Добавить</span>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-6 cursor-pointer"
        @click="handleFileSelect"
      >
        <Upload class="h-8 w-8 text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground text-center">
          <template v-if="acceptVideo">
            Перетащите видео или нажмите для загрузки
          </template>
          <span v-else v-html="$t('editor.media.uploadHint')" />
        </p>
      </div>
    </div>

    <!-- Action buttons (not for video mode) -->
    <div v-if="showGenerateButton && !acceptVideo" class="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        @click="emit('generate')"
        class="gap-1.5"
      >
        <Sparkles class="h-4 w-4" />
        {{ $t('editor.media.generate') }}
      </Button>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptVideo ? 'video/*' : 'image/*'"
      :multiple="!acceptVideo"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
