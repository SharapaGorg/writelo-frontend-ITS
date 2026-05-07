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
