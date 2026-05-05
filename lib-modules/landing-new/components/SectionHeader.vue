<script setup lang="ts">
import type { SectionHeaderProps } from '../types'

withDefaults(defineProps<SectionHeaderProps>(), {
  withRule: false,
})
</script>

<template>
  <div class="mb-12 md:mb-16">
    <div class="lnf-mono font-bold text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-5 md:mb-6">
      {{ label }}
    </div>
    <h2 class="lnf-display font-bold text-[36px] md:text-[56px] lg:text-[64px] leading-[1.05] tracking-[-0.03em] text-[#0a0a0a] dark:text-[#ede8de] max-w-[18ch]">
      <slot name="title">{{ title }}</slot>
    </h2>
    <div v-if="withRule" class="mt-8 h-px bg-[#0a0a0a]/20 dark:bg-[#ede8de]/30" />
  </div>
</template>
