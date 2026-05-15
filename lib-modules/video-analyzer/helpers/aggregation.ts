// Frontend aggregation of v2 content axes into pillar scores and the overall
// Reel Score. The backend never sends aggregates — it returns raw axes only,
// and the weights live here so we can tune them without a redeploy of the
// analyzer service.

import type {
  AxisKey,
  AxisLevel,
  AxisDto,
  AxesShape,
  PillarKey,
  PillarScore,
  ReelScoreResult,
} from '../types'

// ---- Static config (tuneable) ---------------------------------------------

export interface PillarDef {
  key: PillarKey
  label: string
  weight: number
  axes: AxisKey[]
}

export const PILLAR_DEFS: ReadonlyArray<PillarDef> = [
  {
    key: 'content_pull',
    label: 'Контент-притяжение',
    weight: 0.45,
    axes: ['hook', 'retention', 'storytelling', 'structure', 'loop'],
  },
  {
    key: 'engagement_triggers',
    label: 'Триггеры вовлечения',
    weight: 0.20,
    axes: ['save_worthiness', 'comment_trigger'],
  },
  {
    key: 'author_and_craft',
    label: 'Автор и ремесло',
    weight: 0.25,
    axes: ['persona', 'voice', 'aesthetic', 'production'],
  },
  {
    key: 'funnel',
    label: 'Воронка',
    weight: 0.10,
    axes: ['cta'],
  },
]

export const AXIS_LABELS: Record<AxisKey, string> = {
  hook: 'Хук',
  retention: 'Удержание',
  storytelling: 'Сторителлинг',
  structure: 'Структура',
  save_worthiness: 'Сохраняемость',
  comment_trigger: 'Триггер комментариев',
  loop: 'Закольцованность',
  persona: 'Персона',
  voice: 'Подача',
  aesthetic: 'Эстетика',
  production: 'Технический пол',
  cta: 'Призыв к действию',
}

export const LEVEL_LABELS: Record<AxisLevel, string> = {
  poor: 'низко',
  average: 'средне',
  good: 'хорошо',
  excellent: 'отлично',
}

// Bottleneck rule from the spec: if either the hook or the production floor
// is broken, no amount of other strengths saves the reel — cap at 50.
export const BOTTLENECK_AXES: ReadonlyArray<AxisKey> = ['hook', 'production']
export const BOTTLENECK_THRESHOLD = 30
export const BOTTLENECK_CAP = 50

// ---- Pure helpers ---------------------------------------------------------

export function scoreToLevel(score: number | null | undefined): AxisLevel | null {
  if (score === null || score === undefined) return null
  if (score < 40) return 'poor'
  if (score < 60) return 'average'
  if (score < 80) return 'good'
  return 'excellent'
}

// Tailwind-friendly tones — keyed off level. Sites pick whichever variant fits.
export interface LevelTone {
  text: string
  bg: string
  ring: string
  bar: string
}

export const LEVEL_TONES: Record<AxisLevel, LevelTone> = {
  poor: {
    text: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100 dark:bg-rose-950/40',
    ring: 'ring-rose-300/60 dark:ring-rose-800/60',
    bar: 'bg-rose-500',
  },
  average: {
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    ring: 'ring-amber-300/60 dark:ring-amber-800/60',
    bar: 'bg-amber-500',
  },
  good: {
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    ring: 'ring-emerald-300/60 dark:ring-emerald-800/60',
    bar: 'bg-emerald-500',
  },
  excellent: {
    text: 'text-brand',
    bg: 'bg-brand/10',
    ring: 'ring-brand/30',
    bar: 'bg-brand',
  },
}

function pickAxis(axes: AxesShape, key: AxisKey): AxisDto | null {
  const value = axes[key]
  if (!value) return null
  // Treat axis-not-applicable (score === null) as missing for aggregation.
  if (value.score === null || value.score === undefined) return null
  return value
}

// Pillar score = simple mean of non-null axis scores. Null axes are excluded
// from the denominator (spec: "null-оси исключаются из знаменателя").
export function computePillarScore(axes: AxesShape, def: PillarDef): PillarScore {
  const contributing: AxisKey[] = []
  let sum = 0
  for (const axisKey of def.axes) {
    const axis = pickAxis(axes, axisKey)
    if (axis && typeof axis.score === 'number') {
      contributing.push(axisKey)
      sum += axis.score
    }
  }
  if (contributing.length === 0) {
    return { key: def.key, score: null, weight: def.weight, axes: [] }
  }
  return {
    key: def.key,
    score: Math.round(sum / contributing.length),
    weight: def.weight,
    axes: contributing,
  }
}

// Overall Reel Score = weight-renormalised average over the pillars that have
// at least one contributing axis. Applies the bottleneck cap from the spec.
export function computeReelScore(axes: AxesShape): ReelScoreResult {
  const pillars = PILLAR_DEFS.map(def => computePillarScore(axes, def))

  let weighted = 0
  let weightSum = 0
  for (const p of pillars) {
    if (p.score === null) continue
    weighted += p.score * p.weight
    weightSum += p.weight
  }
  if (weightSum === 0) {
    return { overall: null, capped: false, pillars }
  }

  let overall = Math.round(weighted / weightSum)
  let capped = false
  for (const key of BOTTLENECK_AXES) {
    const axis = axes[key]
    if (axis && typeof axis.score === 'number' && axis.score < BOTTLENECK_THRESHOLD) {
      if (overall > BOTTLENECK_CAP) {
        overall = BOTTLENECK_CAP
        capped = true
      }
      break
    }
  }
  return { overall, capped, pillars }
}

// Counts of non-null axes by level, for at-a-glance summary chips.
export function levelCounts(axes: AxesShape): Record<AxisLevel, number> {
  const out: Record<AxisLevel, number> = { poor: 0, average: 0, good: 0, excellent: 0 }
  for (const key of Object.keys(axes) as AxisKey[]) {
    const axis = axes[key]
    if (!axis || axis.score === null || axis.score === undefined) continue
    const level = axis.level ?? scoreToLevel(axis.score)
    if (level) out[level]++
  }
  return out
}
