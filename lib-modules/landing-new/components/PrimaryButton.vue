<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'default' | 'sm'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { size: 'default', type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    :class="[
      'lnf-body inline-flex items-center justify-center gap-2 font-medium bg-[#d4683f] text-[#0a0a0a] hover:bg-[#b9542d] transition-colors duration-200 select-none disabled:bg-[#3a3530] disabled:text-[#5a5550] disabled:cursor-not-allowed disabled:hover:bg-[#3a3530]',
      size === 'sm' ? 'px-5 py-2.5 text-sm' : 'px-8 py-4 text-[15px] md:text-base',
    ]"
  >
    <slot />
  </button>
</template>
