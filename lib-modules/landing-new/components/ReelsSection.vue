<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Play } from 'lucide-vue-next'
import { useScrollReveal } from '../composables/useScrollReveal'

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
      <div class="mb-12 md:mb-16">
        <div class="lnf-mono font-bold text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#5a5550] mb-5 md:mb-6">
          {{ t('landingNew.reels.label') }}
        </div>
        <div class="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <h2 class="lnf-display font-bold text-[36px] md:text-[56px] lg:text-[64px] leading-[1.05] tracking-[-0.03em] text-[#ede8de]">
            {{ t('landingNew.reels.title') }}
          </h2>
          <span class="self-start lnf-mono text-[11px] uppercase tracking-[0.15em] text-[#d4683f] border border-[#d4683f] px-3 py-1.5 mb-2">
            {{ t('landingNew.reels.badge') }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div class="space-y-5 max-w-[60ch]">
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#a8a094]">
            {{ t('landingNew.reels.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#a8a094]">
            {{ t('landingNew.reels.body2') }}
          </p>
        </div>

        <div class="relative h-[300px] md:h-[400px] flex items-center justify-center">
          <div class="absolute w-[160px] md:w-[200px] aspect-[9/16] border border-[#ede8de]/15 bg-[#111110] -rotate-[8deg] -translate-x-[60%] md:-translate-x-[80%] p-4 flex flex-col justify-between">
            <Play class="w-5 h-5 text-[#5a5550]" />
            <div>
              <div class="lnf-mono text-[10px] text-[#5a5550]">@brand_one</div>
              <div class="lnf-mono text-[12px] text-[#a8a094]">2.4M views</div>
            </div>
          </div>
          <div class="absolute w-[180px] md:w-[220px] aspect-[9/16] border border-[#ede8de]/25 bg-[#161616] rotate-[2deg] z-10 p-4 flex flex-col justify-between shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <Play class="w-5 h-5 text-[#a8a094]" />
            <div>
              <div class="lnf-mono text-[10px] text-[#5a5550]">@niche_account</div>
              <div class="lnf-mono text-[12px] text-[#ede8de]">5.1M views</div>
            </div>
          </div>
          <div class="absolute w-[160px] md:w-[200px] aspect-[9/16] border border-[#ede8de]/15 bg-[#111110] rotate-[10deg] translate-x-[60%] md:translate-x-[80%] p-4 flex flex-col justify-between">
            <Play class="w-5 h-5 text-[#5a5550]" />
            <div>
              <div class="lnf-mono text-[10px] text-[#5a5550]">@competitor</div>
              <div class="lnf-mono text-[12px] text-[#a8a094]">980K views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
