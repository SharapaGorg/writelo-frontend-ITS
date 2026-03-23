<template>
  <div class="user-message-container ">
    <div class="file-message-container" v-show="showDocumentMetadata">
      <File class="w-4 h-4 flex-shrink-0"/>

      <div class=" truncate flex-1">{{ fileName }}</div>
    </div>

    <div class="w-full flex justify-end" v-if="fileType === FileForm.image">
      <!-- Skeleton placeholder for loading images -->
      <div v-if="!imgSrc.length" class="image-skeleton" :style="skeletonStyle">
        <div class="skeleton-shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-icon">
            <ImageIcon class="w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>
      
      <NuxtImg
          class="attached-picture"
          v-else
          :src="imgSrc"
          alt="Attached image"
          @click="openPreview"
      />
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {File, ImageIcon} from "lucide-vue-next";
import {FileForm} from "~/lib-modules/conversations";
import {ApiController} from "~/scripts/shared/api/controller";
import {eventBus} from "~/composables/eventBus";

const props = defineProps<{
  fileId?: string,
  accessHash?: string,
  fileName: string,
  fileType: FileForm,
  content?: File // content of a file
}>();

const $api = new ApiController();
const imgSrc = ref(''); // Start as empty

let objectUrl: string | null = null;

// Image dimensions for skeleton
const imageWidth = ref<number>(300);
const imageHeight = ref<number>(200);

// Compute skeleton style based on dimensions
const skeletonStyle = computed(() => ({
  width: `${imageWidth.value}px`,
  height: `${imageHeight.value}px`,
  maxWidth: '100%'
}));

const openPreview = () => {
  eventBus.emit("openFileFullScreen", {
    type: props.fileType,
    content: imgSrc.value
  })
}

function updateImgSrcFromContent(file: File) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  objectUrl = URL.createObjectURL(file);
  
  // Try to get image dimensions
  const img = new Image();
  img.onload = () => {
    const aspectRatio = img.width / img.height;
    
    // Set skeleton dimensions based on actual image dimensions
    // Keep max width at 600px (matching .attached-picture max-width)
    const maxWidth = 600;
    const calculatedWidth = Math.min(img.width, maxWidth);
    const calculatedHeight = calculatedWidth / aspectRatio;
    
    imageWidth.value = calculatedWidth;
    imageHeight.value = calculatedHeight;
    
    // Set the actual image source after dimensions are calculated
    imgSrc.value = objectUrl;
  };
  
  img.src = objectUrl;
}

watch(
    () => props.content,
    (file) => {
      if (props.fileType === FileForm.image && file) {
        updateImgSrcFromContent(file);
      }
    },
    {immediate: true}
);

// On mount, support fileId-based loading (if no 'content' prop)
onMounted(async () => {
  if (props.fileType === FileForm.image && !props.content && props.fileId) {
    let response = await $api.getFileContent(props.fileId, props.accessHash);
    imgSrc.value = "data:image/jpeg;base64," + response;
  }
});

// Clean up objectURL on unmount
onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
});

const showDocumentMetadata = computed(() => {
  return props.fileType !== FileForm.image;
});

</script>

<style scoped>

.file-message-container {
  @apply rounded-lg px-3 py-2 border-2 border-solid
  border-input
  flex items-center gap-x-2 select-none cursor-pointer
}

.attached-picture {
  @apply block rounded-lg w-full lg:w-auto lg:max-w-[600px]
  cursor-pointer select-none
}

.image-skeleton {
  @apply relative rounded-lg overflow-hidden
  bg-gray-200 dark:bg-gray-800
}

.skeleton-shimmer {
  @apply absolute inset-0 
  bg-gradient-to-r from-transparent via-white/10 to-transparent
  dark:via-white/5
}

.skeleton-content {
  @apply absolute inset-0 flex items-center justify-center
}

.skeleton-icon {
  @apply text-gray-400 dark:text-gray-600
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-shimmer {
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

</style>