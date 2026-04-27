import { computed } from 'vue'
import type { SubscriptionType } from '~/scripts/shared/types/common'

const BUSINESS_TITLE_PATTERNS = ['business', 'team', 'команд', 'аген'] as const

export function matchesBusinessPlan(title: string | null | undefined): boolean {
  if (!title) return false
  const lower = title.toLowerCase()
  return BUSINESS_TITLE_PATTERNS.some(p => lower.includes(p))
}

export function usePlans() {
  const $settings = useSettings()

  const plans = computed<SubscriptionType[]>(() => $settings.getConfig()?.subscriptions ?? [])
  const currentPlanId = computed<number | null>(() => $settings.getSubscription()?.id ?? null)
  const loaded = computed(() => $settings.loaded.value)

  const popularPlanId = computed<number | null>(() => {
    const sorted = [...plans.value].sort((a, b) => a.price - b.price)
    if (sorted.length < 3) return null
    return sorted[Math.floor(sorted.length / 2)].id
  })

  const isBusinessPlan = computed(() => matchesBusinessPlan($settings.getSubscription()?.title))

  const isCurrentPlan = (id: number) => currentPlanId.value === id
  const isPopularPlan = (id: number) => popularPlanId.value === id

  return {
    plans,
    currentPlanId,
    popularPlanId,
    loaded,
    isBusinessPlan,
    isCurrentPlan,
    isPopularPlan,
  }
}
