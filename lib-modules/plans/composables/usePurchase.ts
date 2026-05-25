import { ref } from 'vue'
import { ApiController } from '~/scripts/shared/api/controller'
import { PaymentProvider } from '~/scripts/shared/types/payment'
import { toastError } from '~/scripts/features/utils/toater'

export type PurchaseMode = 'self' | 'gift'

export type PurchaseOptions = {
  subscriptionId: number
  mode?: PurchaseMode
  promoCode?: string | null
  /**
   * Force same-tab navigation instead of trying to open a popup.
   * Used by auto-checkout flows where we just landed after a redirect
   * and there's no real user gesture to authorize the popup.
   */
  forceSameTab?: boolean
}

export function usePurchase() {
  const api = new ApiController()
  const isPurchasing = ref(false)

  async function purchase(opts: PurchaseOptions): Promise<boolean> {
    if (isPurchasing.value) return false
    isPurchasing.value = true
    try {
      const session = await api.createPayment(
        opts.subscriptionId,
        PaymentProvider.tinkoff,
        opts.mode === 'gift',
        opts.promoCode ?? null,
      )

      if (opts.forceSameTab) {
        window.location.href = session.checkoutUrl
        return true
      }

      const popup = window.open(
        session.checkoutUrl,
        'writelo-pay',
        'popup=yes,width=520,height=720',
      )
      if (!popup || popup.closed) window.location.href = session.checkoutUrl
      return true
    } catch (e) {
      console.error('createPayment failed', e)
      toastError('Не удалось создать платёж, попробуйте позже')
      return false
    } finally {
      isPurchasing.value = false
    }
  }

  return { purchase, isPurchasing }
}
