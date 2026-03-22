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
  <div class="bg-black rounded-lg overflow-hidden max-w-[320px]">
    <div class="flex items-center gap-3 p-3">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
      <span class="text-sm font-medium text-white">username</span>
      <span class="ml-auto text-zinc-500">•••</span>
    </div>
    <div class="aspect-[4/5] bg-zinc-800 flex items-center justify-center">
      <img v-if="image" :src="image" alt="" class="w-full h-full object-cover" />
      <span v-else class="text-zinc-600 text-sm">Изображение</span>
    </div>
    <div class="p-3">
      <div class="flex items-center gap-4 mb-2">
        <span class="text-xl">❤️</span>
        <span class="text-xl">💬</span>
        <span class="text-xl">✈️</span>
        <span class="ml-auto text-xl">🔖</span>
      </div>
      <div class="text-sm font-medium text-white mb-1">
        {{ formatNumber(preview.likes) }} likes
      </div>
      <div class="text-sm text-zinc-300">
        <span class="font-medium">username</span> {{ preview.text }}
      </div>
      <div v-if="preview.comments" class="text-sm text-zinc-500 mt-1">
        View all {{ preview.comments }} comments
      </div>
    </div>
  </div>
</template>
