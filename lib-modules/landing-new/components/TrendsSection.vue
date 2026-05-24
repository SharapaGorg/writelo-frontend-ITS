<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import SectionTryCta from './SectionTryCta.vue'
import MobilePhoneMockup from './MobilePhoneMockup.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { ReelsFilters, ReelCard, useReelsResearchStore } from '~/lib-modules/reels-research'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()
const store = useReelsResearchStore()
</script>

<template>
  <section
    id="trends"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1400px] mx-auto">
      <SectionHeader :label="t('landingNew.trends.label')">
        <template #title>
          {{ t('landingNew.trends.titlePre') }}
          <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.trends.titleAccent') }}</span>
          {{ t('landingNew.trends.titlePost') }}
        </template>
      </SectionHeader>

      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12 md:gap-14 items-start">
        <div class="space-y-6 max-w-[60ch]">
          <p class="lnf-body text-[16px] md:text-[17px] leading-[1.6] text-[#0a0a0a] dark:text-[#ede8de]">
            {{ t('landingNew.trends.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.trends.body2Pre') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.trends.body2Accent') }}</span>{{ t('landingNew.trends.body2Post') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.trends.body3Accent1') }}</span>{{ t('landingNew.trends.body3Mid') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.trends.body3Accent2') }}</span>{{ t('landingNew.trends.body3Post') }}
          </p>
          <div class="inline-flex items-center border border-[#d4683f]/50 bg-[#d4683f]/10 px-4 py-2.5 mt-2">
            <span class="lnf-mono font-bold text-[12px] md:text-[13px] uppercase tracking-[0.12em] text-[#d4683f]">
              {{ t('landingNew.trends.humansBadge') }}
            </span>
          </div>
          <div class="hidden md:block">
            <SectionTryCta section="trends" align="start" to="/app/trends" />
          </div>
        </div>

        <div>
          <!-- Desktop: Mac browser mockup -->
          <div class="hidden md:block rounded-md overflow-hidden border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] bg-background">
            <div class="bg-[#f5f5f5] dark:bg-[#161616] px-4 py-3 flex items-center gap-4 border-b border-[#0a0a0a]/12 dark:border-[#ede8de]/15">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#d4683f]/70" />
                <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
                <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
              </div>
              <div class="flex-1 flex justify-center">
                <div class="lnf-mono text-[12px] text-[#5f5f5f] dark:text-[#a8a094] bg-white dark:bg-[#0a0a0a] px-4 py-1.5 border border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
                  writelo.app/trends
                </div>
              </div>
              <div class="w-[52px]" />
            </div>
            <div class="h-[640px] flex flex-col bg-background">
              <div class="border-b border-border px-3 py-3 shrink-0">
                <ClientOnly>
                  <ReelsFilters />
                </ClientOnly>
              </div>
              <div class="flex-1 overflow-auto px-3 py-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <ClientOnly>
                  <div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                    <ReelCard v-for="reel in store.filteredReels" :key="reel.reelId" :reel="reel" />
                  </div>
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Mobile: phone mockup -->
          <div class="md:hidden">
            <MobilePhoneMockup active="trends" source="trends">
              <div class="h-[560px] flex flex-col bg-background">
                <div class="border-b border-border px-2.5 py-2.5 shrink-0">
                  <ClientOnly>
                    <ReelsFilters />
                  </ClientOnly>
                </div>
                <div class="flex-1 overflow-auto px-2.5 py-2.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  <ClientOnly>
                    <div class="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
                      <ReelCard v-for="reel in store.filteredReels" :key="`m-${reel.reelId}`" :reel="reel" />
                    </div>
                  </ClientOnly>
                </div>
              </div>
            </MobilePhoneMockup>
          </div>
        </div>
      </div>

      <div class="md:hidden">
        <SectionTryCta section="trends" to="/app/trends" />
      </div>
    </div>
  </section>
</template>
