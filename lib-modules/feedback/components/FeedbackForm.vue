<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Frown, Meh, Smile, Loader2, Check, X } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { useFeedbackApi } from '../helpers/api'
import type {
  FeedbackSection,
  FeedbackSentiment,
  CreateFeedbackContextDto,
  CreateFeedbackReelReferenceDto,
} from '../types'

// UI source → backend section. `targetId`/`curatedReelId` only meaningful
// for the reel-analysis section.
type Source = 'site' | 'today-reels' | 'reel-analysis'

const props = withDefaults(
  defineProps<{
    source: Source
    // For arbitrary reel-analysis context (e.g. user-submitted external video):
    // sent as externalId on the reel reference.
    targetId?: string
    // For curated trending reels (TrendingReelDto.reelId).
    curatedReelId?: string
    // For arbitrary reels that have a URL.
    reelUrl?: string
    compact?: boolean
    collapsible?: boolean
  }>(),
  { compact: false, collapsible: false },
)

const api = useFeedbackApi()

const storageKey = computed(
  () => `feedback:collapsed:${props.source}:${props.curatedReelId ?? props.targetId ?? '_'}`,
)

type Rating = 1 | 2 | 3
type State = 'idle' | 'submitting' | 'done' | 'error'

const state = ref<State>('idle')
const rating = ref<Rating | null>(null)
const comment = ref('')
const expanded = ref(true)

onMounted(() => {
  if (!props.collapsible) return
  try {
    if (localStorage.getItem(storageKey.value) === '1') expanded.value = false
  } catch {}
})

function persistCollapsed(value: boolean) {
  if (!props.collapsible) return
  try {
    localStorage.setItem(storageKey.value, value ? '1' : '0')
  } catch {}
}

function expand() {
  expanded.value = true
  persistCollapsed(false)
}

function collapse() {
  expanded.value = false
  persistCollapsed(true)
}

const title = computed(() => {
  switch (props.source) {
    case 'reel-analysis': return 'Как вам разбор?'
    case 'today-reels': return 'Как сегодняшние рилсы?'
    default: return 'Как вам Writelo?'
  }
})

interface Face {
  value: Rating
  sentiment: FeedbackSentiment
  icon: typeof Frown
  label: string
  tone: string
  bg: string
}

const faces: Face[] = [
  {
    value: 1,
    sentiment: 'dislike',
    icon: Frown,
    label: 'Плохо',
    tone: 'text-rose-500',
    bg: 'bg-rose-100 dark:bg-rose-950/40',
  },
  {
    value: 2,
    sentiment: 'neutral',
    icon: Meh,
    label: 'Нормально',
    tone: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-950/40',
  },
  {
    value: 3,
    sentiment: 'like',
    icon: Smile,
    label: 'Огонь',
    tone: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
  },
]

function sourceToSection(source: Source): FeedbackSection {
  switch (source) {
    case 'reel-analysis': return 'reel_analysis'
    case 'today-reels': return 'today_reels'
    default: return 'generic'
  }
}

// Backend rejects context for generic + today_reels; only build one for reel_analysis.
function buildContext(): CreateFeedbackContextDto | null {
  if (props.source !== 'reel-analysis') return null
  let reel: CreateFeedbackReelReferenceDto
  if (props.curatedReelId) {
    reel = { kind: 'curated', curatedReelId: props.curatedReelId }
  } else {
    reel = {
      kind: 'arbitrary',
      url: props.reelUrl ?? null,
      externalId: props.targetId ?? null,
    }
  }
  return { analysis: { reel } }
}

async function submit() {
  if (!rating.value || state.value !== 'idle') return
  const face = faces.find(f => f.value === rating.value)
  if (!face) return
  state.value = 'submitting'
  try {
    await api.createFeedback({
      section: sourceToSection(props.source),
      sentiment: face.sentiment,
      context: buildContext(),
      message: comment.value.trim() || null,
    })
    state.value = 'done'
    setTimeout(() => {
      state.value = 'idle'
      rating.value = null
      comment.value = ''
      if (props.collapsible) collapse()
    }, 2500)
  } catch {
    state.value = 'idle'
  }
}
</script>

<template>
  <button
    v-if="collapsible && !expanded"
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 h-9 text-xs font-medium shadow-lg transition-colors hover:bg-accent"
    @click="expand"
  >
    <Smile class="h-4 w-4 text-muted-foreground" />
    <span>Оценить</span>
  </button>

  <div
    v-else
    :class="cn(
      'relative rounded-lg border border-border bg-card',
      compact ? 'p-3 w-72 shadow-lg' : 'p-4',
    )"
  >
    <button
      v-if="collapsible && state !== 'submitting' && state !== 'done'"
      type="button"
      aria-label="Свернуть"
      class="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      @click="collapse"
    >
      <X class="h-3.5 w-3.5" />
    </button>

    <div
      v-if="state === 'done'"
      class="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Check class="h-4 w-4 shrink-0 text-emerald-500" />
      <span>Спасибо за отзыв!</span>
    </div>

    <template v-else>
      <div
        v-if="!compact"
        :class="cn('mb-3 font-medium text-sm', collapsible && 'pr-6')"
      >{{ title }}</div>

      <div :class="cn('flex gap-2', compact ? 'mb-2' : 'mb-3', compact && collapsible && 'pr-5')">
        <button
          v-for="face in faces"
          :key="face.value"
          type="button"
          :aria-label="face.label"
          :disabled="state === 'submitting'"
          :class="cn(
            'flex flex-1 items-center justify-center rounded-md border transition-all',
            compact ? 'h-10' : 'h-12',
            rating === face.value
              ? `${face.bg} border-transparent ring-1 ring-ring/40`
              : 'border-border hover:bg-accent',
            state === 'submitting' && 'opacity-50 cursor-not-allowed',
          )"
          @click="rating = face.value"
        >
          <component
            :is="face.icon"
            :class="cn(
              compact ? 'h-5 w-5' : 'h-6 w-6',
              rating === face.value ? face.tone : 'text-muted-foreground',
            )"
          />
        </button>
      </div>

      <Textarea
        v-model="comment"
        :placeholder="compact ? 'Комментарий (опционально)' : 'Расскажите подробнее (опционально)'"
        :disabled="state === 'submitting'"
        :maxlength="2000"
        :class="cn(
          'min-h-[52px] resize-none mb-2',
          compact ? 'text-xs' : 'text-sm',
        )"
      />

      <Button
        size="sm"
        :disabled="!rating || state === 'submitting'"
        class="w-full"
        @click="submit"
      >
        <Loader2 v-if="state === 'submitting'" class="mr-1 h-3.5 w-3.5 animate-spin" />
        {{ state === 'submitting' ? 'Отправляем…' : 'Отправить' }}
      </Button>
    </template>
  </div>
</template>
