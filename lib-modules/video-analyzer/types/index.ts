// Mirrors of the public-API short-video analyzer schemas.
//
// Section payloads (`transcription`, `summary`, `tags`, …) are stored as raw
// JSON on the backend and surface here as `unknown`. Real shapes are
// reverse-engineered into the `*Shape` interfaces below; section components
// run a shape detector and fall back to `RawJsonViewer` when nothing matches.

export type SocialVideoPlatform = 'youtube' | 'tiktok' | 'instagram'

export type ShortVideoAnalysisStatus = 'processing' | 'completed' | 'failed'

// Stable public localization keys for short-video / social-video failures.
// Backend maps legacy/internal codes (fastsaver_*, brightdata_*, etc.) to
// these before they reach the frontend.
export type PublicShortVideoErrorCode =
  | 'error-short-video-analysis-not-allowed'
  | 'error-short-video-analysis-limit-reached'
  | 'error-short-video-analysis-unavailable'
  | 'error-short-video-analysis-failed'
  | 'error-social-video-unsupported-url'
  | 'error-social-video-too-long'
  | 'error-social-video-import-failed'
  | 'error-social-video-download-failed'
  | 'error-social-video-preview-failed'
  | 'error-social-video-missing-video'

// Signed asset URL — temporary; refetch the parent resource to get a fresh
// link. `objectId` is the stable identity for cache keys.
export interface SignedAssetDto {
  objectId: string
  url: string
  expiresAt: string
}

// Returned by POST /…/short-video-analyses/{id}/share. Idempotent: re-POSTing
// on an already-shared analysis returns the same token. No analogue for
// "is it shared?" exists — the frontend caches the response in-session and
// treats the absence of a cached token as "not shared this session".
export interface ShortVideoAnalysisShareDto {
  token: string
  publicPath: string
  createdAt: string
}

export interface ShortVideoAnalysisHistoryItemDto {
  id: string
  socialVideoEntryId: string
  shortVideoAnalysisId: string | null
  platform: SocialVideoPlatform
  title: string | null
  originalUrl: string
  normalizedUrl: string
  previewObjectId: string | null
  previewImage: SignedAssetDto | null
  status: ShortVideoAnalysisStatus
  errorCode: PublicShortVideoErrorCode | null
  errorMessage: string | null
  requestedAt: string
  completedAt: string | null
}

export interface ShortVideoAnalysisDto {
  id: string
  socialVideoEntryId: string
  platform: SocialVideoPlatform
  title: string | null
  originalUrl: string
  normalizedUrl: string
  previewObjectId: string | null
  previewImage: SignedAssetDto | null
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
  // v2-only blocks. Older analyses keep these as null.
  // Backend wire keys are snake_case (`content_axes`, `viral_drivers`,
  // `virality_summary_ru`) — readers go through `pickField` and tolerate
  // either casing.
  contentAxes?: unknown | null
  viralDrivers?: unknown | null
  viralitySummary?: string | null
  diagnostics: string | null
}

// === Taxonomy enums (snake_case, validated server-side) ===

export type ShortVideoLanguage = 'ru' | 'en' | 'other'

export type ShortVideoTrafficDestination =
  | 'instagram_profile_visit'
  | 'telegram_channel_redirect'
  | 'keyword_automation'
  | 'marketplace_search_target'
  | 'external_website_link'
  | 'algorithmic_views_only'
  | 'offline_visit'

export type ShortVideoFormat =
  | 'talking_head'
  | 'expert_explanation'
  | 'camera_monologue'
  | 'dialogue_qa'
  | 'interview_style'
  | 'roleplay_sketch'
  | 'storytelling'
  | 'pov_scenario'
  | 'lifehack_tutorial'
  | 'checklist_instruction'
  | 'top_n_selection'
  | 'screencast_demo'
  | 'product_review'
  | 'comparison_vs'
  | 'mistake_analysis'
  | 'myth_busting'
  | 'slide_show_infographic'
  | 'text_overlay_reading'
  | 'brand_aesthetic_match_cut'
  | 'satisfying_asmr'
  | 'caption_hook_short_loop'
  | 'comment_myth_reaction'
  | 'backstage_observation'
  | 'viral_meme'
  | 'viewer_address'
  | 'micro_lecture'
  | 'case_study_results'
  | 'before_after'

