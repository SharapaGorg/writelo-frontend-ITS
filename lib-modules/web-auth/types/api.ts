import type { AuthSessionDto } from '~/scripts/shared/types/workspace'

/**
 * Auth response types
 * All auth endpoints now return AuthSessionDto with token and user
 */

// Signup returns auth session with user
export type AuthEmailSignup = AuthSessionDto

// Signin returns auth session with user
export type AuthEmailSignin = AuthSessionDto

// Google signin returns auth session with user
export type AuthGoogleSignin = AuthSessionDto

// Google link returns nothing (empty success response)
export type AuthGoogleLink = void

// Google unlink returns nothing
export type AuthGoogleUnlink = void

// Telegram auth data (unchanged - this is the input to signin)
export type TelegramAuthData = {
    id: number
    firstName: string
    lastName?: string
    username?: string
    photoUrl?: string
    authDate: number
    hash: string
}

// Telegram signin returns auth session with user
export type AuthTelegramSignin = AuthSessionDto

// Telegram link returns nothing
export type AuthTelegramLink = void

// OAuth provider enum (matches backend values)
export enum OAuthProvider {
    Telegram = 0,
    Google = 1,
    Yandex = 2
}

// Yandex signin returns auth session with user
export type AuthYandexSignin = AuthSessionDto

// Email verification returns auth session
export type AuthVerifyEmail = AuthSessionDto

// Reset password returns auth session
export type AuthResetPassword = AuthSessionDto
