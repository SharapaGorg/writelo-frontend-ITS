<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import SectionTryCta from './SectionTryCta.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { ContentCalendarPage } from '~/lib-modules/content-calendar'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    id="calendar"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1400px] mx-auto">
      <SectionHeader :label="t('landingNew.calendar.label')">
        <template #title>
          {{ t('landingNew.calendar.titlePre') }}
          <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.calendar.titleAccent') }}</span>
          {{ t('landingNew.calendar.titlePost') }}
        </template>
      </SectionHeader>

      <p class="lnf-body text-[16px] md:text-[17px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094] max-w-[60ch] mb-12 md:mb-16">
        {{ t('landingNew.calendar.sub') }}
      </p>

      <div class="hidden md:block border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        <div class="bg-[#f5f5f5] dark:bg-[#161616] px-4 py-3 flex items-center gap-4 border-b border-[#0a0a0a]/12 dark:border-[#ede8de]/15">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#d4683f]/70" />
            <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
            <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
          </div>
          <div class="flex-1 flex justify-center">
            <div class="lnf-mono text-[12px] text-[#5f5f5f] dark:text-[#a8a094] bg-white dark:bg-[#0a0a0a] px-4 py-1.5 border border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
              writelo.app/calendar
            </div>
          </div>
          <div class="w-[52px]" />
        </div>
        <div class="bg-white dark:bg-[#0a0a0a]">
          <ContentCalendarPage :showcase-mode="true" />
        </div>
      </div>

      <div class="md:hidden border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 p-8 text-center">
        <div class="lnf-mono text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a] dark:text-[#5a5550] mb-4">
          {{ t('landingNew.calendar.mobileLabel') }}
        </div>
        <p class="lnf-body text-[15px] text-[#5f5f5f] dark:text-[#a8a094] leading-[1.55]">
          {{ t('landingNew.calendar.mobileNote') }}
        </p>
      </div>
      <SectionTryCta section="calendar" to="/app/calendar" />
    </div>
  </section>
</template>
