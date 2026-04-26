<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
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
      <SectionHeader :label="t('landingNew.editor.label')">
        <template #title>
          {{ t('landingNew.editor.titleLine1') }}<br>
          {{ t('landingNew.editor.titleLine2') }}
        </template>
      </SectionHeader>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div class="space-y-6 max-w-[60ch]">
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#a8a094]">
            {{ t('landingNew.editor.body1') }}
          </p>
          <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#a8a094]">
            {{ t('landingNew.editor.body2') }}
          </p>
        </div>

        <div class="border border-[#ede8de]/20 overflow-hidden">
          <div class="bg-[#161616] px-4 py-3 flex items-center gap-4 border-b border-[#ede8de]/15">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#5a5550]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#5a5550]" />
              <div class="w-2.5 h-2.5 rounded-full bg-[#5a5550]" />
            </div>
            <div class="lnf-mono text-[10px] text-[#5a5550]">writelo.app/editor</div>
          </div>
          <div class="aspect-[4/3] bg-[#111110] flex items-center justify-center text-[#5a5550] text-[12px] lnf-mono uppercase tracking-[0.15em]">
            {{ t('landingNew.editor.placeholder') }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
