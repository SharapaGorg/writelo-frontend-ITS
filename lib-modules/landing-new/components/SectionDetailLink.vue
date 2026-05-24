<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps<{
  to: string
  section: string
  label: string
}>()

const { $trackGoal } = useNuxtApp()

function onClick() {
  $trackGoal('landing_section_deeplink', { section: props.section })
}
</script>

<template>
  <NuxtLink
    :to="to"
    target="_blank"
    rel="noopener"
    :aria-label="`Подробнее: ${label} (откроется в новой вкладке)`"
    class="inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 align-middle ml-2 md:ml-3 border border-[#0a0a0a]/15 dark:border-[#ede8de]/20 text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#d4683f] dark:hover:text-[#d4683f] hover:border-[#d4683f]/60 hover:rotate-[-8deg] transition-all duration-200 shrink-0"
    @click="onClick"
  >
    <ArrowUpRight class="w-5 h-5 md:w-6 md:h-6" />
  </NuxtLink>
</template>
