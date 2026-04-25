<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowRight } from 'lucide-vue-next'
import PrimaryButton from './PrimaryButton.vue'
import { Routes } from '~/scripts/shared/types'

const { t } = useI18n()
const router = useRouter()
const nuxt = useNuxtApp()

function ctaClick() {
  ;(nuxt as any).$trackGoal?.('landing_new_cta_click', { button: 'hero' })
  router.push(Routes.app)
}
</script>

<template>
  <section class="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-28 pb-20 overflow-hidden">
    <div class="lnf-mono font-bold text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#5a5550] mb-10 md:mb-14 lnu-fade-up" style="animation-delay:100ms">
      {{ t('landingNew.hero.label') }}
    </div>

    <h1 class="lnf-display font-extrabold text-center leading-[0.98] tracking-[-0.04em] text-[#ede8de] text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px]">
      <span class="block lnu-fade-up" style="animation-delay:200ms">{{ t('landingNew.hero.line1') }}</span>
      <span class="block italic font-medium text-[#d4683f] lnu-fade-up" style="animation-delay:350ms">{{ t('landingNew.hero.line2') }}</span>
      <span class="block lnu-fade-up" style="animation-delay:500ms">{{ t('landingNew.hero.line3') }}</span>
    </h1>

    <p class="lnf-body text-[15px] md:text-[17px] leading-[1.55] text-[#a8a094] text-center max-w-[60ch] mt-10 md:mt-12 lnu-fade-up" style="animation-delay:1000ms">
      {{ t('landingNew.hero.sub') }}
    </p>

    <div class="mt-10 md:mt-12 lnu-fade-up" style="animation-delay:1150ms">
      <PrimaryButton @click="ctaClick">
        {{ t('landingNew.hero.cta') }}
        <ArrowRight class="w-4 h-4" />
      </PrimaryButton>
    </div>

    <div class="mt-16 md:mt-24 flex flex-col items-center gap-3 lnu-fade-up" style="animation-delay:1400ms">
      <span class="lnf-mono font-bold text-[10px] tracking-[0.15em] uppercase text-[#5a5550]">
        ↓ {{ t('landingNew.hero.scrollHint') }}
      </span>
      <ArrowDown class="w-4 h-4 text-[#5a5550] lnu-bounce-slow" />
    </div>
  </section>
</template>