export type ShortVideoNiche =
  | 'finance_invest'
  | 'marketing_smm'
  | 'business_sales'
  | 'psychology_relations'
  | 'mindset_therapy'
  | 'education_languages'
  | 'mama_blogs'
  | 'beauty_health'
  | 'fitness_sport'
  | 'fashion_style'
  | 'law_taxes'
  | 'real_estate'
  | 'esoterics_astrology'
  | 'food_cooking'
  | 'home_interior'
  | 'travel_tourism'
  | 'lifestyle_blog'
  | 'pets_animals'
  | 'games_geek_culture'
  | 'music_art'
  | 'tattoos_piercing'
  | 'career_freelance'
  | 'cars_moto'
  | 'handmade_creativity'
  | 'kids_parenting'
  | 'tech_ai_news_tutorials'
  | 'ai_generated_art'
  | 'ai_avatars_digital_humans'
  | 'humor_sketches'
  | 'health_wellness'
  | 'nutrition'
  | 'medical_blogs'
  | 'dentistry'
  | 'self_development_productivity'
  | 'history_facts'
  | 'science'
  | 'politics_society'
  | 'tech_gadgets'
  | 'apps_digital_services'
  | 'garden_plants'
  | 'weddings_events'
  | 'photo_video'
  | 'content_making_blogging'
  | 'ecology_zero_waste'
  | 'spiritual_practices'
  | 'astrology'
  | 'crypto'
  | 'investments'
  | 'clothing_items'
  | 'restaurants_cafes_reviews'
  | 'graphic_design'
  | 'other'

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
  traffic_destination?: ShortVideoTrafficDestination | string
}

export interface TagsShape {
  niches?: (ShortVideoNiche | string)[]
  formats?: (ShortVideoFormat | string)[]
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
  language?: ShortVideoLanguage | string
  // Backend sometimes serialises `null` as the literal string "null".
  unclear_parts?: string | null
}

// === v2 section shapes ===

export type AnalyzerSchemaVersion = 'v1' | 'v2'

export interface SummaryShapeV2 {
  topic_ru?: string | null
  essence_ru?: string | null
  short_description_ru?: string | null
}

export interface HooksShapeV2 {
  spoken_hook_ru?: string | null
  spoken_hook_original?: string | null
  visual_hook_ru?: string | null
  text_hook_ru?: string | null
}

export interface StructureStepV2 {
  label?: string | null
  step_ru?: string | null
}

// v2 returns structure as a flat 3-item array (hook / main / ending).
export type StructureShapeV2 = StructureStepV2[]

export interface FunnelShapeV2 {
  cta_voice_ru?: string | null
  cta_visual_ru?: string | null
  traffic_destination?: ShortVideoTrafficDestination | string | null
  lead_magnet?: boolean | null
}

export interface TranscriptionShapeV2 {
  speech?: string | null
  source_language?: string | null
  on_screen_text?: string | null
  on_screen_text_original?: string | null
  unclear_parts?: string | null
}

// 12 content axes. Each axis is independent, score is 1..100 inside its level
// range (poor 1-39 / average 40-59 / good 60-79 / excellent 80-100), or null
// when the axis is not applicable for this video.

export type AxisLevel = 'poor' | 'average' | 'good' | 'excellent'

export type AxisKey =
  | 'hook'
  | 'retention'
  | 'storytelling'
  | 'structure'
  | 'save_worthiness'
  | 'comment_trigger'
  | 'loop'
  | 'persona'
  | 'voice'
  | 'aesthetic'
  | 'production'
  | 'cta'

export interface AxisDto {
  score: number | null
  // Backend wire name is `category` (snake-case raw JSON blob); the value
  // is the same AxisLevel enum used by improvements' `current_level`.
  category: AxisLevel | null
  analysis_ru?: string
}

export type AxesShape = Partial<Record<AxisKey, AxisDto>>

// Viral drivers (1-3, sorted strongest first).

export type ViralDriverKey =
  | 'curiosity_gap'
  | 'pattern_interrupt'
  | 'identity_relatability'
  | 'emotional_spike'
  | 'utility_save_worthy'
  | 'social_currency'
  | 'controversy_hot_take'
  | 'production_novelty'
  | 'loop_rewatch'

export interface ViralDriverDto {
  driver: ViralDriverKey | string
  driver_evidence_ru?: string | null
}

// v2 improvements are flat, axis-tied, with priority + expected gain.

export type ImprovementPriority = 'high' | 'medium' | 'low'

export interface ImprovementItemV2 {
  axis: AxisKey | string
  current_score?: number | null
  current_level?: AxisLevel | null
  expected_gain_ru?: string | null
  priority: ImprovementPriority | string
  action_ru: string
}

export type ImprovementsShapeV2 = ImprovementItemV2[]

// Pillar aggregation (frontend-computed).

export type PillarKey =
  | 'content_pull'
  | 'engagement_triggers'
  | 'author_and_craft'
  | 'funnel'

export interface PillarScore {
  key: PillarKey
  score: number | null  // null when all axes in this pillar are N/A
  weight: number        // weight used in the overall Reel Score
  axes: AxisKey[]       // axes that contribute (after null filtering)
}

export interface ReelScoreResult {
  overall: number | null
  capped: boolean
  pillars: PillarScore[]
}
