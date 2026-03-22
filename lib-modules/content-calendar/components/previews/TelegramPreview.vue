<script setup lang="ts">
import type { SocialPreviewData } from '../../types'

const props = defineProps<{
  preview: SocialPreviewData
  image?: string
}>()

function formatNumber(n: number | undefined): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
</script>

<template>
  <div class="bg-zinc-900 rounded-lg overflow-hidden max-w-[380px] border border-zinc-700">
    <div class="flex items-center gap-3 p-3 border-b border-zinc-800">
      <div class="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
        TG
      </div>
      <div class="text-sm font-medium text-white">Название канала</div>
    </div>
    <div v-if="image" class="aspect-square bg-zinc-800">
      <img :src="image" alt="" class="w-full h-full object-cover" />
    </div>
    <div class="p-3 text-sm text-zinc-200">
      {{ preview.text }}
    </div>
    <div class="flex items-center justify-between px-3 pb-3 text-xs text-zinc-500">
      <span>👁 {{ formatNumber(preview.views) }}</span>
      <span>12:00</span>
    </div>
  </div>
</template>
