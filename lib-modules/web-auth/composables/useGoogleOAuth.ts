import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { AuthApiController } from '../helpers/api'
import { useWebAuthI18n } from './useWebAuthI18n'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import { Routes } from '~/scripts/shared/types'
import { useDemoGuard } from '~/lib-modules/demo-mode'

const GOOGLE_CLIENT_ID =
  '753438069387-0cm5jv7j2ceseoein8q7ba5jqrq3tdg0.apps.googleusercontent.com'

export type GoogleOAuthMode = 'signin' | 'link'

export function useGoogleOAuth() {
  const { t } = useWebAuthI18n()
  const { locale } = useI18n()
  const userController = useUserController()
  const settings = useSettings()
  const authApi = new AuthApiController()
  const { guardAction } = useDemoGuard()

  const isLoading = ref(false)

  function signIn(mode: GoogleOAuthMode = 'signin'): Promise<boolean> {
    return new Promise((resolve) => {
      if (mode === 'link' && guardAction(() => {})) {
        resolve(false)
        return
      }

      isLoading.value = true
      openPopup(mode).then(resolve)
    })
  }

  function openPopup(mode: GoogleOAuthMode): Promise<boolean> {
    return new Promise((resolve) => {
      const redirectUri = window.location.origin
      const scope = 'openid email profile'
      const responseType = 'id_token'
      const nonce = Math.random().toString(36).substring(2)

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=${responseType}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&nonce=${nonce}` +
        `&prompt=select_account`

      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        authUrl,
        'google-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const checkPopup = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup)
            isLoading.value = false
            resolve(false)
            return
          }

          if (popup.location.href.includes(redirectUri)) {
            const hash = popup.location.hash.substring(1)
            const params = new URLSearchParams(hash)
            const idToken = params.get('id_token')

            popup.close()
            clearInterval(checkPopup)

            if (idToken) {
              processIdToken(idToken, mode).then(resolve)
            } else {
              isLoading.value = false
              toast.error(t('google.error'), { position: getToasterPosition() })
              resolve(false)
            }
          }
        } catch {
          // Cross-origin error — popup not yet redirected
        }
      }, 500)
    })
  }

  async function processIdToken(idToken: string, mode: GoogleOAuthMode): Promise<boolean> {
    try {
      if (mode === 'signin') {
        const authResponse = await authApi.signinGoogle(idToken)
        if (authResponse?.token) {
          userController.setAuthToken(authResponse.token, authResponse.user)
          await settings.init(locale)
          toast.success(t('google.success'), { position: getToasterPosition() })
          await navigateTo(Routes.app)
          return true
        }
        return false
      }

      await authApi.linkGoogle(idToken)
      await settings.refreshUserData()
      toast.success(t('google.linked'), { position: getToasterPosition() })
      return true
    } catch (error) {
      console.error('Google auth error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, signIn }
}
