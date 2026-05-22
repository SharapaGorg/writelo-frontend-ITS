<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useMediaControls, useEventListener } from '@vueuse/core'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    src?: string | null
    poster?: string | null
    autoplay?: boolean
  }>(),
  { autoplay: true }
)

const containerRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const hovered = ref(false)
const isFullscreen = ref(false)

const srcRef = computed(() => props.src ?? undefined)

const { playing, currentTime, duration, muted, volume, waiting, buffered } = useMediaControls(videoRef, {
  src: srcRef,
})

const progress = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

// Furthest buffered point (for the dim track behind the scrubber).
const bufferedEnd = computed(() => {
  if (!duration.value || !buffered.value.length) return 0
  const last = buffered.value[buffered.value.length - 1]
  return Math.min(100, (last[1] / duration.value) * 100)
})

function togglePlay() {
  if (!srcRef.value) return
  playing.value = !playing.value
}

function toggleMute() {
  muted.value = !muted.value
  // Restoring a sensible volume after un-muting from 0.
  if (!muted.value && volume.value === 0) volume.value = 1
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    containerRef.value?.requestFullscreen()
  }
}

function onScrub(e: Event) {
  if (!duration.value) return
  const v = parseFloat((e.target as HTMLInputElement).value)
  currentTime.value = (v / 100) * duration.value
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

useEventListener(document, 'fullscreenchange', () => {
  isFullscreen.value = document.fullscreenElement === containerRef.value
})

// Auto-start muted on src change (browsers block unmuted autoplay).
watch(
  srcRef,
  (s) => {
    if (s && props.autoplay) {
      muted.value = true
      // Defer one tick so the <video> element picks up the new src first.
      setTimeout(() => {
        playing.value = true
      }, 60)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (document.fullscreenElement === containerRef.value) {
    document.exitFullscreen().catch(() => {})
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Blurred poster background for letterboxing -->
    <img
      v-if="poster"
      :src="poster"
      aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 pointer-events-none"
    />

    <template v-if="srcRef">
      <video
        ref="videoRef"
        :poster="poster ?? undefined"
        class="relative z-10 max-h-full max-w-full object-contain"
        playsinline
        loop
        preload="metadata"
        @click="togglePlay"
        @dblclick="toggleFullscreen"
      />

      <!-- Center play overlay when paused -->
      <button
        v-if="!playing && !waiting"
        type="button"
        class="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        aria-label="Play"
        @click="togglePlay"
      >
        <div class="size-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
          <Play class="w-7 h-7 ml-1 fill-current" />
        </div>
      </button>

      <!-- Buffering -->
      <div
        v-if="waiting"
        class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
      >
        <Loader2 class="w-10 h-10 text-white animate-spin drop-shadow-lg" />
      </div>

      <!-- Bottom controls -->
      <div
        class="absolute inset-x-0 bottom-0 z-30 px-3 pt-6 pb-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-200"
        :class="(hovered || !playing) ? 'opacity-100' : 'opacity-0'"
      >
        <!-- Scrubber with buffered hint -->
        <div class="relative h-3 flex items-center group">
          <div class="absolute inset-x-0 h-1 bg-white/15 rounded-full" />
          <div
            class="absolute h-1 bg-white/35 rounded-full"
            :style="{ width: `${bufferedEnd}%` }"
          />
          <div
            class="absolute h-1 bg-brand rounded-full"
            :style="{ width: `${progress}%` }"
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.05"
            :value="progress"
            class="reel-scrubber relative w-full appearance-none bg-transparent cursor-pointer z-10"
            @input="onScrub"
          />
        </div>

        <div class="flex items-center justify-between mt-1.5 text-white text-xs">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="hover:scale-110 transition-transform"
              :aria-label="playing ? 'Pause' : 'Play'"
              @click="togglePlay"
            >
              <Pause v-if="playing" class="w-4 h-4 fill-current" />
              <Play v-else class="w-4 h-4 fill-current" />
            </button>
            <span class="tabular-nums opacity-90">
              {{ formatTime(currentTime) }} <span class="opacity-50">/ {{ formatTime(duration) }}</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="hover:scale-110 transition-transform"
              :aria-label="muted ? 'Unmute' : 'Mute'"
              @click="toggleMute"
            >
              <VolumeX v-if="muted" class="w-4 h-4" />
              <Volume2 v-else class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="hover:scale-110 transition-transform"
              :aria-label="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
              @click="toggleFullscreen"
            >
              <Minimize v-if="isFullscreen" class="w-4 h-4" />
              <Maximize v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- No video URL: poster + notice -->
    <template v-else>
      <img
        v-if="poster"
        :src="poster"
        alt=""
        class="relative z-10 max-h-full max-w-full object-contain"
      />
      <div class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
        <Play class="w-10 h-10 opacity-50" />
        <span class="text-sm font-medium">Видео пока недоступно</span>
        <span class="text-xs opacity-70 max-w-[260px] text-center">
          Бэк кэширует видео отдельно — добавим, когда поле <code class="bg-white/10 px-1 rounded">videoUrl</code> придёт в DTO
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reel-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: white;
  border: 2px solid var(--brand, #d4683f);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.group:hover .reel-scrubber::-webkit-slider-thumb,
.reel-scrubber:focus::-webkit-slider-thumb {
  opacity: 1;
}
.reel-scrubber::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: white;
  border: 2px solid var(--brand, #d4683f);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.reel-scrubber::-webkit-slider-runnable-track {
  background: transparent;
  height: 1px;
}
.reel-scrubber::-moz-range-track {
  background: transparent;
  height: 1px;
}
</style>
