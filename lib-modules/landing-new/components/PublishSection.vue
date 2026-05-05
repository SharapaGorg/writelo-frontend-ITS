<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollReveal } from '../composables/useScrollReveal'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    ref="elementRef"
    class="px-6 md:px-12 py-16 md:py-24 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[900px] mx-auto text-center">
      <div class="lnf-mono font-bold text-[11px] tracking-[0.1em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-6">
        {{ t('landingNew.publish.label') }}
      </div>
      <h3 class="lnf-display font-medium text-[26px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] mb-3">
        {{ t('landingNew.publish.line1') }}
      </h3>
      <h3 class="lnf-display font-medium text-[26px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-[#8a8a8a] dark:text-[#5a5550]">
        {{ t('landingNew.publish.line2') }}
      </h3>
    </div>
  </section>
</template>
