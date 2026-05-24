<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  TrendingUp,
  Hash,
  Tag,
  Globe,
  ExternalLink,
  RotateCcw,
  X,
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '~/components/ui/dialog'
import { useReelsResearchStore } from '../stores/reelsResearchStore'
import type { TrendingReelDto } from '../types'

const store = useReelsResearchStore()

const reel = computed<TrendingReelDto | null>(() => store.selectedReel)

const open = computed({
  get: () => store.isDetailOpen,
  set: (v: boolean) => { if (!v) store.closeReel() }
})

// Bumping this key force-remounts the iframe — used to "replay" since
// Instagram's embed locks playback behind a "Watch again on Instagram"
// overlay once the reel ends and there's no way to control it from outside.
const embedNonce = ref(0)

const embedUrl = computed(() => {
  const r = reel.value
  if (!r) return null
  const code = r.shortcode || r.url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([^/?#]+)/)?.[1]
  if (!code) return null
  // Append a no-op query param tied to the nonce so the iframe actually
  // refetches when the key changes (some browsers cache identical srcs).
  const bust = embedNonce.value ? `?_=${embedNonce.value}` : ''
  return `https://www.instagram.com/reel/${code}/embed/${bust}`
})

function replayEmbed() {
  embedNonce.value += 1
}

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

function formatMultiplier(m: number | null | undefined): string {
  if (m == null) return '—'
  return `${m.toFixed(2)}×`
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="!max-w-5xl p-0 overflow-hidden h-[100dvh] max-h-[100dvh] !rounded-none top-0 !translate-y-0 md:top-1/2 md:!-translate-y-1/2 md:h-auto md:max-h-[88vh] md:!rounded-lg"
    >
      <DialogTitle class="sr-only">
        Детали Reels
      </DialogTitle>
      <DialogDescription class="sr-only">
        Просмотр видео и метрик рилса
      </DialogDescription>

      <!-- Mobile close: prominent circular button with backdrop, sits over
           the dark video area where the default white-X is invisible. -->
      <DialogClose
        class="md:hidden absolute right-3 top-3 z-50 size-10 rounded-full bg-black/65 backdrop-blur-md text-white flex items-center justify-center ring-1 ring-white/15 active:scale-95 transition-transform"
        aria-label="Закрыть"
      >
        <X class="w-5 h-5" />
      </DialogClose>

      <div v-if="reel" class="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_360px] h-full md:h-auto md:max-h-[88vh] min-h-0">
        <!-- Left: Instagram reel embed. Chrome (header + likes/comments +
             "View more" footer) is uncontrollable, so we clip it: shift
             the iframe up past the header and pad its height so the
             footer ends up below the wrapper bottom edge. A small bottom
             mask catches any residual bleed. -->
        <div class="relative bg-black flex items-center justify-center overflow-hidden flex-shrink-0 h-[calc(55dvh_+_100px)] md:h-auto md:min-h-[560px]">
          <img
            v-if="reel.previewImage?.url"
            :src="reel.previewImage.url"
            aria-hidden="true"
            class="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 pointer-events-none"
          />
          <div
            v-if="embedUrl"
            class="relative z-10 w-full h-full md:max-w-[420px] overflow-hidden bg-black"
          >
            <iframe
              :key="embedUrl"
              :src="embedUrl"
              class="absolute inset-x-0 w-full bg-black"
              style="top: -55px; height: calc(100% + 220px);"
              frameborder="0"
              scrolling="no"
              allowtransparency="true"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
              loading="lazy"
            />
            <!-- Insurance mask for any "View more on Instagram" pixels
                 that still bleed past the clip. -->
            <div class="absolute inset-x-0 bottom-0 h-[80px] bg-black pointer-events-none z-10" />
            <!-- Replay: force-remounts the iframe to blow away Instagram's
                 "Watch again on Instagram" overlay. -->
            <button
              type="button"
              class="absolute right-2 bottom-2 z-20 size-9 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center ring-1 ring-white/15 active:scale-95 transition-transform"
              aria-label="Перезапустить видео"
              @click="replayEmbed"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right: info panel. Single scrolling column on both mobile and
             desktop — description sits above metrics/meta/virality with the
             "Открыть в Instagram" CTA sticky at the bottom. -->
        <div class="flex flex-col flex-1 min-h-0 overflow-y-auto bg-card border-t border-border md:border-t-0 md:border-l">
          <!-- Description -->
          <div v-if="reel.description" class="px-5 py-4 border-b border-border">
            <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ reel.description }}</p>
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
                <div class="text-lg font-semibold text-foreground" :title="fullNumber(reel.metrics.plays)">
                  {{ formatNumber(reel.metrics.plays) }}
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
              <div class="rounded-md border border-border bg-background p-3 col-span-2">
                <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                  <Bookmark class="w-3 h-3" />
                  Сохранения
                </div>
                <div class="text-sm font-medium text-foreground" :title="fullNumber(reel.metrics.saves)">
                  {{ formatNumber(reel.metrics.saves) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div class="px-5 py-4 border-b border-border space-y-2.5">
            <div class="flex items-center gap-2 text-xs">
              <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Опубликовано:</span>
              <span class="text-foreground font-medium">{{ formatDateTime(reel.publishedAt ?? reel.postedAt) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Calendar class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Добавлено:</span>
              <span class="text-foreground font-medium">{{ formatDateTime(reel.addedAt) }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Clock class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Длительность:</span>
              <span class="text-foreground font-medium">{{ formatDuration(reel.durationSeconds) }}</span>
            </div>
            <div v-if="reel.category" class="flex items-center gap-2 text-xs">
              <Tag class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Категория:</span>
              <span class="text-foreground font-medium">{{ reel.category }}</span>
            </div>
            <div v-if="reel.language" class="flex items-center gap-2 text-xs">
              <Globe class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Язык:</span>
              <span class="text-foreground font-medium uppercase">{{ reel.language }}</span>
            </div>
            <div v-if="reel.shortcode" class="flex items-center gap-2 text-xs">
              <Hash class="w-3.5 h-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">Shortcode:</span>
              <code class="text-foreground font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{{ reel.shortcode }}</code>
            </div>
          </div>

          <!-- Virality vs author baseline -->
          <div v-if="reel.metrics.viewsOverAuthorBaseline != null" class="px-5 py-4 border-b border-border">
            <div class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
              <TrendingUp class="w-3 h-3" />
              Вирусность
            </div>
            <dl class="space-y-2 text-xs">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Относительно среднего у автора</dt>
                <dd class="text-foreground font-medium">{{ formatMultiplier(reel.metrics.viewsOverAuthorBaseline) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Sticky CTA at the bottom of the info column. -->
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
