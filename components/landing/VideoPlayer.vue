<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-vue-next'

interface Props {
  src: string
  poster?: string
  autoplay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false
})

const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)

let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!videoRef.value) return

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function setVolume(e: Event) {
  if (!videoRef.value) return
  const target = e.target as HTMLInputElement
  const newVolume = parseFloat(target.value)
  videoRef.value.volume = newVolume
  volume.value = newVolume
  isMuted.value = newVolume === 0
}

function seek(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

async function toggleFullscreen() {
  if (!containerRef.value) return

  if (!document.fullscreenElement) {
    await containerRef.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}

function onLoadedMetadata() {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

function onPlay() {
  isPlaying.value = true
}

function onPause() {
  isPlaying.value = false
}

function onMouseMove() {
  showControls.value = true
  resetHideControlsTimeout()
}

function resetHideControlsTimeout() {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  hideControlsTimeout = setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)

  // Autoplay if requested
  if (props.autoplay && videoRef.value) {
    videoRef.value.play().catch(() => {
      // Autoplay blocked - user will need to click play
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative bg-black rounded-2xl overflow-hidden group"
    @mousemove="onMouseMove"
    @mouseleave="showControls = false"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      class="w-full aspect-video"
      playsinline
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onPlay"
      @pause="onPause"
      @click="togglePlay"
    />

    <!-- Center play button (shown when paused) -->
    <div
      v-if="!isPlaying"
      class="absolute inset-0 flex items-center justify-center cursor-pointer"
      @click="togglePlay"
    >
      <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 hover:scale-110 transition-all">
        <Play class="w-8 h-8 text-white ml-1" />
      </div>
    </div>

    <!-- Controls bar -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300"
      :class="showControls || !isPlaying ? 'opacity-100' : 'opacity-0'"
    >
      <!-- Progress bar -->
      <div
        class="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress"
        @click="seek"
      >
        <div
          class="h-full bg-purple-500 rounded-full relative"
          :style="{ width: `${progress}%` }"
        >
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
        </div>
      </div>

      <!-- Controls row -->
      <div class="flex items-center gap-4">
        <!-- Play/Pause -->
        <button
          class="text-white hover:text-purple-400 transition-colors"
          @click="togglePlay"
        >
          <Pause v-if="isPlaying" class="w-5 h-5" />
          <Play v-else class="w-5 h-5" />
        </button>

        <!-- Time -->
        <span class="text-white/80 text-sm font-mono">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>

        <div class="flex-1" />

        <!-- Volume -->
        <div class="flex items-center gap-2">
          <button
            class="text-white hover:text-purple-400 transition-colors"
            @click="toggleMute"
          >
            <VolumeX v-if="isMuted || volume === 0" class="w-5 h-5" />
            <Volume2 v-else class="w-5 h-5" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="volume"
            class="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            @input="setVolume"
          />
        </div>

        <!-- Fullscreen -->
        <button
          class="text-white hover:text-purple-400 transition-colors"
          @click="toggleFullscreen"
        >
          <Minimize v-if="isFullscreen" class="w-5 h-5" />
          <Maximize v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
