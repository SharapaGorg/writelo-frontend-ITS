import { computed, ref } from 'vue'
import { ApiController } from '~/scripts/shared/api/controller'
import type { PromoCodePricePreviewDto } from '~/scripts/shared/types/payment'

const PROMO_INVALID_FALLBACK = 'Промокод недействителен или не может быть применён.'

export function usePromoCode() {
  const api = new ApiController()

  const code = ref('')
  const appliedCode = ref<string | null>(null)
  const previews = ref<PromoCodePricePreviewDto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const previewBySubscriptionId = computed(() => {
    const map = new Map<number, PromoCodePricePreviewDto>()
    for (const p of previews.value) map.set(p.subscriptionId, p)
    return map
  })

  const isApplied = computed(() => !!appliedCode.value)
  const hasAnyApplicable = computed(() =>
    previews.value.some(p => p.applicable && p.discountAmount > 0),
  )

  function previewFor(subscriptionId: number): PromoCodePricePreviewDto | undefined {
    return previewBySubscriptionId.value.get(subscriptionId)
  }

  function codeForSubscription(subscriptionId: number): string | null {
    if (!appliedCode.value) return null
    const preview = previewBySubscriptionId.value.get(subscriptionId)
    return preview?.applicable ? appliedCode.value : null
  }

  async function apply(rawCode?: string): Promise<boolean> {
    // Canonicalise to uppercase so the same code shape goes to the backend
    // regardless of casing in URL/input. Backend matches case-insensitively,
    // but we want input display, applied code, and createPayment payload to
    // all agree.
    const trimmed = (rawCode ?? code.value).trim().toUpperCase()
    if (!trimmed) {
      clear()
      return false
    }

    isLoading.value = true
    error.value = null
    try {
      const result = await api.previewPromoCodePrices(trimmed)
      previews.value = result ?? []
      appliedCode.value = trimmed
      code.value = trimmed
      return true
    } catch (e: any) {
      const serverMsg =
        e?.data?.detail || e?.data?.details || e?.data?.message
      error.value = typeof serverMsg === 'string' && serverMsg
        ? serverMsg
        : PROMO_INVALID_FALLBACK
      previews.value = []
      appliedCode.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    code.value = ''
    appliedCode.value = null
    previews.value = []
    error.value = null
  }

  return {
    code,
    appliedCode,
    previews,
    isLoading,
    error,
    isApplied,
    hasAnyApplicable,
    previewFor,
    codeForSubscription,
    apply,
    clear,
  }
}

export type PromoCodeState = ReturnType<typeof usePromoCode>
