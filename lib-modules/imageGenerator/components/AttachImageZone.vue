<script setup lang="ts">
import {ref, computed} from 'vue';
import {Image, Upload, X, Loader2} from 'lucide-vue-next';
import {useImageGenerator} from '../composables/useImageGenerator';
import {useImageGeneratorStore} from "../stores";

const { t } = useI18n();

const {
  loading,
  uploadProgress,
  error,
  attachImage,
  removeImage,
  validateImageFile,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE
} = useImageGenerator();

const {attachedImage} = toRefs(useImageGeneratorStore())

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
let dragCounter = 0;

// Create image URL for preview
const imagePreviewUrl = computed(() => {
  if (attachedImage.value) {
    return URL.createObjectURL(attachedImage.value);
  }
  return null;
});

// Format file size for display
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle file selection
const handleFileSelect = async (files: FileList | null) => {
  if (!files || files.length === 0) return;

  const file = files[0];
  await attachImage(file, t);
};

// Click handler
const handleClick = () => {
  if (!attachedImage.value && !loading.value) {
    fileInput.value?.click();
  }
};

// File input change handler
const onFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  handleFileSelect(target.files);
};

// Drag event handlers
const onDragEnter = (event: DragEvent) => {
  event.preventDefault();
  dragCounter++;
  if (event.dataTransfer?.types.includes('Files')) {
    isDragging.value = true;
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  dragCounter = 0;
  isDragging.value = false;

  if (event.dataTransfer?.files) {
    handleFileSelect(event.dataTransfer.files);
  }
};

// Accept attribute for file input
const acceptedTypes = ACCEPTED_IMAGE_TYPES.join(',');
</script>

<template>
  <div
      class="attach-image-zone__container"
      :class="{
      'attach-image-zone__container--dragging': isDragging,
      'attach-image-zone__container--has-image': attachedImage,
      'attach-image-zone__container--loading': loading
    }"
      @click="handleClick"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
  >
    <!-- Hidden file input -->
    <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        class="hidden"
        @change="onFileInputChange"
    />

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center space-y-4">
      <Loader2 class="w-16 h-16 animate-spin text-primary"/>
      <span class="text-lg font-semibold">{{ $t('imageGenerator.attachZone.loading') }}</span>
      <div v-if="uploadProgress > 0" class="w-48 bg-gray-200 rounded-full h-2">
        <div class="bg-primary h-2 rounded-full transition-all" :style="{ width: uploadProgress + '%' }"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!attachedImage" class="flex flex-col items-center space-y-2">
      <Upload v-if="isDragging" class="attach-image-zone__container_icon text-primary"/>
      <Image v-else class="attach-image-zone__container_icon"/>
      <span class="text-xl font-bold">{{ isDragging ? $t('imageGenerator.attachZone.dragActive') : $t('imageGenerator.attachZone.title') }}</span>
      <span class="text-sm text-muted-foreground">{{ $t('imageGenerator.attachZone.subtitle', { maxSize: MAX_FILE_SIZE / 1024 / 1024 }) }}</span>
      <span class="text-xs text-muted-foreground">{{ $t('imageGenerator.attachZone.dragHint') }}</span>
    </div>

    <!-- Image preview -->
    <div v-else class="relative w-full h-full group">
      <img
          :src="imagePreviewUrl"
          alt="Прикрепленное изображение"
          class="w-full h-full object-contain rounded-lg"
      />
      <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <button
            @click.stop="removeImage"
            class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X class="w-6 h-6"/>
        </button>
      </div>
      <div class="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-2 rounded text-sm">
        {{ attachedImage.name }} ({{ formatFileSize(attachedImage.size) }})
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-2 rounded text-sm">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>

.attach-image-zone__container {
  @apply relative max-w-full rounded-lg
  w-[330px] h-[330px] lg:w-[400px] lg:h-[400px]
  border-black dark:border-gray-400
  flex flex-col items-center justify-center
  border-dashed border-2 select-none cursor-pointer
  transition-all duration-200 overflow-hidden;
}

.attach-image-zone__container:hover:not(.attach-image-zone__container--has-image) {
  @apply border-primary bg-primary/5;
}

.attach-image-zone__container--dragging {
  @apply border-primary bg-primary/10 scale-[1.02];
}

.attach-image-zone__container--has-image {
  @apply border-solid p-0;
}

.attach-image-zone__container--loading {
  @apply cursor-wait;
}


</style>