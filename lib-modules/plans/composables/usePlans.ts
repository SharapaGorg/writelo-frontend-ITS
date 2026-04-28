import { computed } from 'vue'
import type { SubscriptionType } from '~/scripts/shared/types/common'

export function isBusinessSubscription(sub: Pick<SubscriptionType, 'type'> | null | undefined): boolean {
  return sub?.type === 'business'
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

  const isBusinessPlan = computed(() => isBusinessSubscription($settings.getSubscription()))

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
