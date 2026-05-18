<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle, Clock } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import AnalysisStatusBadge from './AnalysisStatusBadge.vue'
import PlatformIcon from './PlatformIcon.vue'
import { parseYoutubeVideoId, youtubeThumbnailUrl } from '../helpers/youtubeThumbnail'
import type { ShortVideoAnalysisHistoryItemDto } from '../types'

const props = defineProps<{
  item: ShortVideoAnalysisHistoryItemDto
}>()

const { t } = useI18n()

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

const imgLoaded = ref(false)
const imgErrored = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

// Cached images often don't fire @load — check .complete after the new src is in DOM.
function syncCachedState() {
  const el = imgRef.value
  if (!el) return
  if (el.complete && el.naturalWidth > 0) imgLoaded.value = true
}

onMounted(syncCachedState)

watch(previewSrc, async () => {
  imgLoaded.value = false
  imgErrored.value = false
  await Promise.resolve()
  syncCachedState()
})

const showImage = computed(() =>
  Boolean(previewSrc.value) && props.item.status !== 'failed' && !imgErrored.value,
)
const showSkeleton = computed(() => showImage.value && !imgLoaded.value)
const showPlatformFallback = computed(() =>
  props.item.status !== 'failed' && (!previewSrc.value || imgErrored.value),
)

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
      <div
        v-if="showSkeleton"
        class="absolute inset-0 animate-pulse bg-muted"
        aria-hidden="true"
      />
      <img
        v-if="showImage"
        ref="imgRef"
        :src="previewSrc!"
        :alt="item.title ?? item.originalUrl"
        :class="cn(
          'relative h-full w-full object-cover transition-opacity duration-200',
          imgLoaded ? 'opacity-100' : 'opacity-0',
        )"
        loading="lazy"
        @load="imgLoaded = true"
        @error="imgErrored = true"
      />
      <PlatformIcon
        v-else-if="showPlatformFallback"
        :platform="item.platform"
        size="xl"
        tinted
      />
      <div
        v-else-if="item.status === 'failed'"
        class="flex flex-col items-center gap-1 text-rose-500/80 dark:text-rose-300/80"
      >
        <AlertTriangle class="h-10 w-10" />
        <span class="text-xs font-medium">{{ t('videoAnalyzer.history.failedToAnalyze') }}</span>
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
