export type CreatePaymentType = {
    url: string
}

export enum PaymentProvider {
    tinkoff = 'tinkoff',
    cryptoBot = 'crypto_bot',
    stars = "stars"
}