<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { Routes } from '~/scripts/shared/types'

const { t } = useI18n()
const router = useRouter()
const userController = useUserController()
const { $trackGoal } = useNuxtApp()

const { elementRef, isVisible } = useScrollAnimation(0.1)

function handleCTA() {
  $trackGoal('landing_cta_click', { button: 'hero_try_free' })
  if (userController.getToken()) {
    router.push(Routes.newConversation)
  } else {
    router.push('/auth')
  }
}

const showFirstLine = ref(false)
const showSecondLine = ref(false)
const showContent = ref(false)

// Trigger staggered animation when section becomes visible
watch(isVisible, (visible) => {
  if (visible) {
    setTimeout(() => {
      showFirstLine.value = true
    }, 100)
    setTimeout(() => {
      showSecondLine.value = true
    }, 400)
    setTimeout(() => {
      showContent.value = true
    }, 700)
  }
})
</script>

<template>
  <section ref="elementRef" class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background gradient glow -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-purple-600/30 to-indigo-600/20 rounded-full blur-[150px] animate-pulse-slow"
      />
    </div>

    <!-- Grid overlay -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"
    />

    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <!-- Main slogan -->
      <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
        <span
          class="block transition-all duration-700 ease-out"
          :class="showFirstLine ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          {{ t('landing.hero.slogan1') }}
        </span>
        <span
          class="block bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-700 ease-out"
          :class="showSecondLine ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        >
          {{ t('landing.hero.slogan2') }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p
        class="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 transition-all duration-700 ease-out"
        :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        {{ t('landing.hero.description') }}
      </p>

      <!-- CTA -->
      <div
        class="flex flex-col items-center gap-4 transition-all duration-700 ease-out"
        :class="showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <Button
          size="lg"
          class="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all duration-300 text-white dark:text-white"
          @click="handleCTA"
        >
          {{ t('landing.hero.cta') }}
        </Button>

      </div>
    </div>

    <!-- Scroll indicator (outside content div, relative to section) -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 delay-1000"
      :class="showContent ? 'opacity-100' : 'opacity-0'"
    >
      <div class="w-6 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-start justify-center p-2">
        <div class="w-1 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" />
      </div>
    </div>
  </section>
</template>
