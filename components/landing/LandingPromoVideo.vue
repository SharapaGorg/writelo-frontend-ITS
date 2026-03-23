<script setup lang="ts">
import VideoPlayer from '~/components/landing/VideoPlayer.vue'
import { Play } from 'lucide-vue-next'
import { useScrollAnimation } from '~/composables/useScrollAnimation'

interface Props {
  videoUrl?: string // m3u8 or mp4 URL
  poster?: string // Preview image URL
}

const props = withDefaults(defineProps<Props>(), {
  videoUrl: '/landing/promo.mp4',
  poster: '/landing/poster.png'
})

const { $trackGoal } = useNuxtApp()
const { elementRef, isVisible } = useScrollAnimation(0.2)

const hasStarted = ref(false)

function startVideo() {
  $trackGoal('landing_video_play', { video: 'promo' })
  hasStarted.value = true
}
</script>

<template>
  <section
    ref="elementRef"
    class="py-20 px-4"
  >
    <div
      class="max-w-4xl mx-auto transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
    >
      <!-- Video container with glow effect -->
      <div class="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
        <!-- VideoPlayer component (shown after user clicks play) -->
        <VideoPlayer
          v-if="hasStarted"
          :src="videoUrl"
          :poster="poster"
          autoplay
          class="w-full"
        />

        <!-- Preview/Poster with play button -->
        <div
          v-if="!hasStarted"
          class="aspect-video relative cursor-pointer group"
          @click="startVideo"
        >
          <!-- Background: poster image or stylized mockup -->
          <div class="absolute inset-0">
            <img
              v-if="poster"
              :src="poster"
              alt="Video preview"
              class="w-full h-full object-cover"
            />
            <!-- Stylized UI mockup preview -->
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-100 to-purple-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/50 p-8 md:p-12"
            >
              <!-- Fake app window -->
              <div class="h-full rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-950/80 overflow-hidden flex flex-col">
                <!-- Window header -->
                <div class="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/60" />
                    <div class="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div class="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div class="flex-1 flex justify-center">
                    <div class="px-4 py-1 rounded bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs">writelo.io</div>
                  </div>
                </div>
                <!-- Window content -->
                <div class="flex-1 p-4 flex gap-4">
                  <!-- Sidebar -->
                  <div class="w-1/4 space-y-2">
                    <div class="h-8 rounded bg-purple-500/20 animate-pulse" />
                    <div class="h-6 rounded bg-zinc-200/50 dark:bg-zinc-800/50 w-3/4" />
                    <div class="h-6 rounded bg-zinc-200/50 dark:bg-zinc-800/50 w-5/6" />
                    <div class="h-6 rounded bg-zinc-200/50 dark:bg-zinc-800/50 w-2/3" />
                  </div>
                  <!-- Main content -->
                  <div class="flex-1 space-y-3">
                    <div class="h-4 rounded bg-zinc-300/30 dark:bg-zinc-600/30 w-1/3" />
                    <div class="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                      <div class="space-y-2">
                        <div class="h-3 rounded bg-zinc-300/40 dark:bg-zinc-600/40 w-full" />
                        <div class="h-3 rounded bg-zinc-300/40 dark:bg-zinc-600/40 w-5/6" />
                        <div class="h-3 rounded bg-zinc-300/40 dark:bg-zinc-600/40 w-4/6" />
                        <div class="h-3 rounded bg-purple-500/30 w-3/6 mt-4" />
                      </div>
                    </div>
                    <!-- Input area -->
                    <div class="h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100/30 dark:bg-zinc-800/30 flex items-center px-4">
                      <div class="h-2 rounded bg-zinc-400/50 dark:bg-zinc-500/50 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Decorative grid overlay -->
          <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <!-- Gradient overlay for better contrast -->
          <div v-if="poster" class="absolute inset-0 bg-black/30" />

          <!-- Play button -->
          <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div class="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300 cursor-pointer">
              <Play class="w-8 h-8 text-white ml-1" />
            </div>
            <span v-if="!videoUrl" class="text-zinc-500 dark:text-zinc-400 text-sm mt-4">Видео скоро будет</span>
          </div>

          <!-- Corner accents -->
          <div class="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/30" />
          <div class="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-500/30" />
          <div class="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-500/30" />
          <div class="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-500/30" />
        </div>
      </div>
    </div>
  </section>
</template>
