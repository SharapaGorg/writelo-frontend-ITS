<script setup lang="ts">
import {X, Loader2, ImageOff} from 'lucide-vue-next';
import {useImageHistory} from '../composables/useImageHistory';
import type {ImageHistoryItem} from '../types';

const {images, isLoading, hasMore, isInitialized, fetchImages, getImageUrl} = useImageHistory();

const sliderRef = ref<HTMLElement | null>(null);
const fullscreenImage = ref<ImageHistoryItem | null>(null);

// Initial fetch
onMounted(() => {
  if (!isInitialized.value) {
    fetchImages();
  }
});

// Infinite scroll handler
const onScroll = () => {
  if (!sliderRef.value || isLoading.value || !hasMore.value) return;

  const {scrollLeft, scrollWidth, clientWidth} = sliderRef.value;
  const scrollEnd = scrollWidth - clientWidth - scrollLeft;

  // Load more when 100px from the end
  if (scrollEnd < 100) {
    fetchImages();
  }
};

const openFullscreen = (image: ImageHistoryItem) => {
  if (!image.accessHash) return;
  fullscreenImage.value = image;
  document.body.style.overflow = 'hidden';
};

const closeFullscreen = () => {
  fullscreenImage.value = null;
  document.body.style.overflow = '';
};

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="image-history">
    <h3 class="text-md font-medium mb-2">{{ $t('imageGenerator.history.title') }}</h3>

    <div
        ref="sliderRef"
        class="image-history__slider"
        @scroll="onScroll"
    >
      <!-- Images -->
      <div
          v-for="image in images"
          :key="image.id"
          class="image-history__item"
          :class="{'image-history__item--clickable': image.accessHash}"
          @click="openFullscreen(image)"
      >
        <img
            v-if="image.accessHash"
            :src="getImageUrl(image)"
            :alt="image.prompt"
            loading="lazy"
            class="image-history__image"
        />
        <div v-else class="image-history__failed">
          <ImageOff class="w-6 h-6 text-muted-foreground"/>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="image-history__loading">
        <Loader2 class="w-6 h-6 animate-spin text-primary"/>
      </div>

      <!-- Empty state -->
      <div v-if="isInitialized && images.length === 0 && !isLoading" class="image-history__empty">
        <span class="text-sm text-muted-foreground">{{ $t('imageGenerator.history.empty') }}</span>
      </div>
    </div>

    <!-- Fullscreen modal -->
    <Teleport to="body">
      <Transition name="fullscreen">
        <div
            v-if="fullscreenImage"
            class="fullscreen-overlay"
            @click="closeFullscreen"
        >
          <button
              class="fullscreen-close"
              @click.stop="closeFullscreen"
          >
            <X class="w-6 h-6"/>
          </button>
          <div class="fullscreen-content" @click.stop>
            <img
                :src="getImageUrl(fullscreenImage)"
                :alt="fullscreenImage.prompt"
                class="fullscreen-image"
            />
            <p class="fullscreen-prompt">{{ fullscreenImage.prompt }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.image-history {
  @apply flex flex-col;
}

.image-history__slider {
  @apply flex gap-2 overflow-x-auto pb-2;
  @apply w-[340px] sm:w-[500px] md:w-[700px] lg:w-[900px] xl:w-full;
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;

    &:hover {
      background: hsl(var(--muted-foreground) / 0.5);
    }
  }
}

.image-history__item {
  @apply flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
  border-2 border-input bg-muted;
}

.image-history__item--clickable {
  @apply cursor-pointer hover:border-primary transition-colors;
}

.image-history__image {
  @apply w-full h-full object-cover;
}

.image-history__failed {
  @apply w-full h-full flex items-center justify-center;
}

.image-history__loading {
  @apply flex-shrink-0 w-20 h-20 flex items-center justify-center;
}

.image-history__empty {
  @apply flex items-center justify-center py-4 w-full;
}

.fullscreen-overlay {
  @apply fixed inset-0 z-50 bg-black/90 flex items-center justify-center;
}

.fullscreen-close {
  @apply absolute top-4 right-4 p-2 text-white bg-white/20 rounded-full
  hover:bg-white/30 transition-colors z-10;
}

.fullscreen-content {
  @apply flex flex-col items-center gap-4 max-w-[95vw] max-h-[95vh];
}

.fullscreen-image {
  @apply max-w-full max-h-[85vh] object-contain rounded-lg;
}

.fullscreen-prompt {
  @apply text-white text-center text-sm max-w-lg px-4;
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
