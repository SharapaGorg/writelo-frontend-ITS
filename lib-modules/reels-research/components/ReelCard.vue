<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Play, Heart, MessageCircle, TrendingUp, Users } from 'lucide-vue-next'
import type { TrendingReelDto } from '../types'

const props = defineProps<{
  reel: TrendingReelDto
}>()

const emit = defineEmits<{
  select: [reel: TrendingReelDto]
}>()

const cardRef = ref<HTMLElement | null>(null)
const inView = ref(false)
const thumbLoaded = ref(false)
const thumbFailed = ref(false)

// Stop observing once we've entered the viewport — thumbnails don't need to
// re-trigger as the user scrolls past.
const { stop } = useIntersectionObserver(
  cardRef,
  ([entry]) => {
    if (entry?.isIntersecting) {
      inView.value = true
      stop()
    }
  },
  { rootMargin: '200px 0px' }
)

const playsCount = computed(() => props.reel.metrics.plays ?? 0)
const likesCount = computed(() => props.reel.metrics.likes ?? 0)
const commentsCount = computed(() => props.reel.metrics.comments ?? 0)
const authorHandle = computed(() => {
  const u = props.reel.author.username
  return u ? `@${u}` : (props.reel.author.displayName ?? 'unknown')
})
const captionText = computed(() => props.reel.description ?? '')
const thumbnail = computed(() => props.reel.previewImage?.url ?? '')
const followerCount = computed(() => props.reel.author.followerCount)

// viewsOverAuthorBaseline = во сколько раз этот рилс обогнал средний охват автора.
// Бейдж показываем только когда значение реально стоит внимания.
const viralMultiplier = computed<number | null>(() => {
  const m = props.reel.metrics.viewsOverAuthorBaseline
  return typeof m === 'number' && m >= 2 ? m : null
})

const viralBadgeClass = computed(() => {
  const m = viralMultiplier.value ?? 0
  if (m >= 20) return 'bg-brand text-brand-foreground'
  if (m >= 5) return 'bg-orange-500/95 text-white'
  return 'bg-black/65 text-white'
})

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatMultiplier(m: number): string {
  if (m >= 100) return `${Math.round(m)}`
  if (m >= 10) return `${Math.round(m)}`
  return m.toFixed(1)
}

function formatDuration(seconds: number | null): string {
  const s = Math.round(seconds ?? 0)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m}:${String(r).padStart(2, '0')}` : `${m}:00`
}
</script>

<template>
  <button
    ref="cardRef"
    type="button"
    class="group text-left rounded-md border border-border bg-card overflow-hidden transition-all hover:border-foreground/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    @click="emit('select', reel)"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-[4/5] overflow-hidden bg-muted">
      <!-- Skeleton placeholder until thumbnail is in view + loaded -->
      <div
        v-if="!thumbLoaded && !thumbFailed"
        class="absolute inset-0 bg-gradient-to-br from-muted to-muted/40 animate-pulse"
      />
      <img
        v-if="inView && thumbnail && !thumbFailed"
        :src="thumbnail"
        :alt="captionText || 'Reel thumbnail'"
        decoding="async"
        loading="lazy"
        class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        :class="thumbLoaded ? 'opacity-100' : 'opacity-0'"
        @load="thumbLoaded = true"
        @error="thumbFailed = true"
      />
      <!-- Fallback when thumbnail fails or missing -->
      <div
        v-if="thumbFailed || (inView && !thumbnail)"
        class="absolute inset-0 flex items-center justify-center text-muted-foreground"
      >
        <Play class="w-8 h-8 opacity-40" />
      </div>

      <!-- Top gradient for badge legibility -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

      <!-- Viral multiplier badge (top-left) -->
      <div
        v-if="viralMultiplier !== null"
        class="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-0.5 backdrop-blur-sm shadow-sm"
        :class="viralBadgeClass"
        :title="`Этот рилс собрал в ${viralMultiplier.toFixed(1)}× больше проигрываний, чем обычно у автора`"
      >
        <TrendingUp class="w-3 h-3" />
        ×{{ formatMultiplier(viralMultiplier) }}
      </div>

      <!-- Duration badge (top-right) -->
      <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/55 text-white text-[11px] font-medium backdrop-blur-sm">
        {{ formatDuration(reel.durationSeconds) }}
      </div>

      <!-- Plays badge (bottom-left) -->
      <div
        class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/55 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm"
        :title="`${playsCount.toLocaleString('ru-RU')} проигрываний`"
      >
        <Play class="w-3 h-3 fill-current" />
        {{ formatNumber(playsCount) }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3">
      <!-- Author row -->
      <div class="flex items-center gap-1.5 mb-1.5 min-w-0">
        <div class="w-5 h-5 rounded-full overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">
          {{ (reel.author.username ?? reel.author.displayName ?? '?').charAt(0).toUpperCase() }}
        </div>
        <span class="text-xs text-muted-foreground truncate">{{ authorHandle }}</span>
        <svg
          v-if="reel.author.isVerified"
          class="w-3 h-3 text-sky-500 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2.39 1.74 2.92-.27.81 2.82 2.34 1.78-.97 2.78.97 2.78-2.34 1.78-.81 2.82-2.92-.27L12 22l-2.39-1.74-2.92.27-.81-2.82L3.54 15.93l.97-2.78-.97-2.78 2.34-1.78.81-2.82 2.92.27L12 2z" />
          <path d="M9 12.5l2 2 4-4.5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span
          v-if="followerCount != null"
          class="ml-auto inline-flex items-center gap-0.5 text-[10px] text-muted-foreground flex-shrink-0"
          :title="`${followerCount.toLocaleString('ru-RU')} подписчиков`"
        >
          <Users class="w-2.5 h-2.5" />
          {{ formatNumber(followerCount) }}
        </span>
      </div>

      <!-- Caption -->
      <p class="text-xs text-foreground line-clamp-2 mb-2 leading-snug min-h-[2rem]">
        {{ captionText || '—' }}
      </p>

      <!-- Metrics row -->
      <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
        <div class="flex items-center gap-1" :title="`${likesCount.toLocaleString('ru-RU')} лайков`">
          <Heart class="w-3.5 h-3.5" />
          <span>{{ formatNumber(likesCount) }}</span>
        </div>
        <div class="flex items-center gap-1" :title="`${commentsCount.toLocaleString('ru-RU')} комментариев`">
          <MessageCircle class="w-3.5 h-3.5" />
          <span>{{ formatNumber(commentsCount) }}</span>
        </div>
      </div>
    </div>
  </button>
</template>
