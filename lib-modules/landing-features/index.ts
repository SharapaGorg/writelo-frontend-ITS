export { default as FeaturePageShell } from './components/FeaturePageShell.vue'
export { default as FeatureHero } from './components/FeatureHero.vue'
export { default as FeatureSection } from './components/FeatureSection.vue'
export { default as FeatureSteps } from './components/FeatureSteps.vue'
export { default as FeatureUseCases } from './components/FeatureUseCases.vue'
export { default as FeatureParamsTable } from './components/FeatureParamsTable.vue'
export { default as FeatureLimitsTable } from './components/FeatureLimitsTable.vue'
export { default as FeatureFaq } from './components/FeatureFaq.vue'
export { default as FeatureFinalCta } from './components/FeatureFinalCta.vue'

export { buildFeaturePageSchema, featureCanonical } from './helpers/seo'

export type {
  FeaturePageMeta,
  FeatureUseCaseItem,
  FeatureStepItem,
  FeatureParamRow,
  FeatureLimitRow,
  FeatureFaqItem,
} from './types'
