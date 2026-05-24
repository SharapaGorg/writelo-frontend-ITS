<script setup lang="ts">
import type { FeatureParamRow } from '../types'

defineProps<{
  rows: FeatureParamRow[]
}>()
</script>

<template>
  <div
    class="border border-[#0a0a0a]/15 dark:border-[#ede8de]/15 overflow-hidden bg-white dark:bg-[#0e0e0e]"
  >
    <div
      class="hidden md:grid grid-cols-[1fr_2fr] gap-6 px-6 py-3 bg-[#f5f5f5] dark:bg-[#161616] border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10 lnf-mono text-[11px] tracking-[0.08em] uppercase text-[#8a8a8a] dark:text-[#5a5550]"
    >
      <div>Параметр</div>
      <div>Значения</div>
    </div>
    <dl class="divide-y divide-[#0a0a0a]/10 dark:divide-[#ede8de]/10">
      <div
        v-for="row in rows"
        :key="row.name"
        class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6 px-5 md:px-6 py-4 md:py-5"
      >
        <dt
          class="lnf-display font-bold text-[14px] md:text-[15px] text-[#0a0a0a] dark:text-[#ede8de]"
        >
          {{ row.name }}
        </dt>
        <dd
          class="lnf-body text-[14px] md:text-[15px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094]"
        >
          {{ row.values }}
          <span
            v-if="row.note"
            class="block lnf-mono text-[11px] tracking-[0.04em] text-[#8a8a8a] dark:text-[#5a5550] mt-1.5"
          >
            {{ row.note }}
          </span>
        </dd>
      </div>
    </dl>
  </div>
</template>
