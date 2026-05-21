<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

interface FaqItem {
  q: string
  a: string
}

const { t, tm, rt } = useI18n()
const { elementRef, isVisible } = useScrollReveal()

const items = computed<FaqItem[]>(() => {
  const raw = tm('landingNew.faq.items') as FaqItem[]
  return raw.map((item) => ({
    q: typeof item.q === 'string' ? item.q : rt(item.q as never),
    a: typeof item.a === 'string' ? item.a : rt(item.a as never),
  }))
})

const openIndex = ref<number | null>(0)
function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section
    id="faq"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader
        :label="t('landingNew.faq.label')"
        :title="t('landingNew.faq.title')"
      />
      <div class="max-w-[860px] border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="border-b border-[#0a0a0a]/15 dark:border-[#ede8de]/15"
        >
          <button
            type="button"
            class="w-full flex items-start gap-5 md:gap-7 py-6 md:py-7 text-left group"
            :aria-expanded="openIndex === i"
            :aria-controls="`faq-panel-${i}`"
            @click="toggle(i)"
          >
            <span class="lnf-mono text-[11px] tracking-[0.1em] text-[#8a8a8a] dark:text-[#5a5550] mt-2 shrink-0 w-6 md:w-7">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span
              class="flex-1 lnf-display font-medium text-[18px] md:text-[22px] tracking-[-0.015em] leading-[1.3] transition-colors"
              :class="openIndex === i
                ? 'text-[#d4683f]'
                : 'text-[#0a0a0a] dark:text-[#ede8de] group-hover:text-[#d4683f]'"
            >
              {{ item.q }}
            </span>
            <span
              class="shrink-0 mt-2 md:mt-2.5 relative w-4 h-4 transition-colors"
              :class="openIndex === i
                ? 'text-[#d4683f]'
                : 'text-[#5f5f5f] dark:text-[#a8a094] group-hover:text-[#d4683f]'"
              aria-hidden="true"
            >
              <span class="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-current" />
              <span
                class="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out"
                :class="openIndex === i ? 'scale-y-0' : 'scale-y-100'"
              />
            </span>
          </button>
          <div
            :id="`faq-panel-${i}`"
            class="grid transition-[grid-template-rows] duration-300 ease-out"
            :class="openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <p class="pl-11 md:pl-14 pr-6 md:pr-10 pb-7 md:pb-8 max-w-[68ch] lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094]">
                {{ item.a }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
