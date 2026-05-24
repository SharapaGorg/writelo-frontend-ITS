export interface FeaturePageMeta {
  /** Slug without leading slash, e.g. 'poisk-trendov-v-instagrame'. */
  slug: string
  /** Human page title for breadcrumb / `<title>` derivation. */
  shortTitle: string
  /** SEO `<title>`. */
  seoTitle: string
  /** Meta description (≤ 160 chars). */
  description: string
  /** Comma-separated keywords. */
  keywords: string
  /** OG title (defaults to seoTitle if omitted). */
  ogTitle?: string
}

export interface FeatureUseCaseItem {
  badge: string
  title: string
  body: string
}

export interface FeatureStepItem {
  title: string
  body: string
}

export interface FeatureParamRow {
  name: string
  values: string
  note?: string
}

export interface FeatureLimitRow {
  feature: string
  free: string
  pro: string
  business: string
}

export interface FeatureFaqItem {
  question: string
  answer: string
}
