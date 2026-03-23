import {ApiController} from "~/scripts/shared/api/controller";
import {RequestMethod} from "~/scripts/shared/types";
import {
    type AuthEmailSignin,
    type AuthEmailSignup,
    type AuthGoogleLink,
    type AuthGoogleSignin,
    type AuthGoogleUnlink,
    type AuthTelegramSignin,
    type AuthTelegramLink,
    type TelegramAuthData,
    OAuthProvider
} from "~/lib-modules/web-auth";

export class AuthApiController extends ApiController {
    constructor() {
        super();
    }

    signupEmail(email: string, name: string, password: string): Promise<AuthEmailSignup> {
        return this.request('auth/signup/email', RequestMethod.POST, {
            email, name, password
        })
    }

    signinEmail(email: string, password: string): Promise<AuthEmailSignin> {
        return this.request('auth/signin/email', RequestMethod.POST, {
            email, password
        })
    }

    signinGoogle(idToken: string): Promise<AuthGoogleSignin> {
        return this.request('auth/signin/google', RequestMethod.POST, {idToken})
    }

    linkGoogle(idToken: string): Promise<AuthGoogleLink> {
        return this.request('me/link/google', RequestMethod.POST, {idToken})
    }

    signinTelegram(data: TelegramAuthData): Promise<AuthTelegramSignin> {
        return this.request('auth/signin/telegram', RequestMethod.POST, data)
    }

    linkTelegram(data: TelegramAuthData): Promise<AuthTelegramLink> {
        return this.request('me/link/telegram', RequestMethod.POST, data)
    }

    unlinkProvider(provider: 'google' | 'telegram' | 'yandex'): Promise<AuthGoogleUnlink> {
        return this.request(`me/unlink/${provider}`, RequestMethod.POST);
    }

    verifyEmail(token: string): Promise<AuthEmailSignin> {
        return this.request('auth/email/verify', RequestMethod.POST, {token})
    }

    resendVerificationEmail(email: string): Promise<void> {
        return this.request('auth/email/resend', RequestMethod.POST, {email})
    }

    forgotPassword(email: string): Promise<void> {
        return this.request('auth/password/forgot', RequestMethod.POST, {email})
    }

    resetPassword(token: string, newPassword: string): Promise<void> {
        return this.request('auth/password/reset', RequestMethod.POST, {token, newPassword})
    }

    // Email change (authenticated)
    requestEmailChange(newEmail: string): Promise<void> {
        return this.request('me/email/change', RequestMethod.POST, {newEmail})
    }

    resendEmailChange(): Promise<void> {
        return this.request('me/email/resend', RequestMethod.POST)
    }

    cancelEmailChange(): Promise<void> {
        return this.request('me/email/pending', RequestMethod.DELETE)
    }
}