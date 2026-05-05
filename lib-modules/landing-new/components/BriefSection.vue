<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { BrandBriefSection } from '~/lib-modules/workspaces'

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()

const draft = reactive({
  industry: '',
  businessDescription: '',
  targetAudience: '',
  toneOfVoice: '',
  stopWords: '',
  examplePosts: '',
})
</script>

<template>
  <section
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader
        :label="t('landingNew.brief.label')"
        :title="t('landingNew.brief.title')"
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div class="space-y-6 max-w-[60ch]">
          <p class="lnf-body text-[16px] md:text-[17px] leading-[1.6] text-[#0a0a0a] dark:text-[#ede8de]">
            {{ t('landingNew.brief.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.brief.body2Pre') }}
            <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.brief.body2Accent1') }}</span>
            {{ t('landingNew.brief.body2Mid') }}
            <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.brief.body2Accent2') }}</span>
            {{ t('landingNew.brief.body2Post') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094]">
            {{ t('landingNew.brief.body3') }}
          </p>
          <p class="lnf-mono text-[11px] uppercase tracking-[0.15em] text-[#8a8a8a] dark:text-[#5a5550] pt-4">
            {{ t('landingNew.brief.aside') }}
          </p>
        </div>

        <div class="border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
          <div class="bg-[#f5f5f5] dark:bg-[#161616] px-4 py-3 flex items-center gap-4 border-b border-[#0a0a0a]/12 dark:border-[#ede8de]/15">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
            </div>
            <div class="lnf-mono text-[10px] text-[#8a8a8a] dark:text-[#5a5550]">writelo.app/brand/brief</div>
          </div>
          <div class="bg-[#fafafa] dark:bg-[#111110] p-4 md:p-5">
            <BrandBriefSection
              id-prefix="landing-brief"
              :draft="draft"
              :can-edit="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
