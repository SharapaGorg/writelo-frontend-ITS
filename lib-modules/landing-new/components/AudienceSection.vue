<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()

const cards = computed(() => [
  {
    idx: '01',
    tag: t('landingNew.audience.cards.freelancer.tag'),
    title: t('landingNew.audience.cards.freelancer.title'),
    body: t('landingNew.audience.cards.freelancer.body'),
  },
  {
    idx: '02',
    tag: t('landingNew.audience.cards.team.tag'),
    title: t('landingNew.audience.cards.team.title'),
    body: t('landingNew.audience.cards.team.body'),
  },
  {
    idx: '03',
    tag: t('landingNew.audience.cards.agency.tag'),
    title: t('landingNew.audience.cards.agency.title'),
    body: t('landingNew.audience.cards.agency.body'),
  },
])
</script>

<template>
  <section
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader
        :label="t('landingNew.audience.label')"
        :title="t('landingNew.audience.title')"
      />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div
          v-for="card in cards"
          :key="card.idx"
          class="border border-[#0a0a0a]/20 dark:border-[#ede8de]/30 p-8 md:p-10 flex flex-col"
        >
          <div class="lnf-mono font-bold text-[11px] tracking-[0.1em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-6">
            {{ card.idx }} — {{ card.tag }}
          </div>
          <h3 class="lnf-display font-medium text-[22px] md:text-[26px] tracking-[-0.02em] leading-[1.1] text-[#0a0a0a] dark:text-[#ede8de] mb-4">
            {{ card.title }}
          </h3>
          <p class="lnf-body text-[15px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ card.body }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
