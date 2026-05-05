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
