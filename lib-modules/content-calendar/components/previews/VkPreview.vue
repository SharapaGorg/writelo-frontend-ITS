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
  <div class="bg-zinc-900 rounded-lg overflow-hidden max-w-[400px] border border-zinc-700">
    <div class="flex items-center gap-3 p-3">
      <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
        VK
      </div>
      <div>
        <div class="text-sm font-medium text-white">Название сообщества</div>
        <div class="text-xs text-zinc-500">сегодня в 12:00</div>
      </div>
    </div>
    <div class="px-3 pb-3 text-sm text-zinc-200">
      {{ preview.text }}
    </div>
    <div v-if="image" class="aspect-square bg-zinc-800">
      <img :src="image" alt="" class="w-full h-full object-cover" />
    </div>
    <div class="flex items-center gap-6 p-3 border-t border-zinc-800 text-zinc-400 text-sm">
      <span class="flex items-center gap-1">❤️ {{ formatNumber(preview.likes) }}</span>
      <span class="flex items-center gap-1">💬 {{ formatNumber(preview.comments) }}</span>
      <span class="flex items-center gap-1">↗️ {{ formatNumber(preview.shares) }}</span>
    </div>
  </div>
</template>
