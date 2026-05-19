<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { AlertTriangle, ChevronDown, Minus } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { isAxesShape, isImprovementsShapeV2 } from '../../helpers/sectionShape'
import {
  AXIS_LABELS,
  LEVEL_LABELS,
  LEVEL_TONES,
  PILLAR_DEFS,
  computeReelScore,
  scoreToLevel,
} from '../../helpers/aggregation'
import type {
  AxesShape,
  AxisKey,
  AxisLevel,
  AxisDto,
  ImprovementItemV2,
  ImprovementPriority,
} from '../../types'

const props = defineProps<{
  value: unknown
  improvements?: unknown
}>()

const axes = computed<AxesShape | null>(() =>
  isAxesShape(props.value) ? (props.value as AxesShape) : null,
)

const reel = computed(() => axes.value ? computeReelScore(axes.value) : null)

const expanded = ref(false)

// Group improvements by axis so each axis card can show its own targeted
// advice when expanded. Inside a group, keep priority order (high → low).
const PRIORITY_RANK: Record<ImprovementPriority, number> = { high: 0, medium: 1, low: 2 }

const improvementsByAxis = computed<Record<string, ImprovementItemV2[]>>(() => {
  if (!isImprovementsShapeV2(props.improvements)) return {}
  const grouped: Record<string, ImprovementItemV2[]> = {}
  for (const item of props.improvements as ImprovementItemV2[]) {
    const key = item.axis
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const pa = PRIORITY_RANK[a.priority as ImprovementPriority] ?? 99
      const pb = PRIORITY_RANK[b.priority as ImprovementPriority] ?? 99
      return pa - pb
    })
  }
  return grouped
})

const PRIORITY_CHIP: Record<ImprovementPriority, string> = {
  high: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  low: 'bg-muted text-muted-foreground',
}

const PRIORITY_LABEL: Record<ImprovementPriority, string> = {
  high: 'высокий',
  medium: 'средний',
  low: 'низкий',
}

function priorityChip(p: string): string {
  return PRIORITY_CHIP[p as ImprovementPriority] ?? PRIORITY_CHIP.low
}

function priorityLabel(p: string): string {
  return PRIORITY_LABEL[p as ImprovementPriority] ?? p
}

// ---- Number tween for the headline counter (ring fills via CSS) ----

// Numbers start at 0 and ease up to the target so the score "counts in"
// in sync with the ring fill animation. Honours prefers-reduced-motion.
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function useTweenedNumber(getter: () => number | null, duration = 800) {
  const display = ref<number | null>(0)
  let raf: number | null = null
  let from = 0
  let start = 0

  const stop = () => {
    if (raf !== null) {
      cancelAnimationFrame(raf)
      raf = null
    }
  }

  watch(getter, (target) => {
    stop()
    if (target === null || target === undefined) {
      display.value = null
      return
    }
    // SSR / reduced motion → snap straight to the target.
    if (typeof window === 'undefined' || prefersReducedMotion()) {
      display.value = target
      return
    }
    from = typeof display.value === 'number' ? display.value : 0
    start = 0
    const step = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      display.value = Math.round(from + (target - from) * eased)
      raf = p < 1 ? requestAnimationFrame(step) : null
    }
    raf = requestAnimationFrame(step)
  }, { immediate: true })

  onUnmounted(stop)

  return display
}

// ---- Pillar / axis view model ----

interface AxisRow {
  key: AxisKey
  label: string
  score: number | null
  level: AxisLevel | null
  analysis: string | null
  tone: typeof LEVEL_TONES[AxisLevel] | null
  applicable: boolean
}

interface PillarRow {
  key: string
  label: string
  score: number | null
  level: AxisLevel | null
  tone: typeof LEVEL_TONES[AxisLevel] | null
  weight: number
  axes: AxisRow[]
}

function rowFromAxis(key: AxisKey, dto: AxisDto | undefined): AxisRow {
  const analysis = dto?.analysis_ru ?? null
  if (!dto || dto.score === null || dto.score === undefined) {
    return {
      key, label: AXIS_LABELS[key],
      score: null, level: null, analysis, tone: null, applicable: false,
    }
  }
  // Wire field is `category`; fall back to legacy `level` for older cached analyses.
  const dtoAny = dto as AxisDto & { level?: AxisLevel | null }
  const level = (dto.category ?? dtoAny.level ?? scoreToLevel(dto.score)) as AxisLevel
  return {
    key, label: AXIS_LABELS[key],
    score: dto.score, level, analysis, tone: LEVEL_TONES[level], applicable: true,
  }
}

