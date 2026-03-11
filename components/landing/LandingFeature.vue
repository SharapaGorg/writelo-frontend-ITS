<script setup lang="ts">
import { Play } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { useVideoViewport } from '~/composables/useVideoViewport'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const router = useRouter()

interface Props {
  title: string
  description: string
  videoUrl?: string
  poster?: string
  direction?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left',
  videoUrl: '',
  poster: ''
})

const { elementRef, isVisible } = useScrollAnimation(0.2)

const slideClass = computed(() => {
  if (!isVisible.value) {
    return props.direction === 'left' ? '-translate-x-16 opacity-0' : 'translate-x-16 opacity-0'
  }
  return 'translate-x-0 opacity-100'
})

const videoRef = ref<HTMLVideoElement | null>(null)

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
        class="w-full aspect-video rounded-2xl overflow-hidden border border-purple-500/30 bg-zinc-100 dark:bg-zinc-900 relative mb-8"
      >
        <!-- Video element -->
        <video
          v-if="videoUrl"
          ref="videoRef"
          :src="videoUrl"
          :poster="poster"
          class="w-full h-full object-cover"
          loop
          muted
          playsinline
          preload="none"
        />

        <!-- Poster/Placeholder (only when no video) -->
        <template v-if="!videoUrl">
          <img
            v-if="poster"
            :src="poster"
            alt=""
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900"
          />

          <!-- Play overlay (placeholder only) -->
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play class="w-6 h-6 text-white ml-0.5" />
            </div>
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
          @click="router.push('/auth')"
        >
          {{ t('landing.features.cta') }}
        </Button>
      </div>
    </div>
  </section>
</template>
