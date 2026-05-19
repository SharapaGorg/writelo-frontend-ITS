<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from 'lucide-vue-next'
import SectionHeader from './SectionHeader.vue'
import SectionTryCta from './SectionTryCta.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()

const trends = [
  { tag: '#осенниеобразы', reach: '1.2M', delta: '+34%' },
  { tag: '#нюдмакияж', reach: '890K', delta: '+22%' },
  { tag: '#капсулагардероб', reach: '640K', delta: '+18%' },
  { tag: '#утреннийритуал', reach: '420K', delta: '+12%' },
  { tag: '#стилисткиев', reach: '210K', delta: '+9%' },
]
</script>

<template>
  <section
    id="trends"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader :label="t('landingNew.trends.label')">
        <template #title>
          {{ t('landingNew.trends.titlePre') }}
          <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.trends.titleAccent') }}</span>
          {{ t('landingNew.trends.titlePost') }}
        </template>
      </SectionHeader>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div class="space-y-6 max-w-[60ch]">
          <p class="lnf-body text-[16px] md:text-[17px] leading-[1.6] text-[#0a0a0a] dark:text-[#ede8de]">
            {{ t('landingNew.trends.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.trends.body2') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.trends.body3') }}
          </p>
          <div class="inline-flex items-center gap-3 border border-[#d4683f]/40 bg-[#d4683f]/5 px-4 py-2.5 mt-2">
            <span class="relative flex h-2 w-2 shrink-0">
              <span class="absolute inline-flex h-full w-full rounded-full bg-[#d4683f] opacity-75 animate-ping" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-[#d4683f]" />
            </span>
            <span class="lnf-mono text-[10px] uppercase tracking-[0.15em] text-[#d4683f]">
              {{ t('landingNew.trends.liveLabel') }}
            </span>
            <span class="lnf-mono text-[11px] text-[#5f5f5f] dark:text-[#a8a094] leading-[1.4]">
              {{ t('landingNew.trends.liveNote') }}
            </span>
          </div>
          <SectionTryCta section="trends" align="start" to="/app/trends" />
        </div>

        <div class="border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 p-7 md:p-10 bg-[#fafafa] dark:bg-[#111110]">
          <div class="lnf-mono text-[10px] uppercase tracking-[0.15em] text-[#8a8a8a] dark:text-[#5a5550] mb-7">
            {{ t('landingNew.trends.previewLabel') }}
          </div>
          <div>
            <div
              v-for="(item, i) in trends"
              :key="item.tag"
              class="flex items-baseline justify-between gap-4 py-4 border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10 last:border-0"
              :style="{ paddingLeft: i % 2 ? '14px' : '0' }"
            >
              <div class="flex items-baseline gap-3 min-w-0">
                <span class="lnf-display font-medium text-[18px] md:text-[22px] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] truncate">
                  {{ item.tag }}
                </span>
                <ArrowUpRight class="w-4 h-4 shrink-0 text-[#d4683f]" />
              </div>
              <div class="flex items-baseline gap-3 shrink-0">
                <span class="lnf-mono text-[11px] md:text-[12px] text-[#5f5f5f] dark:text-[#a8a094]">{{ item.reach }}</span>
                <span class="lnf-mono text-[11px] md:text-[12px] text-[#d4683f]">{{ item.delta }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
