<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollAnimation } from '~/composables/useScrollAnimation'
import { ContentCalendarPage } from '~/lib-modules/content-calendar'

const { t } = useI18n()

const { elementRef, isVisible } = useScrollAnimation(0.1)
</script>

<template>
  <section
    ref="elementRef"
    class="hidden md:block py-16 px-4"
  >
    <div
      class="max-w-7xl mx-auto transition-all duration-700 ease-out"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <!-- Title and description -->
      <div class="text-center mb-8">
        <h2 class="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
          {{ t('landing.calendar.title') }}
        </h2>
        <p class="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          {{ t('landing.calendar.description') }}
        </p>
      </div>

      <!-- Browser mockup -->
      <div class="rounded-xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-zinc-200 dark:border-zinc-800">
        <!-- Browser top bar -->
        <div class="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-700">
          <!-- Traffic lights -->
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500" />
            <div class="w-3 h-3 rounded-full bg-yellow-500" />
            <div class="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <!-- Address bar -->
          <div class="flex-1 flex justify-center">
            <div class="bg-white dark:bg-zinc-900 rounded-md px-4 py-1.5 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              writelo.app/ideas
            </div>
          </div>
          <!-- Spacer for symmetry -->
          <div class="w-[52px]" />
        </div>

        <!-- Calendar content -->
        <div class="bg-zinc-950">
          <ContentCalendarPage :showcase-mode="true" />
        </div>
      </div>
    </div>
  </section>
</template>
