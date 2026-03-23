<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { Button } from '~/components/ui/button'

const { t } = useI18n()
const router = useRouter()
const { $trackGoal } = useNuxtApp()
const { elementRef, isVisible } = useScrollAnimation(0.3)

function handleStartSaving() {
  $trackGoal('landing_cta_click', { button: 'calculator_start_saving' })
  router.push('/auth')
}

const hasInteractedWithSlider = ref(false)

function handleSliderChange() {
  if (!hasInteractedWithSlider.value) {
    hasInteractedWithSlider.value = true
    $trackGoal('calculator_slider_used', { posts: posts.value })
  }
}

const posts = ref(10)
const minPosts = 5
const maxPosts = 30

const MINUTES_SAVED_PER_POST = 30

const weeklyHours = computed(() => Math.round((posts.value * MINUTES_SAVED_PER_POST) / 60))
const monthlyHours = computed(() => weeklyHours.value * 4)

const sliderPercent = computed(() => ((posts.value - minPosts) / (maxPosts - minPosts)) * 100)
</script>

<template>
  <section
    ref="elementRef"
    class="min-h-screen flex items-center justify-center px-4 py-20"
  >
    <div
      class="max-w-2xl mx-auto text-center transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
    >
      <h2 class="text-3xl md:text-4xl font-bold mb-12 text-zinc-900 dark:text-zinc-50">
        {{ t('landing.calculator.title') }}
      </h2>

      <!-- Slider -->
      <div class="mb-12">
        <p class="text-zinc-500 dark:text-zinc-400 mb-6">{{ t('landing.calculator.question') }}</p>

        <div class="relative px-4">
          <!-- Track -->
          <div class="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full relative">
            <!-- Fill -->
            <div
              class="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-150"
              :style="{ width: `${sliderPercent}%` }"
            />
          </div>

          <!-- Input -->
          <input
            v-model.number="posts"
            type="range"
            :min="minPosts"
            :max="maxPosts"
            class="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
            @change="handleSliderChange"
          />

          <!-- Thumb indicator -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg shadow-purple-500/30 pointer-events-none transition-all duration-150"
            :style="{ left: `calc(${sliderPercent}% - 12px)` }"
          />
        </div>

        <!-- Labels -->
        <div class="flex justify-between mt-4 text-sm text-zinc-400 dark:text-zinc-500">
          <span>{{ minPosts }}</span>
          <span class="text-zinc-500 dark:text-zinc-400 font-medium">{{ posts }} {{ t('landing.calculator.posts') }}</span>
          <span>{{ maxPosts }}+</span>
        </div>
      </div>

      <!-- Result -->
      <div class="space-y-2">
        <div class="text-6xl md:text-8xl font-bold">
          <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            ~{{ weeklyHours }}
          </span>
          <span class="text-2xl md:text-3xl text-zinc-500 dark:text-zinc-400 ml-2">{{ t('landing.calculator.hoursPerWeekShort') }}</span>
        </div>
        <p class="text-xl text-zinc-500 dark:text-zinc-400">
          -> {{ monthlyHours }} {{ t('landing.calculator.hoursPerMonthShort') }}
        </p>
      </div>

      <!-- Benefit text -->
      <p class="mt-8 text-zinc-500 dark:text-zinc-400 mb-8">
        {{ t('landing.calculator.benefit') }}
      </p>

      <Button
        class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white dark:text-white"
        @click="handleStartSaving"
      >
        {{ t('landing.calculator.cta') }}
      </Button>
    </div>
  </section>
</template>