const pillars = computed<PillarRow[]>(() => {
  if (!axes.value || !reel.value) return []
  return PILLAR_DEFS.map((def, i) => {
    const pillarScore = reel.value!.pillars[i]
    const level = scoreToLevel(pillarScore?.score ?? null)
    return {
      key: def.key,
      label: def.label,
      score: pillarScore?.score ?? null,
      level,
      tone: level ? LEVEL_TONES[level] : null,
      weight: def.weight,
      axes: def.axes.map(axisKey => rowFromAxis(axisKey, axes.value![axisKey])),
    }
  })
})

// Tweened headline numbers — one for Reel Score + one per pillar.
const displayReel = useTweenedNumber(() => reel.value?.overall ?? null)
const displayPillar0 = useTweenedNumber(() => pillars.value[0]?.score ?? null)
const displayPillar1 = useTweenedNumber(() => pillars.value[1]?.score ?? null)
const displayPillar2 = useTweenedNumber(() => pillars.value[2]?.score ?? null)
const displayPillar3 = useTweenedNumber(() => pillars.value[3]?.score ?? null)
const displayPillarScores = computed<(number | null)[]>(() => [
  displayPillar0.value, displayPillar1.value, displayPillar2.value, displayPillar3.value,
])

// ---- Ring geometry ----

interface RingGeom {
  size: number
  stroke: number
  r: number
  c: number
}

function ring(size: number, stroke: number): RingGeom {
  const r = (size - stroke) / 2
  return { size, stroke, r, c: 2 * Math.PI * r }
}

const HERO_RING = ring(176, 12)
const PILLAR_RING = ring(96, 8)

function arcOffset(score: number | null, geom: RingGeom): number {
  if (score === null) return geom.c
  return geom.c * (1 - Math.max(0, Math.min(100, score)) / 100)
}

// ---- Headline meta ----

const overallTone = computed(() => {
  const level = scoreToLevel(reel.value?.overall ?? null)
  return level ? LEVEL_TONES[level] : null
})

const overallLevelLabel = computed(() => {
  const level = scoreToLevel(reel.value?.overall ?? null)
  return level ? LEVEL_LABELS[level] : ''
})

