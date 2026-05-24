<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    title: string
    lead?: string
    withRule?: boolean
  }>(),
  { withRule: false },
)
</script>

<template>
  <section class="px-6 md:px-12 py-16 md:py-24">
    <div class="max-w-[1100px] mx-auto">
      <div class="mb-8 md:mb-12">
        <div
          v-if="label"
          class="lnf-mono font-bold text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#8a8a8a] dark:text-[#5a5550] mb-4 md:mb-5"
        >
          {{ label }}
        </div>
        <h2
          class="lnf-display font-bold text-[28px] md:text-[40px] lg:text-[44px] leading-[1.1] tracking-[-0.025em] text-[#0a0a0a] dark:text-[#ede8de] max-w-[26ch]"
        >
          {{ title }}
        </h2>
        <p
          v-if="lead"
          class="lnf-body text-[16px] md:text-[17px] leading-[1.6] text-[#5f5f5f] dark:text-[#a8a094] max-w-[64ch] mt-5 md:mt-6"
        >
          {{ lead }}
        </p>
      </div>
      <slot />
      <div v-if="withRule" class="mt-12 h-px bg-[#0a0a0a]/15 dark:bg-[#ede8de]/15" />
    </div>
  </section>
</template>
