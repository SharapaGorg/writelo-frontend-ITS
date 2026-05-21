<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import SectionTryCta from './SectionTryCta.vue'
import MobilePhoneMockup from './MobilePhoneMockup.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

// Async + ClientOnly: the inner component pulls content-editor → conversations
// → demo-mode. That chain has a circular import that breaks under SSR (the /app
// editor page sidesteps it by being ssr:false). Loading it client-side only
// keeps the landing page SSR-safe.
const EditorShowcaseInner = defineAsyncComponent(() =>
  import('./EditorShowcaseInner.vue')
)

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    id="editor"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1400px] mx-auto">
      <SectionHeader :label="t('landingNew.editor.label')">
        <template #title>
          {{ t('landingNew.editor.titleLine1') }}<br>
          {{ t('landingNew.editor.titleLine2') }}
        </template>
      </SectionHeader>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mb-12 md:mb-16">
        <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094] max-w-[60ch]">
          {{ t('landingNew.editor.body1Pre') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body1AccentBrand') }}</span>{{ t('landingNew.editor.body1Mid') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body1AccentTemplate') }}</span>{{ t('landingNew.editor.body1Post') }}
        </p>
        <p class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094] max-w-[60ch]">
          {{ t('landingNew.editor.body2Pre') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body2AccentType') }}</span>{{ t('landingNew.editor.body2Mid1') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body2AccentStatus') }}</span>{{ t('landingNew.editor.body2Mid2') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body2AccentCalendar') }}</span>{{ t('landingNew.editor.body2Mid3') }}<span class="italic font-medium text-[#d4683f]">{{ t('landingNew.editor.body2AccentTeam') }}</span>{{ t('landingNew.editor.body2Post') }}
        </p>
      </div>

      <div class="hidden md:block border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
        <div class="bg-[#f5f5f5] dark:bg-[#161616] px-4 py-3 flex items-center gap-4 border-b border-[#0a0a0a]/12 dark:border-[#ede8de]/15">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-[#d4683f]/70" />
            <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
            <div class="w-3 h-3 rounded-full bg-[#c5c5c5] dark:bg-[#5a5550]" />
          </div>
          <div class="flex-1 flex justify-center">
            <div class="lnf-mono text-[12px] text-[#5f5f5f] dark:text-[#a8a094] bg-white dark:bg-[#0a0a0a] px-4 py-1.5 border border-[#0a0a0a]/10 dark:border-[#ede8de]/10">
              writelo.app/editor
            </div>
          </div>
          <div class="w-[52px]" />
        </div>
        <div>
          <ClientOnly>
            <EditorShowcaseInner />
            <template #fallback>
              <div class="h-[700px] flex items-center justify-center text-[#8a8a8a] dark:text-[#5a5550] lnf-mono text-[11px] uppercase tracking-[0.15em]">
                Загружаем редактор...
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="md:hidden -mx-5">
        <MobilePhoneMockup source="editor" wide>
          <ClientOnly>
            <EditorShowcaseInner />
            <template #fallback>
              <div class="h-[700px] flex items-center justify-center text-[#8a8a8a] dark:text-[#5a5550] lnf-mono text-[11px] uppercase tracking-[0.15em]">
                Загружаем редактор...
              </div>
            </template>
          </ClientOnly>
        </MobilePhoneMockup>
      </div>
      <SectionTryCta section="editor" to="/app/editor" />
    </div>
  </section>
</template>