// Short verdict line under the score. Driven by overall level + bottleneck.
const verdict = computed(() => {
  if (!reel.value) return ''
  if (reel.value.capped) return 'Критический провал — потолок 50 / 100'
  const level = scoreToLevel(reel.value.overall)
  switch (level) {
    case 'excellent': return 'Сильный ролик по всем фронтам'
    case 'good': return 'Хорошо сбалансирован, есть точечные апсайды'
    case 'average': return 'Базовый уровень — есть что подтянуть'
    case 'poor': return 'Слабые ключевые оси, нужна переработка'
    default: return ''
  }
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Оси оценки</h3>

    <template v-if="axes && reel">
      <!-- Hero: big Reel Score ring + 4 pillar rings -->
      <div class="space-y-4 rounded-lg border border-border bg-card p-5">
        <div class="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <!-- Reel Score ring -->
          <div class="flex flex-col items-center gap-2 md:items-start">
            <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Reel Score
            </div>
            <div class="relative" :style="{ width: `${HERO_RING.size}px`, height: `${HERO_RING.size}px` }">
              <svg
                :width="HERO_RING.size"
                :height="HERO_RING.size"
                class="-rotate-90"
              >
                <circle
                  :cx="HERO_RING.size / 2"
                  :cy="HERO_RING.size / 2"
                  :r="HERO_RING.r"
                  fill="none"
                  stroke="currentColor"
                  :stroke-width="HERO_RING.stroke"
                  class="text-muted"
                />
                <circle
                  v-if="reel.overall !== null"
                  :cx="HERO_RING.size / 2"
                  :cy="HERO_RING.size / 2"
                  :r="HERO_RING.r"
                  fill="none"
                  stroke="currentColor"
                  :stroke-width="HERO_RING.stroke"
                  stroke-linecap="round"
                  :stroke-dasharray="HERO_RING.c"
                  :stroke-dashoffset="arcOffset(displayReel, HERO_RING)"
                  :class="overallTone?.text"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  :class="cn(
                    'text-3xl sm:text-4xl font-bold tabular-nums leading-none',
                    overallTone?.text ?? 'text-muted-foreground',
                  )"
                >{{ displayReel ?? '—' }}</span>
                <span class="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  / 100 · {{ overallLevelLabel }}
                </span>
              </div>
            </div>
            <p class="max-w-[200px] text-center text-xs text-muted-foreground md:text-left">
              {{ verdict }}
            </p>
          </div>

          <!-- Pillar rings — fixed 2x2 grid on the right -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 md:gap-x-5">
            <div
              v-for="(p, i) in pillars"
              :key="p.key"
              class="flex flex-col items-center gap-2"
            >
              <div
                class="relative"
                :style="{ width: `${PILLAR_RING.size}px`, height: `${PILLAR_RING.size}px` }"
              >
                <svg
                  :width="PILLAR_RING.size"
                  :height="PILLAR_RING.size"
                  class="-rotate-90"
                >
                  <circle
                    :cx="PILLAR_RING.size / 2"
                    :cy="PILLAR_RING.size / 2"
                    :r="PILLAR_RING.r"
                    fill="none"
                    stroke="currentColor"
                    :stroke-width="PILLAR_RING.stroke"
                    class="text-muted"
                  />
                  <circle
                    v-if="p.score !== null"
                    :cx="PILLAR_RING.size / 2"
                    :cy="PILLAR_RING.size / 2"
                    :r="PILLAR_RING.r"
                    fill="none"
                    stroke="currentColor"
                    :stroke-width="PILLAR_RING.stroke"
                    stroke-linecap="round"
                    :stroke-dasharray="PILLAR_RING.c"
                    :stroke-dashoffset="arcOffset(displayPillarScores[i], PILLAR_RING)"
                    :class="p.tone?.text"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    :class="cn(
                      'text-xl font-bold tabular-nums leading-none',
                      p.tone?.text ?? 'text-muted-foreground',
                    )"
                  >{{ displayPillarScores[i] ?? '—' }}</span>
                  <span class="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                    {{ Math.round(p.weight * 100) }}%
                  </span>
                </div>
              </div>
              <span class="text-center text-[11px] font-medium leading-tight">
                {{ p.label }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="reel.capped"
          class="flex items-start gap-2 rounded-md border border-rose-300/60 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <AlertTriangle class="h-3.5 w-3.5 shrink-0" />
          <span>
            Балл ограничен потолком 50: критически просел один из gating-параметров
            (хук или техническое качество). Остальные плюсы не компенсируют этот провал.
          </span>
        </div>
      </div>

      <!-- Toggle: drill into the 12 axes -->
      <div class="flex justify-center">
        <Button
          variant="ghost"
          class="h-8 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground"
          @click="expanded = !expanded"
        >
          {{ expanded ? 'Скрыть оси' : 'Показать все 12 осей' }}
          <ChevronDown
            :class="cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')"
          />
        </Button>
      </div>

      <!-- Expanded axis details, grouped by pillar -->
      <div v-if="expanded" class="space-y-4">
        <div
          v-for="p in pillars"
          :key="`p-${p.key}`"
          class="space-y-2"
        >
          <div class="flex items-baseline gap-2 px-1">
            <h4 class="text-xs font-semibold uppercase tracking-wide text-foreground">{{ p.label }}</h4>
            <span class="text-[11px] text-muted-foreground">
              {{ p.score !== null ? `${p.score} / 100` : 'не применимо' }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div
              v-for="axis in p.axes"
              :key="axis.key"
              :class="cn(
                'space-y-2 rounded-lg border bg-card p-3',
                axis.applicable && axis.tone ? `ring-1 ${axis.tone.ring}` : 'border-border',
              )"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="text-sm font-semibold">{{ axis.label }}</div>
                <div class="flex items-center gap-1.5">
                  <span
                    v-if="axis.applicable && axis.tone"
                    :class="cn(
                      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                      axis.tone.bg, axis.tone.text,
                    )"
                  >{{ LEVEL_LABELS[(axis.level as AxisLevel)] }}</span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <Minus class="h-3 w-3" />
                    не применимо
                  </span>
                  <span
                    v-if="axis.applicable"
                    class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] tabular-nums"
                  >{{ axis.score }} / 100</span>
                </div>
              </div>

              <div
                v-if="axis.applicable && axis.tone"
                class="relative h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  :class="cn('absolute inset-y-0 left-0', axis.tone.bar)"
                  :style="{ width: `${axis.score}%` }"
                />
              </div>

              <p
                v-if="axis.analysis"
                class="text-xs leading-relaxed text-muted-foreground"
              >{{ axis.analysis }}</p>

              <!-- Axis-tied improvements (v2). Shown inline so analysis +
                   what-to-fix sit side by side instead of in separate sections. -->
              <div
                v-if="improvementsByAxis[axis.key]?.length"
                class="space-y-1.5 border-t border-border/60 pt-2"
              >
                <div
                  v-for="(imp, i) in improvementsByAxis[axis.key]"
                  :key="i"
                  class="space-y-1"
                >
                  <div class="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wide">
                    <span
                      :class="cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium', priorityChip(imp.priority))"
                    >приоритет: {{ priorityLabel(imp.priority) }}</span>
                    <span
                      v-if="imp.expected_gain_ru"
                      class="text-muted-foreground/70 normal-case tracking-normal"
                    >{{ imp.expected_gain_ru }}</span>
                  </div>
                  <p class="text-xs leading-relaxed text-foreground">{{ imp.action_ru }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
