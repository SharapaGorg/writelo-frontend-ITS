import { computed } from 'vue'

export interface BriefPreset {
  key: string
  label: string
  value: string
}

export function useBriefPresets() {
  const { t } = useI18n()

  const nichePresets = computed<BriefPreset[]>(() => [
    { key: 'beauty', label: t('addClient.niches.beautySalon'), value: t('addClient.niches.beautySalon') },
    { key: 'auto', label: t('addClient.niches.autoService'), value: t('addClient.niches.autoService') },
    { key: 'coffee', label: t('addClient.niches.coffeeShop'), value: t('addClient.niches.coffeeShop') },
    { key: 'fitness', label: t('addClient.niches.fitness'), value: t('addClient.niches.fitness') },
    { key: 'clothing', label: t('addClient.niches.clothingStore'), value: t('addClient.niches.clothingStore') },
    { key: 'restaurant', label: t('addClient.niches.restaurant'), value: t('addClient.niches.restaurant') },
    { key: 'dental', label: t('addClient.niches.dental'), value: t('addClient.niches.dental') },
    { key: 'realestate', label: t('addClient.niches.realEstate'), value: t('addClient.niches.realEstate') },
  ])

  const stylePresets = computed<BriefPreset[]>(() => [
    { key: 'friendly', label: t('addClient.styles.friendly'), value: t('addClient.styles.friendlyDesc') },
    { key: 'formal', label: t('addClient.styles.formal'), value: t('addClient.styles.formalDesc') },
    { key: 'expert', label: t('addClient.styles.expert'), value: t('addClient.styles.expertDesc') },
    { key: 'provocative', label: t('addClient.styles.provocative'), value: t('addClient.styles.provocativeDesc') },
  ])

  return { nichePresets, stylePresets }
}
