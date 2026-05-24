<script setup lang="ts">
import type { FeatureUseCaseItem } from '../types'

defineProps<{
  items: FeatureUseCaseItem[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
    <article
      v-for="item in items"
      :key="item.title"
      class="border border-[#0a0a0a]/12 dark:border-[#ede8de]/12 bg-white dark:bg-[#0e0e0e] p-6 md:p-7 hover:border-[#d4683f]/40 transition-colors"
    >
      <div
        class="lnf-mono font-bold text-[10px] md:text-[11px] tracking-[0.12em] uppercase text-[#d4683f] mb-4"
      >
        {{ item.badge }}
      </div>
      <h3
        class="lnf-display font-bold text-[18px] md:text-[20px] leading-[1.2] tracking-[-0.02em] text-[#0a0a0a] dark:text-[#ede8de] mb-3"
      >
        {{ item.title }}
      </h3>
      <p
        class="lnf-body text-[14px] md:text-[15px] leading-[1.55] text-[#5f5f5f] dark:text-[#a8a094]"
      >
        {{ item.body }}
      </p>
    </article>
  </div>
</template>
