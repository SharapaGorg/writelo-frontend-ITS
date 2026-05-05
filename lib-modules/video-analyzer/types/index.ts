// Mirrors of OpenAPI v1-4.05 schemas for the short-video analyzer module.
//
// Section payloads are typed as `unknown` (the spec uses `JsonElement`).
// Real shapes were reverse-engineered from production output — see the
// `*Shape` interfaces below. Section components run a shape detector and
// fall back to `RawJsonViewer` when nothing matches.

export type SocialVideoPlatform = 'youtube' | 'tiktok' | 'instagram'

export type ShortVideoAnalysisStatus = 'processing' | 'completed' | 'failed'

export interface ShortVideoAnalysisHistoryItemDto {
  id: string
  socialVideoEntryId: string
  shortVideoAnalysisId: string | null
  platform: SocialVideoPlatform
  originalUrl: string
  normalizedUrl: string
  status: ShortVideoAnalysisStatus
  errorCode: string | null
  errorMessage: string | null
  requestedAt: string
  completedAt: string | null
}

export interface ShortVideoAnalysisDto {
  id: string
  socialVideoEntryId: string
  platform: SocialVideoPlatform
  originalUrl: string
  normalizedUrl: string
  // .NET emits int32 as `integer | string`; cast at read time.
  analyzerVersion: number | string
  model: string
  status: ShortVideoAnalysisStatus
  analyzedAt: string | null
  transcription: unknown | null
  summary: unknown | null
  tags: unknown | null
  structure: unknown | null
  hooks: unknown | null
  funnel: unknown | null
  improvements: unknown | null
  diagnostics: string | null
}

// === Section shapes ===

export interface SummaryShape {
  essence_ru?: string
  video_topic_ru?: string
  video_description_ru?: string
}

export interface HooksShape {
  text_hook_ru?: string
  hook_phrase_ru?: string
  visual_hook_ru?: string
}

export interface StructureStep {
  timing?: string
  title_ru?: string
  details_ru?: string
}

// step1 / step2 / step3 / ... — order taken from key suffix.
export type StructureShape = Record<string, StructureStep>

export interface FunnelShape {
  lead_magnet?: boolean
  cta_voice_visual_ru?: string
  traffic_destination?: string
}

export interface TagsShape {
  niches?: string[]
  formats?: string[]
}

export interface ImprovementsShape {
  quick_fixes_ru?: string[]
  caption_ideas_ru?: string[]
  hook_improvements_ru?: string[]
  funnel_improvements_ru?: string[]
  structure_improvements_ru?: string[]
}

export interface TranscriptionShape {
  text_ru?: string
  text_original?: string
  on_screen_text?: string
  language?: string
  // Backend sometimes serialises `null` as the literal string "null".
  unclear_parts?: string | null
}
