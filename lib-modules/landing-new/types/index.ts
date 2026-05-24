export interface SectionHeaderProps {
  label: string
  title?: string
  withRule?: boolean
  /** When set, renders an inline "open detail page" icon-link next to the heading. */
  detailUrl?: string
  /** Section name used for analytics + aria-label fallback. */
  detailSection?: string
  /** aria-label override for the detail link. */
  detailLabel?: string
}

export type PriceCardCtaAction = 'signup'

export type PriceCardTier = 'free' | 'pro'

export interface PriceCardCta {
  label: string
  action: PriceCardCtaAction
}

export interface PriceCardProps {
  tier: PriceCardTier
  name: string
  description: string
  price: string
  period?: string
  features: string[]
  cta: PriceCardCta
  highlighted?: boolean
}
