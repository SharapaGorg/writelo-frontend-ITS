export type PaymentSessionDto = {
    paymentId: number
    provider: string
    subscriptionId: number
    checkoutUrl: string
    status: string
    isGift: boolean
    originalAmount?: number
    discountAmount?: number
    finalAmount?: number
    promoCode?: string | null
}

export type PromoCodePricePreviewDto = {
    subscriptionId: number
    originalPrice: number
    discountAmount: number
    finalPrice: number
    applicable: boolean
}

export enum PaymentProvider {
    tinkoff = 'tinkoff',
    cryptoBot = 'crypto_bot',
    stars = "stars"
}