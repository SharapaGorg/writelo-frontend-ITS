<script setup lang="ts">
import { computed } from 'vue'
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Hash,
  ExternalLink,
  Loader2,
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import ReelVideoPlayer from './ReelVideoPlayer.vue'
import type { TrendingReelDto } from '../types'

const store = useReelsResearchStore()

const reel = computed<TrendingReelDto | null>(() => store.selectedReel)

const open = computed({
  get: () => store.isDetailOpen,
  set: (v: boolean) => { if (!v) store.closeReel() }
})

const authorHandle = computed(() => {
  const r = reel.value
  if (!r) return ''
  return r.author.username ? `@${r.author.username}` : (r.author.displayName ?? 'unknown')
})

const authorDisplayName = computed(() => reel.value?.author.displayName ?? '')

function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('ru-RU')
}

function fullNumber(n: number | null | undefined): string {
  return n == null ? '—' : n.toLocaleString('ru-RU')
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const s = Math.round(seconds)
  if (s < 60) return `${s} сек`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m} мин ${r} сек` : `${m} мин`
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatAge(ageSeconds: number | null | undefined): string {
  if (ageSeconds == null) return '—'
  const s = Math.round(ageSeconds)
  const days = Math.floor(s / 86400)
  if (days >= 1) return `${days} дн назад`
  const hours = Math.floor(s / 3600)
  if (hours >= 1) return `${hours} ч назад`
  const mins = Math.floor(s / 60)
  return `${mins} мин назад`
}

function formatScore(score: number | null | undefined): string {
  if (score == null) return '—'
  return score.toFixed(2)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="!max-w-5xl p-0 overflow-hidden"
    >
      <DialogTitle class="sr-only">
        Детали Reels
      </DialogTitle>
      <DialogDescription class="sr-only">
        Просмотр видео и метрик рилса
      </DialogDescription>

      <div v-if="reel" class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] max-h-[88vh]">
        <!-- Left: video player -->
        <div class="relative bg-black min-h-[300px] md:min-h-[640px]">
          <ReelVideoPlayer
            :src="reel.videoUrl"
            :poster="reel.thumbnailUrl"
          />
        </div>

        <!-- Right: info panel -->
        <div class="flex flex-col overflow-y-auto bg-card">
          <!-- Author -->
          <div class="px-5 pt-5 pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                {{ (reel.author.username ?? reel.author.displayName ?? '?').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                  <span class="font-semibold text-sm text-foreground truncate">
                    {{ authorDisplayName || authorHandle }}
                  </span>
                  <svg
                    v-if="reel.author.isVerified"
                    class="w-4 h-4 text-sky-500 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l2.39 1.74 2.92-.27.81 2.82 2.34 1.78-.97 2.78.97 2.78-2.34 1.78-.81 2.82-2.92-.27L12 22l-2.39-1.74-2.92.27-.81-2.82L3.54 15.93l.97-2.78-.97-2.78 2.34-1.78.81-2.82 2.92.27L12 2z" />
                    <path d="M9 12.5l2 2 4-4.5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ authorHandle }}
                </div>
              </div>
              <Loader2 v-if="store.isLoadingDetail" class="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
            <div v-if="reel.author.followerCount != null" class="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Users class="w-3.5 h-3.5" />
              <span>{{ fullNumber(reel.author.followerCount) }} подписчиков</span>
            </div>
          </div>

          <!-- Caption -->
          <div v-if="reel.captionPreview" class="px-5 py-4 border-b border-border">
            <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ reel.captionPreview }}</p>
          </div>

          <!-- Primary metrics -->
          <div class="px-5 py-4 border-b border-border">
            <div class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Метрики</div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-md border border-border bg-background p-3">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Play class="w-3 h-3" />
                  Проигрывания
                </div>
                <div class="text-lg font-semibold text-foreground" :title="fullNumber(reel.metrics.plays ?? reel.metrics.effectiveViews)">
                  {{ formatNumber(reel.metrics.plays ?? reel.metrics.effectiveViews) }}
                </div>
              </div>
              <div class="rounded-md border border-border bg-background p-3">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Heart class="w-3 h-3" />
                  Лайки
                </div>
                <div class="text-lg font-semibold text-foreground" :title="fullNumber(reel.metrics.likes)">
                  {{ formatNumber(reel.metrics.likes) }}
                </div>
              </div>
              <div class="rounded-md border border-border bg-background p-3">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <MessageCircle class="w-3 h-3" />
                  Комментарии
                </div>
                <div class="text-lg font-semibold text-foreground" :title="fullNumber(reel.metrics.comments)">
                  {{ formatNumber(reel.metrics.comments) }}
                </div>
              </div>
              <div class="rounded-md border border-border bg-background p-3">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Share2 class="w-3 h-3" />
                  Репосты
                </div>
                <div class="text-lg font-semibold text-foreground" :title="fullNumber(reel.metrics.shares)">
                  {{ formatNumber(reel.metrics.shares) }}
                </div>
              </div>
              <div v-if="reel.metrics.views != null" class="rounded-md border border-border bg-background p-3 col-span-2">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Eye class="w-3 h-3" />
                  Просмотры (raw)
                </div>
                <div class="text-sm font-medium text-foreground">
                  {{ fullNumber(reel.metrics.views) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div class="px-5 py-4 border-b border-border space-y-2.5">
            <div class="flex items-center gap-2 text-xs">
              <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Опубликовано:</span>
              <span class="text-foreground font-medium">{{ formatDateTime(reel.postedAt) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Clock class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Длительность:</span>
              <span class="text-foreground font-medium">{{ formatDuration(reel.durationSeconds) }}</span>
            </div>
            <div v-if="reel.metrics.ageSeconds != null" class="flex items-center gap-2 text-xs">
              <Clock class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Возраст:</span>
              <span class="text-foreground font-medium">{{ formatAge(reel.metrics.ageSeconds) }}</span>
            </div>
            <div v-if="reel.shortcode" class="flex items-center gap-2 text-xs">
              <Hash class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Shortcode:</span>
              <code class="text-foreground font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{{ reel.shortcode }}</code>
            </div>
          </div>

          <!-- Score / Ranking -->
          <div class="px-5 py-4 border-b border-border">
            <div class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
              <TrendingUp class="w-3 h-3" />
              Ранжирование
            </div>
            <dl class="space-y-2 text-xs">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Глобальный ранг</dt>
                <dd class="text-foreground font-medium">#{{ reel.rank }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Rank score</dt>
                <dd class="text-foreground font-medium">{{ formatScore(reel.rankScore) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Global score</dt>
                <dd class="text-foreground font-medium">{{ formatScore(reel.score.global) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Views / author median</dt>
                <dd class="text-foreground font-medium">{{ formatScore(reel.score.viewsOverAuthorMedian) }}×</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-muted-foreground">Впервые увидели</dt>
                <dd class="text-foreground font-medium text-right">{{ formatDateTime(reel.firstSeenAt) }}</dd>
              </div>
              <div class="flex justify-between gap-2">
                <dt class="text-muted-foreground">Последний снимок</dt>
                <dd class="text-foreground font-medium text-right">{{ formatDateTime(reel.metrics.capturedAt ?? reel.lastSeenAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Actions -->
          <div class="px-5 py-4 mt-auto sticky bottom-0 bg-card border-t border-border">
            <a
              :href="reel.url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              <ExternalLink class="w-4 h-4" />
              Открыть в Instagram
            </a>
            <div v-if="store.detailError" class="text-xs text-destructive mt-2">
              {{ store.detailError }}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
