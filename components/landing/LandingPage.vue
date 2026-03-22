<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingPromoVideo from '~/components/landing/LandingPromoVideo.vue'
import LandingFeature from '~/components/landing/LandingFeature.vue'
import TimeCalculator from '~/components/landing/TimeCalculator.vue'
import LandingPricing from '~/components/landing/LandingPricing.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'
import LanguageSelector from '~/components/atoms/LanguageSelector.vue'

const {t} = useI18n()
</script>

<template>
  <div
      class="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-y-auto overflow-x-hidden h-screen">
    <!-- Header -->
    <header
        class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="flex items-center justify-between h-16">
          <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Writelo
          </span>

          <!-- Desktop nav -->
          <nav class="hidden md:flex items-center gap-8">
            <a
              href="#features"
              class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {{ t('landing.nav.features') }}
            </a>
            <a
              href="#pricing"
              class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {{ t('landing.nav.pricing') }}
            </a>
            <a
              href="#contacts"
              class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {{ t('landing.nav.contacts') }}
            </a>
          </nav>

          <div class="flex items-center gap-4">
            <LanguageSelector/>
          </div>
        </div>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <LandingHero/>

      <!-- Promo Video -->
      <LandingPromoVideo/>

      <!-- Feature: Clients -->
      <LandingFeature
          id="features"
          :title="t('landing.features.clients.title')"
          :description="t('landing.features.clients.description')"
          video-url="/landing/clients.mp4"
          direction="left"
          feature-id="clients"
      />

      <!-- Feature: Content -->
      <LandingFeature
          :title="t('landing.features.content.title')"
          :description="t('landing.features.content.description')"
          video-url="/landing/content-plan.mp4"
          direction="right"
          feature-id="content"
      />

      <!-- Feature: Prompt -->
      <LandingFeature
          :title="t('landing.features.prompt.title')"
          :description="t('landing.features.prompt.description')"
          direction="left"
          video-url="/landing/prompt-improver.mp4"
          feature-id="prompt"
      />

      <!-- Feature: Trends -->
      <LandingFeature
          :title="t('landing.features.trends.title')"
          :description="t('landing.features.trends.description')"
          direction="left"
          video-url="/landing/trends.mp4"
          feature-id="trends"
      />

      <!-- Feature: Images -->
      <LandingFeature
          :title="t('landing.features.images.title')"
          :description="t('landing.features.images.description')"
          video-url="/landing/image-generator.mp4"
          direction="right"
          feature-id="images"
      />

      <!-- Calculator -->
      <TimeCalculator/>

      <!-- Pricing -->
      <LandingPricing id="pricing"/>
    </main>

    <!-- Footer -->
    <LandingFooter/>
  </div>
</template>
