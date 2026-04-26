<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight } from 'lucide-vue-next'
import PrimaryButton from './PrimaryButton.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { Routes } from '~/scripts/shared/types'

const { t } = useI18n()
const router = useRouter()
const nuxt = useNuxtApp()
const { elementRef, isVisible } = useScrollReveal()

function ctaClick() {
  ;(nuxt as any).$trackGoal?.('landing_new_cta_click', { button: 'final' })
  router.push(Routes.app)
}
</script>

<template>
  <section
    ref="elementRef"
    class="px-6 md:px-12 py-32 md:py-40 min-h-[80vh] flex flex-col items-center justify-center transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1100px] text-center">
      <h2 class="lnf-display font-extrabold text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] leading-[1.0] tracking-[-0.04em] text-[#ede8de]">
        {{ t('landingNew.finalCta.titlePart1') }}
        <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.finalCta.titleAccent') }}</span>
        <br>
        {{ t('landingNew.finalCta.titlePart2') }}
        <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.finalCta.titleAccent2') }}</span>
      </h2>
      <p class="lnf-body text-[15px] md:text-[17px] text-[#a8a094] mt-8 max-w-[60ch] mx-auto">
        {{ t('landingNew.finalCta.sub') }}
      </p>
      <div class="mt-12">
        <PrimaryButton @click="ctaClick">
          {{ t('landingNew.finalCta.cta') }}
          <ArrowRight class="w-4 h-4" />
        </PrimaryButton>
      </div>
    </div>
  </section>
</template>
