<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Clock } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import AnalysisStatusBadge from './AnalysisStatusBadge.vue'
import PlatformIcon from './PlatformIcon.vue'
import { parseYoutubeVideoId, youtubeThumbnailUrl } from '../helpers/youtubeThumbnail'
import type { ShortVideoAnalysisHistoryItemDto } from '../types'

const props = defineProps<{
  item: ShortVideoAnalysisHistoryItemDto
}>()

const ytId = computed(() =>
  props.item.platform === 'youtube'
    ? parseYoutubeVideoId(props.item.normalizedUrl) ?? parseYoutubeVideoId(props.item.originalUrl)
    : null,
)

// Backend signed asset > YouTube canonical thumb > nothing.
const previewSrc = computed(() => {
  if (props.item.previewImage?.url) return props.item.previewImage.url
  if (ytId.value) return youtubeThumbnailUrl(ytId.value)
  return null
})

const platformBgClass = computed(() => {
  switch (props.item.platform) {
    case 'youtube': return 'bg-red-500/10'
    case 'tiktok': return 'bg-foreground/10'
    case 'instagram': return 'bg-gradient-to-br from-pink-500/10 to-amber-500/10'
    default: return 'bg-muted'
  }
})

const requestedHuman = computed(() => {
  try {
    return new Date(props.item.requestedAt).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
})

const displayUrl = computed(() => {
  try {
    const u = new URL(props.item.originalUrl)
    return `${u.hostname.replace(/^www\./, '')}${u.pathname}`
  } catch {
    return props.item.originalUrl
  }
})

const primaryText = computed(() => props.item.title?.trim() || displayUrl.value)

const isClickable = computed(() => Boolean(props.item.shortVideoAnalysisId))
</script>

<template>
  <NuxtLink
    :to="isClickable ? `/app/video-analyzer/${item.shortVideoAnalysisId}` : '#'"
    :class="cn(
      'group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow',
      isClickable ? 'hover:shadow-md' : 'cursor-default opacity-90',
    )"
  >
    <div :class="cn('relative flex h-36 w-full items-center justify-center overflow-hidden', platformBgClass)">
      <img
        v-if="previewSrc && item.status !== 'failed'"
        :src="previewSrc"
        :alt="item.title ?? item.originalUrl"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <PlatformIcon
        v-else-if="item.status !== 'failed'"
        :platform="item.platform"
        size="xl"
        tinted
      />
      <div v-else class="flex flex-col items-center gap-1 text-rose-500/80 dark:text-rose-300/80">
        <AlertTriangle class="h-10 w-10" />
        <span class="text-xs font-medium">Не удалось проанализировать</span>
      </div>

      <div class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
        <PlatformIcon :platform="item.platform" size="sm" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-3">
      <div class="flex items-start justify-between gap-2">
        <p class="line-clamp-2 break-all text-sm font-medium">{{ primaryText }}</p>
        <AnalysisStatusBadge :status="item.status" />
      </div>
      <div class="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
        <Clock class="h-3 w-3" />
        {{ requestedHuman }}
      </div>
    </div>
  </NuxtLink>
</template>
