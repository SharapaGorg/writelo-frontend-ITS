<script setup lang="ts">
import { computed } from 'vue'
import { BadgePercent, CheckCircle2, Loader2, X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib-modules/utils'
import type { PromoCodeState } from '../composables/usePromoCode'

const props = defineProps<{
  state: PromoCodeState
}>()

const { state } = props

const inputDisabled = computed(() => state.isLoading.value || state.isApplied.value)
const showApplyButton = computed(() => !state.isApplied.value)
const codeValue = computed({
  get: () => state.code.value,
  set: (v: string) => {
    state.code.value = v.toUpperCase()
    if (state.error.value) state.error.value = null
  },
})

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
  <div class="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-3">
    <div class="flex items-center gap-2 text-sm font-medium">
      <BadgePercent class="h-4 w-4 text-brand" />
      <span>Промокод</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-2">
      <Input
        v-model="codeValue"
        placeholder="Введите промокод"
        :disabled="inputDisabled"
        class="flex-1 sm:max-w-xs uppercase tracking-wide"
        autocomplete="off"
        spellcheck="false"
        @keydown="onEnter"
      />

      <Button
        v-if="showApplyButton"
        :disabled="!state.code.value.trim() || state.isLoading.value"
        class="sm:w-32"
        @click="handleApply"
      >
        <Loader2 v-if="state.isLoading.value" class="h-4 w-4 animate-spin" />
        <span v-else>Применить</span>
      </Button>

      <Button
        v-else
        variant="outline"
        class="sm:w-32"
        @click="handleReset"
      >
        <X class="h-4 w-4" />
        <span>Сбросить</span>
      </Button>
    </div>

    <div
      v-if="statusLine"
      :class="cn(
        'flex items-start gap-2 text-sm leading-snug',
        statusLine.tone === 'error' && 'text-destructive',
        statusLine.tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
        statusLine.tone === 'warn' && 'text-amber-600 dark:text-amber-400',
      )"
    >
      <CheckCircle2 v-if="statusLine.tone === 'success'" class="h-4 w-4 mt-0.5 shrink-0" />
      <span>{{ statusLine.text }}</span>
    </div>
  </div>
</template>
