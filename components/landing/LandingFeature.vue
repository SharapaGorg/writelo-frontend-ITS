<script setup lang="ts">
import { Settings, LoaderCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { useVideoViewport } from '~/composables/useVideoViewport'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()

interface Props {
  title: string
  description: string
  videoUrl?: string
  poster?: string
  direction?: 'left' | 'right'
  featureId?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left',
  videoUrl: '',
  poster: '',
  featureId: 'unknown'
})

function handleTryClick() {
  $trackGoal('landing_cta_click', { button: `feature_${props.featureId}` })
  router.push('/auth')
}

const { elementRef, isVisible } = useScrollAnimation(0.2)

const slideClass = computed(() => {
  if (!isVisible.value) {
    return props.direction === 'left' ? '-translate-x-16 opacity-0' : 'translate-x-16 opacity-0'
  }
  return 'translate-x-0 opacity-100'
})

const videoRef = ref<HTMLVideoElement | null>(null)
const videoContainerRef = ref<HTMLElement | null>(null)
const isVideoLoading = ref(true)
const shouldPreload = ref(false)

// Handle video loaded
function onVideoCanPlay() {
  isVideoLoading.value = false
}

// Preload video when it's close to viewport (500px margin)
onMounted(() => {
  if (!props.videoUrl) return

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        shouldPreload.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '500px' }
  )

  if (videoContainerRef.value) {
    observer.observe(videoContainerRef.value)
  }

  onUnmounted(() => observer.disconnect())
})

// Setup autoplay when in viewport
useVideoViewport(videoRef, { threshold: 0.5 })
</script>

<template>
  <section
    ref="elementRef"
    class="py-24 px-4"
  >
    <div
      class="max-w-3xl mx-auto transition-all duration-700 ease-out"
      :class="slideClass"
    >
      <!-- Video/Visual -->
      <div
        ref="videoContainerRef"
        class="w-full aspect-video rounded-2xl overflow-hidden border border-purple-500/30 bg-zinc-100 dark:bg-zinc-900 relative mb-8"
      >
        <!-- Video element (only render when should preload) -->
        <video
          v-if="videoUrl && shouldPreload"
          ref="videoRef"
          :src="videoUrl"
          :poster="poster"
          class="w-full h-full object-cover"
          loop
          muted
          playsinline
          preload="auto"
          @canplay="onVideoCanPlay"
        />

        <!-- Loading spinner for video -->
        <div
          v-if="videoUrl && isVideoLoading"
          class="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900"
        >
          <LoaderCircle class="w-10 h-10 text-purple-500 animate-spin" />
        </div>

        <!-- Coming soon placeholder (when no video) -->
        <template v-if="!videoUrl">
          <div class="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />

          <!-- Coming soon overlay -->
          <div class="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3">
            <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Settings class="w-6 h-6 text-white" />
            </div>
            <span class="text-white/90 text-sm font-medium px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              {{ t('landing.features.comingSoon') }}
            </span>
          </div>
        </template>

        <!-- Corner accents -->
        <div class="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-purple-500/40 pointer-events-none" />
        <div class="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-500/40 pointer-events-none" />
        <div class="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-500/40 pointer-events-none" />
        <div class="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple-500/40 pointer-events-none" />
      </div>

      <!-- Text below -->
      <div class="text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
          {{ title }}
        </h2>
        <p class="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-6">
          {{ description }}
        </p>
        <Button
          variant="outline"
          class="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          @click="handleTryClick"
        >
          {{ t('landing.features.cta') }}
        </Button>
      </div>
    </div>
  </section>
</template>
