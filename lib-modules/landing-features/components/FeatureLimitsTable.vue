<script setup lang="ts">
import type { FeatureLimitRow } from '../types'

defineProps<{
  rows: FeatureLimitRow[]
}>()
</script>

<template>
  <div
    class="border border-[#0a0a0a]/15 dark:border-[#ede8de]/15 overflow-x-auto bg-white dark:bg-[#0e0e0e]"
  >
    <table class="w-full min-w-[640px]">
      <thead>
        <tr
          class="bg-[#f5f5f5] dark:bg-[#161616] border-b border-[#0a0a0a]/10 dark:border-[#ede8de]/10 text-left lnf-mono text-[11px] tracking-[0.08em] uppercase text-[#8a8a8a] dark:text-[#5a5550]"
        >
          <th class="px-5 md:px-6 py-3 font-bold">Возможность</th>
          <th class="px-4 md:px-5 py-3 font-bold">Free</th>
          <th class="px-4 md:px-5 py-3 font-bold text-[#d4683f]">Pro</th>
          <th class="px-4 md:px-5 py-3 font-bold">Business</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#0a0a0a]/10 dark:divide-[#ede8de]/10">
        <tr v-for="row in rows" :key="row.feature">
          <td
            class="px-5 md:px-6 py-4 lnf-display font-bold text-[14px] md:text-[15px] text-[#0a0a0a] dark:text-[#ede8de] align-top"
          >
            {{ row.feature }}
          </td>
          <td
            class="px-4 md:px-5 py-4 lnf-body text-[14px] md:text-[15px] text-[#5f5f5f] dark:text-[#a8a094] align-top"
          >
            {{ row.free }}
          </td>
          <td
            class="px-4 md:px-5 py-4 lnf-body text-[14px] md:text-[15px] text-[#0a0a0a] dark:text-[#ede8de] align-top"
          >
            {{ row.pro }}
          </td>
          <td
            class="px-4 md:px-5 py-4 lnf-body text-[14px] md:text-[15px] text-[#5f5f5f] dark:text-[#a8a094] align-top"
          >
            {{ row.business }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
