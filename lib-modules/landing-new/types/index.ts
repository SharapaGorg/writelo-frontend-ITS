export interface SectionHeaderProps {
  label: string
  title?: string
  withRule?: boolean
}

export type PriceCardCtaAction = 'signup' | 'demo'

export type PriceCardTier = 'free' | 'pro' | 'business'

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
