// Public surface of the video-analyzer module. Pages import from here only.

export { default as VideoAnalyzerPage } from './components/VideoAnalyzerPage.vue'
export { default as VideoAnalysisDetail } from './components/VideoAnalysisDetail.vue'

// Section renderers — exposed for showcases / external embeds. Each accepts
// `value: unknown` and falls back to RawJsonViewer when the shape doesn't match.
export { default as SummarySection } from './components/sections/SummarySection.vue'
export { default as HooksSection } from './components/sections/HooksSection.vue'
export { default as StructureSection } from './components/sections/StructureSection.vue'
export { default as FunnelSection } from './components/sections/FunnelSection.vue'
export { default as TagsSection } from './components/sections/TagsSection.vue'
export { default as ImprovementsSection } from './components/sections/ImprovementsSection.vue'
export { default as TranscriptionSection } from './components/sections/TranscriptionSection.vue'
export { default as AxesSection } from './components/sections/AxesSection.vue'
export { default as ViralDriversSection } from './components/sections/ViralDriversSection.vue'
export { default as PlatformIcon } from './components/PlatformIcon.vue'

export {
  computeReelScore,
  computePillarScore,
  scoreToLevel,
  levelCounts,
  AXIS_LABELS,
  LEVEL_LABELS,
  LEVEL_TONES,
  PILLAR_DEFS,
  BOTTLENECK_AXES,
  BOTTLENECK_THRESHOLD,
  BOTTLENECK_CAP,
} from './helpers/aggregation'

export { useVideoAnalyzer } from './composables/useVideoAnalyzer'
export { useAnalysisLimits } from './composables/useAnalysisLimits'
export { useVideoAnalyzerApi, VideoAnalyzerApiController } from './helpers/api'
export { useVideoAnalyzerStore } from './stores/videoAnalyzerStore'

export * from './types'
