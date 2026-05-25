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
  /** Backend promo-preview snapshot. When `applicable` and `discountAmount > 0`,
   *  the card swaps the marketing price for the real final/original numbers. */
  promoPreview?: {
    originalPrice: number
    discountAmount: number
    finalPrice: number
    applicable: boolean
  } | null
}
