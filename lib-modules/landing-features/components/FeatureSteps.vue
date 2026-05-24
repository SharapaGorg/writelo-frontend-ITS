<script setup lang="ts">
import type { FeatureStepItem } from '../types'

defineProps<{
  steps: FeatureStepItem[]
}>()
</script>

<template>
  <ol class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
    <li
      v-for="(step, idx) in steps"
      :key="step.title"
      class="flex gap-5 md:gap-6"
    >
      <div
        class="lnf-mono font-bold text-[14px] md:text-[15px] text-[#d4683f] shrink-0 w-9 h-9 md:w-10 md:h-10 border border-[#d4683f]/40 flex items-center justify-center tabular-nums"
      >
        {{ String(idx + 1).padStart(2, '0') }}
      </div>
      <div class="flex-1 pt-1">
        <h3
          class="lnf-display font-bold text-[17px] md:text-[19px] leading-[1.25] tracking-[-0.015em] text-[#0a0a0a] dark:text-[#ede8de] mb-2"
        >
          {{ step.title }}
        </h3>
        <p
          class="lnf-body text-[15px] md:text-[16px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094]"
        >
          {{ step.body }}
        </p>
      </div>
    </li>
  </ol>
</template>
