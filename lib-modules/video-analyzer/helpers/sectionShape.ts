// Shape detectors for analyser section payloads. Each `is*` returns true
// when the value carries enough fields to render — sections fall back to
// `RawJsonViewer` for anything we don't recognise.

import type {
  SummaryShape,
  HooksShape,
  StructureShape,
  StructureStep,
  FunnelShape,
  TagsShape,
  ImprovementsShape,
  TranscriptionShape,
  SummaryShapeV2,
  HooksShapeV2,
  StructureShapeV2,
  StructureStepV2,
  FunnelShapeV2,
  TranscriptionShapeV2,
  AxesShape,
  AxisDto,
  AxisLevel,
  AxisKey,
  ImprovementsShapeV2,
  ImprovementItemV2,
  ImprovementPriority,
  ViralDriverDto,
} from '../types'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isStr = (v: unknown): v is string => typeof v === 'string'

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isStr)

// === Summary ===

export function isSummaryShape(v: unknown): v is SummaryShape {
  if (!isObject(v)) return false
  return isStr(v.essence_ru) || isStr(v.video_topic_ru) || isStr(v.video_description_ru)
}

// === Hooks ===

export function isHooksShape(v: unknown): v is HooksShape {
  if (!isObject(v)) return false
  return isStr(v.text_hook_ru) || isStr(v.hook_phrase_ru) || isStr(v.visual_hook_ru)
}

// === Structure ===

function isStructureStep(v: unknown): v is StructureStep {
  if (!isObject(v)) return false
  return isStr(v.title_ru) || isStr(v.details_ru) || isStr(v.timing)
}

export function isStructureShape(v: unknown): v is StructureShape {
  if (!isObject(v)) return false
  const entries = Object.entries(v)
  if (!entries.length) return false
  return entries.some(([k, val]) => /^step\d+$/i.test(k) && isStructureStep(val))
}

// Returns ordered [key, step] pairs. Sorts by numeric suffix in the key.
export function orderedStructureSteps(shape: StructureShape): Array<[string, StructureStep]> {
  return Object.entries(shape)
    .filter(([k, v]) => /^step\d+$/i.test(k) && isStructureStep(v))
    .sort(([a], [b]) => {
      const an = Number(a.replace(/\D/g, '')) || 0
      const bn = Number(b.replace(/\D/g, '')) || 0
      return an - bn
    })
}

// === Funnel ===

export function isFunnelShape(v: unknown): v is FunnelShape {
  if (!isObject(v)) return false
  return (
    typeof v.lead_magnet === 'boolean'
    || isStr(v.cta_voice_visual_ru)
    || isStr(v.traffic_destination)
  )
}

// === Tags ===

export function isTagsShape(v: unknown): v is TagsShape {
  if (!isObject(v)) return false
  return isStringArray(v.niches) || isStringArray(v.formats)
}

// === Improvements ===

const IMPROVEMENT_KEYS: ReadonlyArray<keyof ImprovementsShape> = [
  'quick_fixes_ru',
  'caption_ideas_ru',
  'hook_improvements_ru',
  'funnel_improvements_ru',
  'structure_improvements_ru',
]

export function isImprovementsShape(v: unknown): v is ImprovementsShape {
  if (!isObject(v)) return false
  return IMPROVEMENT_KEYS.some(k => isStringArray(v[k as string]))
}

// === Transcription ===

export function isTranscriptionShape(v: unknown): v is TranscriptionShape {
  if (!isObject(v)) return false
  return isStr(v.text_ru) || isStr(v.text_original) || isStr(v.on_screen_text)
}

// ====================================================================
// v2 shape detectors. Routed by VideoAnalysisDetail before falling
// back to v1 → RawJsonViewer.
// ====================================================================

const isNullableStr = (v: unknown): v is string | null | undefined =>
  v === null || v === undefined || isStr(v)

// --- Summary v2 ---

export function isSummaryShapeV2(v: unknown): v is SummaryShapeV2 {
  if (!isObject(v)) return false
  // Distinct from v1: topic_ru / short_description_ru replace
  // video_topic_ru / video_description_ru.
  return isStr(v.topic_ru) || isStr(v.short_description_ru)
    || (isStr(v.essence_ru) && !isStr((v as Record<string, unknown>).video_topic_ru))
}

// --- Hooks v2 ---

