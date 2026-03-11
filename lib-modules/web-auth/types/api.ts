export type AuthEmailSignup = {
    token: string
}

export type AuthEmailSignin = AuthEmailSignup

export type AuthGoogleSignin = AuthEmailSignup

export type AuthGoogleLink = null;
export type AuthGoogleUnlink = null;

export type TelegramAuthData = {
    id: number
    firstName: string
    lastName?: string
    username?: string
    photoUrl?: string
    authDate: number
    hash: string
}

export type AuthTelegramSignin = AuthEmailSignup
export type AuthTelegramLink = null;

export enum OAuthProvider {
    Telegram = 0,
    Google = 1,
    Yandex = 2
}
