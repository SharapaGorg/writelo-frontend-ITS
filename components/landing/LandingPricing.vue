<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {useScrollAnimation} from '~/composables/useScrollAnimation'
import {Button} from '~/components/ui/button'
import {Routes} from '~/scripts/shared/types'

const {t} = useI18n()
const router = useRouter()
const userController = useUserController()
const {elementRef, isVisible} = useScrollAnimation(0.2)

function handleCTA() {
  if (userController.getToken()) {
    router.push(Routes.newConversation)
  } else {
    router.push('/auth')
  }
}

// Countdown to April 1st, 2026
const targetDate = new Date('2026-04-01T00:00:00')

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

function updateCountdown() {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <section
      ref="elementRef"
      class="min-h-screen flex items-center justify-center px-4 py-20"
  >
    <div
        class="max-w-5xl mx-auto transition-all duration-700 ease-out"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
    >
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-zinc-50">
        {{ t('landing.pricing.title') }}
      </h2>

      <div class="grid md:grid-cols-2 gap-8 items-stretch">
        <!-- Free -->
        <div class="p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{{ t('landing.pricing.free.name') }}</h3>
            <span class="text-3xl font-bold text-transparent select-none">0₽</span>
          </div>
          <p class="text-zinc-500 dark:text-zinc-400 mb-6">{{ t('landing.pricing.free.description') }}</p>

          <ul class="space-y-3 mb-8 flex-1">
            <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
              <span class="text-purple-500 dark:text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.clients') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
              <span class="text-purple-500 dark:text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.search') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
              <span class="text-purple-500 dark:text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.promptImprover') }}
            </li>
            <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
              <span class="text-purple-500 dark:text-purple-400">✓</span>
              {{ t('landing.pricing.free.features.templates') }}
            </li>
          </ul>

          <Button
              variant="outline"
              class="w-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 mt-auto"
              @click="handleCTA"
          >
            {{ t('landing.pricing.free.cta') }}
          </Button>
        </div>

        <!-- Pro -->
        <div
            class="p-10 rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-transparent relative overflow-hidden flex flex-col">
          <!-- Glow -->
          <div class="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none"/>

          <!-- Discount ribbon -->
          <div
              class="absolute -right-[4.5rem] top-8 rotate-45 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold py-2 pl-16 pr-24 shadow-lg">
            -70%
          </div>

          <div class="relative flex flex-col flex-1">
            <div class="flex items-baseline justify-between mb-2">
              <h3 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{{ t('landing.pricing.pro.name') }}</h3>
              <div>
                <span class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{{ t('landing.pricing.pro.price') }}</span>
                <span class="text-zinc-500 dark:text-zinc-400">{{ t('landing.pricing.pro.period') }}</span>
              </div>
            </div>
            <p class="text-zinc-500 dark:text-zinc-400 mb-6">{{ t('landing.pricing.pro.description') }}</p>

            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.clients') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.search') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.promptImprover') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.templates') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.images') }}
              </li>
              <li class="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                <span class="text-purple-500 dark:text-purple-400">✓</span>
                {{ t('landing.pricing.pro.features.unlimited') }}
              </li>
            </ul>

            <Button
                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 mt-auto text-white dark:text-white"
                @click="handleCTA"
            >
              {{ t('landing.pricing.pro.cta') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Countdown timer -->
      <div class="mt-12 text-center">
        <p class="text-zinc-500 dark:text-zinc-400 mb-4">Спецпредложение действует:</p>
        <div class="flex justify-center gap-4">
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">{{ days }}</span>
            <span class="text-zinc-500 dark:text-zinc-400 text-sm">дн.</span>
          </div>
          <span class="text-4xl md:text-5xl font-bold text-zinc-300 dark:text-zinc-600">:</span>
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">{{ String(hours).padStart(2, '0') }}</span>
            <span class="text-zinc-500 dark:text-zinc-400 text-sm">час.</span>
          </div>
          <span class="text-4xl md:text-5xl font-bold text-zinc-300 dark:text-zinc-600">:</span>
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">{{ String(minutes).padStart(2, '0') }}</span>
            <span class="text-zinc-500 dark:text-zinc-400 text-sm">мин.</span>
          </div>
          <span class="text-4xl md:text-5xl font-bold text-zinc-300 dark:text-zinc-600">:</span>
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">{{ String(seconds).padStart(2, '0') }}</span>
            <span class="text-zinc-500 dark:text-zinc-400 text-sm">сек.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
