<script setup lang="ts">
withDefaults(defineProps<{ size?: 'default' | 'sm' }>(), {
  size: 'default',
})
</script>

<template>
  <button
    type="button"
    :class="[
      'lnf-body inline-flex items-center justify-center gap-2 font-medium border border-[#ede8de] text-[#ede8de] hover:bg-[#ede8de]/10 transition-colors duration-200 select-none',
      size === 'sm' ? 'px-5 py-2.5 text-sm' : 'px-8 py-4 text-[15px] md:text-base',
    ]"
  >
    <slot />
  </button>
</template>
