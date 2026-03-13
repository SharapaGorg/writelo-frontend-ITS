<script setup lang="ts">
import {defineComponent} from 'vue'
import {Wallpaper, Loader2, X} from "lucide-vue-next";
import {useImageGeneratorStore} from "../stores";
import ImageGeneratorOutputActions from "./ImageGeneratorOutputActions.vue";
import {useImageGenerator} from "~/lib-modules/imageGenerator/composables";

defineComponent({
  name: "GeneratorOutputImage",
})

const store = useImageGeneratorStore();
const {outputFile, isGenerating} = toRefs(store);

const isFullscreen = ref(false);

// Create URL for the generated image
const imageUrl = computed(() => {
  if (outputFile.value) {
    return URL.createObjectURL(outputFile.value);
  }
  return '';
});

const openFullscreen = () => {
  isFullscreen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeFullscreen = () => {
  isFullscreen.value = false;
  document.body.style.overflow = '';
};

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  document.body.style.overflow = '';
});


</script>

<template>
  <div class="flex flex-col gap-y-4">
    <div class="generator-output-image__container">
      <!-- Loading state -->
      <template v-if="isGenerating">
        <div class="flex flex-col items-center justify-center h-full space-y-4">
          <div class="relative">
            <Loader2 class="w-12 h-12 animate-spin text-primary"/>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 bg-primary/10 rounded-full animate-pulse"/>
            </div>
          </div>
          <div class="text-center space-y-2">
            <p class="text-lg font-semibold">{{ $t('imageGenerator.output.loading.title') }}</p>
            <p class="text-sm text-muted-foreground">{{ $t('imageGenerator.output.loading.subtitle') }}</p>
          </div>
          <div class="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full animate-progress"/>
          </div>
        </div>
      </template>

      <!-- Default state (no image) -->
      <template v-else-if="!outputFile">
        <Wallpaper class="attach-image-zone__container_icon"/>
        <span class="text-xl font-bold">{{ $t('imageGenerator.output.title') }}</span>
        <span class="text-sm text-muted-foreground">{{ $t('imageGenerator.output.subtitle') }}</span>
      </template>

      <!-- Generated image -->
      <template v-else>
        <div class="generator-output-image__preview" @click="openFullscreen">
          <img :src="imageUrl" alt="Generated image" class="w-full h-full object-contain cursor-pointer"/>
        </div>
      </template>
    </div>

    <ImageGeneratorOutputActions v-if="!!outputFile"/>

    <!-- Fullscreen modal -->
    <Teleport to="body">
      <Transition name="fullscreen">
        <div
            v-if="isFullscreen"
            class="fullscreen-overlay"
            @click="closeFullscreen"
        >
          <button
              class="fullscreen-close"
              @click.stop="closeFullscreen"
          >
            <X class="w-6 h-6"/>
          </button>
          <img
              :src="imageUrl"
              alt="Generated image"
              class="fullscreen-image"
              @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>

.generator-output-image__container {
  @apply flex flex-col items-center justify-center space-y-2
  w-[330px] h-[330px] lg:w-[400px] lg:h-[400px]
  rounded-lg
  border-black dark:border-gray-400
  border-solid border-2 select-none
  transition-all duration-200 overflow-hidden;
}


.generator-output-image__preview {
  @apply w-full h-full p-4 flex items-center justify-center;
}

.generator-output-image__preview img {
  @apply max-w-full max-h-full object-contain;
}

@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.animate-progress {
  animation: progress 3s ease-in-out;
}

.fullscreen-overlay {
  @apply fixed inset-0 z-50 bg-black/90 flex items-center justify-center;
}

.fullscreen-close {
  @apply absolute top-14 right-4 p-2 text-white bg-white/20 rounded-full
  hover:bg-white/30 transition-colors;
}

.fullscreen-image {
  @apply max-w-[95vw] max-h-[95vh] object-contain;
}

/* Fullscreen transition */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: opacity 0.3s ease;
}

.fullscreen-enter-active .fullscreen-image,
.fullscreen-leave-active .fullscreen-image {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
}

.fullscreen-enter-from .fullscreen-image,
.fullscreen-leave-to .fullscreen-image {
  transform: scale(0.9);
  opacity: 0;
}

</style>