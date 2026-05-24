<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScrollReveal } from '../composables/useScrollReveal'
import SectionTryCta from './SectionTryCta.vue'
import VideoAnalyzerShowcase from './VideoAnalyzerShowcase.vue'
import MobilePhoneMockup from './MobilePhoneMockup.vue'

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

      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-12 md:gap-16 items-start">
        <div class="space-y-7 md:space-y-8 max-w-[60ch]">
          <p class="lnf-body text-[15px] md:text-[17px] leading-[1.7] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.reels.body1Pre') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.reels.body1Accent') }}</span>{{ t('landingNew.reels.body1Post') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[17px] leading-[1.7] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.reels.body2Pre') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.reels.body2Accent1') }}</span>{{ t('landingNew.reels.body2Mid1') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.reels.body2Accent2') }}</span>{{ t('landingNew.reels.body2Mid2') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.reels.body2Accent3') }}</span>{{ t('landingNew.reels.body2Post') }}
          </p>
          <p class="lnf-display font-medium text-[22px] md:text-[28px] leading-[1.25] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15 pt-7 md:pt-8 mt-2">
            {{ t('landingNew.reels.body3Pre') }}<span class="italic text-[#d4683f]">{{ t('landingNew.reels.body3Accent1') }}</span>{{ t('landingNew.reels.body3Mid') }}<span class="italic text-[#d4683f]">{{ t('landingNew.reels.body3Accent2') }}</span>
          </p>
          <div class="hidden md:block pt-2">
            <SectionTryCta section="reels" align="start" to="/app/video-analyzer" />
          </div>
        </div>

        <div class="hidden md:block rounded-md overflow-hidden border border-[#0a0a0a]/12 dark:border-[#ede8de]/15 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] bg-[#f7f7f7] dark:bg-[#0e0e0e]">
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
          <div class="h-[640px]">
            <VideoAnalyzerShowcase />
          </div>
        </div>

        <div class="md:hidden">
          <MobilePhoneMockup active="video-analyzer" source="reels">
            <div class="h-[560px] bg-[#f7f7f7] dark:bg-[#0e0e0e]">
              <VideoAnalyzerShowcase />
            </div>
          </MobilePhoneMockup>
        </div>
      </div>

      <div class="md:hidden">
        <SectionTryCta section="reels" to="/app/video-analyzer" />
      </div>
    </div>
  </section>
</template>
