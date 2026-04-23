export type PaymentSessionDto = {
    paymentId: number
    provider: string
    subscriptionId: number
    checkoutUrl: string
    status: string
    isGift: boolean
}

export enum PaymentProvider {
    tinkoff = 'tinkoff',
    cryptoBot = 'crypto_bot',
    stars = "stars"
}