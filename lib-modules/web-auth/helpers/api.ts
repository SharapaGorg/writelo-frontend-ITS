import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod } from '~/scripts/shared/types'
import type {
    AuthEmailSignin,
    AuthEmailSignup,
    AuthGoogleLink,
    AuthGoogleSignin,
    AuthGoogleUnlink,
    AuthTelegramSignin,
    AuthTelegramLink,
    AuthVerifyEmail,
    AuthResetPassword,
    TelegramAuthData,
} from '~/lib-modules/web-auth'

/**
 * Auth API Controller
 * Handles authentication endpoints for the new Writelo API
 */
export class AuthApiController extends ApiController {
    constructor() {
        super();
    }

    /**
     * Sign up with email/password
     * Returns AuthSessionDto with token and user
     */
    signupEmail(email: string, name: string, password: string): Promise<AuthEmailSignup> {
        return this.request(ApiAliases.authSignup, RequestMethod.POST, {
            email, name, password
        })
    }

    /**
     * Sign in with email/password
     * Returns AuthSessionDto with token and user
     */
    signinEmail(email: string, password: string): Promise<AuthEmailSignin> {
        return this.request(ApiAliases.authSignin, RequestMethod.POST, {
            email, password
        })
    }

    /**
     * Sign in with Google OAuth
     * Returns AuthSessionDto with token and user
     */
    signinGoogle(idToken: string): Promise<AuthGoogleSignin> {
        return this.request(ApiAliases.authGoogle, RequestMethod.POST, { idToken })
    }

    /**
     * Link Google account to current user
     */
    linkGoogle(idToken: string): Promise<AuthGoogleLink> {
        return this.request(ApiAliases.meLinkGoogle, RequestMethod.POST, { idToken })
    }

    /**
     * Sign in with Telegram OAuth
     * Returns AuthSessionDto with token and user
     */
    signinTelegram(data: TelegramAuthData): Promise<AuthTelegramSignin> {
        return this.request(ApiAliases.authTelegram, RequestMethod.POST, data)
    }

    /**
     * Link Telegram account to current user
     */
    linkTelegram(data: TelegramAuthData): Promise<AuthTelegramLink> {
        return this.request(ApiAliases.meLinkTelegram, RequestMethod.POST, data)
    }

    /**
     * Unlink OAuth provider from current user
     */
    unlinkProvider(provider: 'google' | 'telegram' | 'yandex'): Promise<AuthGoogleUnlink> {
        return this.request(`${ApiAliases.meUnlink}/${provider}`, RequestMethod.POST)
    }

    /**
     * Verify email address with token
     * Returns AuthSessionDto with token and user
     */
    verifyEmail(token: string): Promise<AuthVerifyEmail> {
        return this.request(ApiAliases.authVerify, RequestMethod.POST, { token })
    }

    /**
     * Resend verification email
     */
    resendVerificationEmail(email: string): Promise<void> {
        return this.request(ApiAliases.authResendVerification, RequestMethod.POST, { email })
    }

    /**
     * Request password reset email
     */
    forgotPassword(email: string): Promise<void> {
        return this.request(ApiAliases.authForgotPassword, RequestMethod.POST, { email })
    }

    /**
     * Reset password with token
     * Returns AuthSessionDto with token and user
     */
    resetPassword(token: string, newPassword: string): Promise<AuthResetPassword> {
        return this.request(ApiAliases.authResetPassword, RequestMethod.POST, { token, newPassword })
    }

    // === Profile email change methods (authenticated) ===

    /**
     * Request email change (sends verification to new email)
     */
    requestEmailChange(newEmail: string): Promise<void> {
        return this.request(ApiAliases.meEmailChange, RequestMethod.POST, { newEmail })
    }

    /**
     * Resend email change verification
     */
    resendEmailChange(): Promise<void> {
        return this.request(ApiAliases.meEmailResend, RequestMethod.POST)
    }

    /**
     * Cancel pending email change
     */
    override cancelEmailChange(): Promise<void> {
        return this.request(ApiAliases.meEmailPending, RequestMethod.DELETE)
    }
}