<script setup lang="ts">
import type { FeatureFaqItem } from '../types'

defineProps<{
  items: FeatureFaqItem[]
}>()
</script>

<template>
  <div class="border-t border-[#0a0a0a]/15 dark:border-[#ede8de]/15">
    <details
      v-for="item in items"
      :key="item.question"
      class="group border-b border-[#0a0a0a]/15 dark:border-[#ede8de]/15"
    >
      <summary
        class="cursor-pointer list-none py-5 md:py-6 flex items-start justify-between gap-6 lnf-display font-bold text-[16px] md:text-[18px] leading-[1.3] tracking-[-0.015em] text-[#0a0a0a] dark:text-[#ede8de] hover:text-[#d4683f] dark:hover:text-[#d4683f] transition-colors"
      >
        <span>{{ item.question }}</span>
        <span
          class="lnf-mono text-[18px] md:text-[20px] leading-none mt-0.5 text-[#8a8a8a] dark:text-[#5a5550] group-open:rotate-45 transition-transform shrink-0"
        >+</span>
      </summary>
      <p
        class="lnf-body text-[15px] md:text-[16px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094] pb-6 md:pb-7 max-w-[72ch]"
      >
        {{ item.answer }}
      </p>
    </details>
  </div>
</template>
