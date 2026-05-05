<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollReveal } from '../composables/useScrollReveal'
import VideoAnalyzerShowcase from './VideoAnalyzerShowcase.vue'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <div class="mb-10 md:mb-14">
        <div class="lnf-mono font-bold text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-5 md:mb-6">
          {{ t('landingNew.reels.label') }}
        </div>
        <h2 class="lnf-display font-bold text-[36px] md:text-[56px] lg:text-[64px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] dark:text-[#ede8de]">
          {{ t('landingNew.reels.title') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10 md:gap-14 items-start">
        <div class="space-y-5 max-w-[60ch]">
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.reels.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.reels.body2') }}
          </p>
        </div>

        <div class="rounded-md overflow-hidden border border-[#0a0a0a]/12 dark:border-[#ede8de]/15 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] bg-[#f7f7f7] dark:bg-[#0e0e0e]">
          <div class="bg-[#f5f5f5] dark:bg-[#161616] px-3 py-2 flex items-center gap-3 border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#3a3a3a]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#3a3a3a]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#d4d4d4] dark:bg-[#3a3a3a]" />
            </div>
            <div class="flex-1 flex justify-center">
              <div class="lnf-mono text-[10px] tracking-[0.05em] text-[#8a8a8a] dark:text-[#5a5550] px-3 py-0.5 rounded-sm bg-white dark:bg-[#0a0a0a] border border-[#0a0a0a]/5 dark:border-[#ede8de]/5">
                writelo.app/video-analyzer
              </div>
            </div>
            <div class="w-[44px]" />
          </div>
          <div class="h-[560px] md:h-[640px]">
            <VideoAnalyzerShowcase />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