export function isHooksShapeV2(v: unknown): v is HooksShapeV2 {
  if (!isObject(v)) return false
  // spoken_hook_* keys are v2-specific. v1 uses hook_phrase_ru.
  return isStr(v.spoken_hook_ru) || isStr(v.spoken_hook_original)
    || (isStr(v.text_hook_ru) && !isStr((v as Record<string, unknown>).hook_phrase_ru))
    || (isStr(v.visual_hook_ru) && !isStr((v as Record<string, unknown>).hook_phrase_ru))
}

// --- Structure v2 (array form) ---

function isStructureStepV2(v: unknown): v is StructureStepV2 {
  if (!isObject(v)) return false
  return isStr(v.label) || isStr(v.step_ru)
}

export function isStructureShapeV2(v: unknown): v is StructureShapeV2 {
  if (!Array.isArray(v) || v.length === 0) return false
  return v.every(isStructureStepV2)
}

// --- Funnel v2 ---

export function isFunnelShapeV2(v: unknown): v is FunnelShapeV2 {
  if (!isObject(v)) return false
  // Split CTA fields are v2-only. v1 has cta_voice_visual_ru.
  return isStr(v.cta_voice_ru) || isStr(v.cta_visual_ru)
    || (typeof v.lead_magnet === 'boolean'
        && !isStr((v as Record<string, unknown>).cta_voice_visual_ru)
        && (isStr(v.traffic_destination) || v.traffic_destination === null))
}

// --- Transcription v2 ---

export function isTranscriptionShapeV2(v: unknown): v is TranscriptionShapeV2 {
  if (!isObject(v)) return false
  // `speech` is the v2 marker; v1 uses text_ru. source_language replaces language.
  return isNullableStr(v.speech) && (
    isStr(v.speech) || isStr(v.source_language)
    || isStr(v.on_screen_text_original)
    || ('speech' in v && !('text_ru' in v) && !('language' in v))
  )
}

// --- Axes (12) ---

const AXIS_KEYS: ReadonlyArray<AxisKey> = [
  'hook', 'retention', 'storytelling', 'structure',
  'save_worthiness', 'comment_trigger', 'loop',
  'persona', 'voice', 'aesthetic', 'production', 'cta',
]

const AXIS_LEVELS: ReadonlyArray<AxisLevel> = ['poor', 'average', 'good', 'excellent']

function isAxisDto(v: unknown): v is AxisDto {
  if (!isObject(v)) return false
  const scoreOk = v.score === null || (typeof v.score === 'number' && v.score >= 1 && v.score <= 100)
  const levelOk = v.level === null || (typeof v.level === 'string' && AXIS_LEVELS.includes(v.level as AxisLevel))
  return scoreOk && levelOk
}

export function isAxesShape(v: unknown): v is AxesShape {
  if (!isObject(v)) return false
  // At least one known axis with a valid dto shape.
  return AXIS_KEYS.some(k => k in v && isAxisDto(v[k as string]))
}

export function axisKeys(): ReadonlyArray<AxisKey> {
  return AXIS_KEYS
}

// --- Improvements v2 (flat array) ---

const PRIORITIES: ReadonlyArray<ImprovementPriority> = ['high', 'medium', 'low']

function isImprovementItemV2(v: unknown): v is ImprovementItemV2 {
  if (!isObject(v)) return false
  return isStr(v.axis) && isStr(v.action_ru)
    && typeof v.priority === 'string'
    && PRIORITIES.includes(v.priority as ImprovementPriority)
}

export function isImprovementsShapeV2(v: unknown): v is ImprovementsShapeV2 {
  if (!Array.isArray(v)) return false
  if (v.length === 0) return true // empty array is allowed by spec
  return v.every(isImprovementItemV2)
}

// Sort improvements: high → medium → low, then largest gap (79 - current_score) desc.
const PRIORITY_ORDER: Record<ImprovementPriority, number> = { high: 0, medium: 1, low: 2 }

export function sortedImprovementsV2(items: ImprovementsShapeV2): ImprovementsShapeV2 {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority as ImprovementPriority] ?? 99
    const pb = PRIORITY_ORDER[b.priority as ImprovementPriority] ?? 99
    if (pa !== pb) return pa - pb
    const ga = 79 - (a.current_score ?? 79)
    const gb = 79 - (b.current_score ?? 79)
    return gb - ga
  })
}

// --- Viral drivers ---

function isViralDriverDto(v: unknown): v is ViralDriverDto {
  if (!isObject(v)) return false
  return isStr(v.driver)
}

export function isViralDriversArray(v: unknown): v is ViralDriverDto[] {
  if (!Array.isArray(v) || v.length === 0) return false
  return v.every(isViralDriverDto)
}
