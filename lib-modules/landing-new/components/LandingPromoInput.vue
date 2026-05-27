<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BadgePercent, CheckCircle2, Loader2, X } from 'lucide-vue-next'
import type { PromoCodeState } from '~/lib-modules/plans'

const props = defineProps<{
  state: PromoCodeState
  /** Whether the form is expanded. Used to optionally auto-open on initial promo from URL. */
  initiallyOpen?: boolean
}>()

const { state } = props

const isOpen = ref(!!props.initiallyOpen)
watch(() => props.initiallyOpen, (v) => {
  if (v) isOpen.value = true
})

const codeValue = computed({
  get: () => state.code.value,
  set: (v: string) => {
    state.code.value = v.toUpperCase()
    if (state.error.value) state.error.value = null
  },
})

const showApplyButton = computed(() => !state.isApplied.value)

function handleApply() {
  if (state.isLoading.value) return
  state.apply()
}

function handleReset() {
  state.clear()
}

function onEnter(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  handleApply()
}

const statusLine = computed(() => {
  if (state.error.value) return { tone: 'error' as const, text: state.error.value }
  if (state.isApplied.value) {
    return state.hasAnyApplicable.value
      ? { tone: 'success' as const, text: `Промокод «${state.appliedCode.value}» применён` }
      : {
          tone: 'warn' as const,
          text: `Промокод «${state.appliedCode.value}» уже использован или не подходит к вашим тарифам`,
        }
  }
  return null
})
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      v-if="!isOpen"
      type="button"
      class="lnf-mono text-[11px] md:text-[12px] uppercase tracking-[0.15em] text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#d4683f] dark:hover:text-[#d4683f] transition-colors duration-200 inline-flex items-center gap-2"
      @click="isOpen = true"
    >
      <BadgePercent class="w-3.5 h-3.5" />
      <span>У меня есть промокод</span>
    </button>

    <div
      v-else
      class="w-full max-w-[460px] flex flex-col gap-3"
    >
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="codeValue"
          type="text"
          placeholder="Введите промокод"
          :disabled="state.isLoading.value || state.isApplied.value"
          autocomplete="off"
          spellcheck="false"
          class="lnf-body flex-1 px-4 py-3 bg-transparent border border-[#0a0a0a]/25 dark:border-[#ede8de]/30 text-[#0a0a0a] dark:text-[#ede8de] uppercase tracking-wide placeholder:normal-case placeholder:text-[#8a8a8a] dark:placeholder:text-[#5a5550] placeholder:tracking-normal focus:outline-none focus:border-[#d4683f] disabled:opacity-60"
          @keydown="onEnter"
        />

        <button
          v-if="showApplyButton"
          type="button"
          :disabled="!state.code.value.trim() || state.isLoading.value"
          class="lnf-body inline-flex items-center justify-center gap-2 font-medium px-6 py-3 bg-[#d4683f] text-[#0a0a0a] hover:bg-[#b9542d] transition-colors duration-200 disabled:bg-[#e5e5e5] dark:disabled:bg-[#3a3530] disabled:text-[#8a8a8a] dark:disabled:text-[#5a5550] disabled:cursor-not-allowed"
          @click="handleApply"
        >
          <Loader2 v-if="state.isLoading.value" class="w-4 h-4 animate-spin" />
          <span v-else>Применить</span>
        </button>

        <button
          v-else
          type="button"
          class="lnf-body inline-flex items-center justify-center gap-2 font-medium px-6 py-3 border border-[#0a0a0a]/25 dark:border-[#ede8de]/30 text-[#0a0a0a] dark:text-[#ede8de] hover:bg-[#0a0a0a]/5 dark:hover:bg-[#ede8de]/10 transition-colors duration-200"
          @click="handleReset"
        >
          <X class="w-4 h-4" />
          <span>Сбросить</span>
        </button>
      </div>

      <div
        v-if="statusLine"
        :class="[
          'lnf-body text-[13px] leading-snug flex items-start gap-2',
          statusLine.tone === 'error' && 'text-[#c2410c]',
          statusLine.tone === 'success' && 'text-[#15803d] dark:text-[#4ade80]',
          statusLine.tone === 'warn' && 'text-[#b45309] dark:text-[#fbbf24]',
        ]"
      >
        <CheckCircle2 v-if="statusLine.tone === 'success'" class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{{ statusLine.text }}</span>
      </div>
    </div>
  </div>
</template>
