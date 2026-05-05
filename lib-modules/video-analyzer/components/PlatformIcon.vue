<script setup lang="ts">
import { computed } from 'vue'
import { Youtube, Music2, Instagram, Film } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import type { SocialVideoPlatform } from '../types'

const props = withDefaults(defineProps<{
  platform: SocialVideoPlatform | string | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tinted?: boolean
}>(), {
  size: 'md',
  tinted: false,
})

const Icon = computed(() => {
  switch (props.platform) {
    case 'youtube': return Youtube
    case 'tiktok': return Music2
    case 'instagram': return Instagram
    default: return Film
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-4 w-4'
    case 'md': return 'h-5 w-5'
    case 'lg': return 'h-8 w-8'
    case 'xl': return 'h-14 w-14'
  }
})

const tintClass = computed(() => {
  if (!props.tinted) return ''
  switch (props.platform) {
    case 'youtube': return 'text-red-500 dark:text-red-400'
    case 'tiktok': return 'text-foreground'
    case 'instagram': return 'text-pink-500 dark:text-pink-400'
    default: return 'text-muted-foreground'
  }
})
</script>

<template>
  <component :is="Icon" :class="cn(sizeClass, tintClass)" />
</template>
