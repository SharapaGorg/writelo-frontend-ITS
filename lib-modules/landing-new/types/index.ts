export interface SectionHeaderProps {
  label: string
  title?: string
  withRule?: boolean
}

export type PriceCardCtaAction = 'signup' | 'demo'

export interface PriceCardCta {
  label: string
  action: PriceCardCtaAction
}

export interface PriceCardProps {
  name: string
  description: string
  price: string
  period?: string
  features: string[]
  cta: PriceCardCta
  highlighted?: boolean
}
