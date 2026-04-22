import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { AuthApiController } from '../helpers/api'
import { useWebAuthI18n } from './useWebAuthI18n'
import type { TelegramAuthData } from '../types'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import { Routes } from '~/scripts/shared/types'
import { useDemoGuard } from '~/lib-modules/demo-mode'

export type TelegramOAuthMode = 'signin' | 'link'

export function useTelegramOAuth() {
  const config = useRuntimeConfig()
  const BOT_USERNAME = config.public.telegramBotUsername as string
  const CALLBACK_NAME = `onTelegramAuth_${Date.now()}_${Math.random().toString(36).slice(2)}`

  const { t } = useWebAuthI18n()
  const { locale } = useI18n()
  const userController = useUserController()
  const settings = useSettings()
  const authApi = new AuthApiController()
  const { guardAction } = useDemoGuard()

  const isLoading = ref(false)

  const isDev = computed(() => {
    if (typeof window === 'undefined') return false
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  })

  function cleanupCallback() {
    delete (window as any)[CALLBACK_NAME]
  }

  function signIn(mode: TelegramOAuthMode = 'signin'): Promise<boolean> {
    if (mode === 'link' && guardAction(() => {})) {
      return Promise.resolve(false)
    }
    return isDev.value ? handleDevAuth(mode) : handleProdAuth(mode)
  }

  function handleDevAuth(mode: TelegramOAuthMode): Promise<boolean> {
    const mockData: TelegramAuthData = {
      id: 778327202,
      firstName: '/ Egor',
      lastName: 'Dushin /',
      username: 'sharapagorg',
      photoUrl: 'https://t.me/i/userpic/320/Md5N9YXeexDa_ZllvGf12yBwFLFYkU7Zs0O1_YEdbFI.jpg',
      authDate: 1769265945,
      hash: '07d29fc8d3fb908d29299d438c440022457dab2b63ebde558199ff917c131e2f',
    }
    toast.info('Dev mode: Using test Telegram auth', { position: getToasterPosition() })
    return processAuthData(mockData, mode)
  }

  function handleProdAuth(mode: TelegramOAuthMode): Promise<boolean> {
    return new Promise((resolve) => {
      isLoading.value = true

      ;(window as any)[CALLBACK_NAME] = (user: any) => {
        const authData: TelegramAuthData = {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url,
          authDate: user.auth_date,
          hash: user.hash,
        }
        processAuthData(authData, mode).then(resolve)
      }

      const width = 550
      const height = 470
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        '',
        'telegram-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      if (!popup) {
        isLoading.value = false
        toast.error('Popup blocked. Please allow popups for this site.', {
          position: getToasterPosition(),
        })
        resolve(false)
        return
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Telegram Login</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
            .container { text-align: center; }
            .loading { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <p class="loading">Loading Telegram...</p>
            <script>
              function onTelegramAuthComplete(user) {
                if (window.opener && window.opener.${CALLBACK_NAME}) {
                  window.opener.${CALLBACK_NAME}(user);
                }
                window.close();
              }
            <\/script>
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login="${BOT_USERNAME}"
              data-size="large"
              data-onauth="onTelegramAuthComplete(user)"
              data-request-access="write"
            ><\/script>
          </div>
        </body>
        </html>
      `

      popup.document.write(html)
      popup.document.close()

      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup)
          isLoading.value = false
          cleanupCallback()
          resolve(false)
        }
      }, 500)
    })
  }

  async function processAuthData(data: TelegramAuthData, mode: TelegramOAuthMode): Promise<boolean> {
    isLoading.value = true
    try {
      if (mode === 'signin') {
        const authResponse = await authApi.signinTelegram(data)
        if (authResponse?.token) {
          userController.setAuthToken(authResponse.token)
          await settings.init(locale)
          toast.success(t('telegram.success'), { position: getToasterPosition() })
          await navigateTo(Routes.app)
          return true
        }
        return false
      }

      await authApi.linkTelegram(data)
      await settings.refreshUserData()
      toast.success(t('telegram.linked'), { position: getToasterPosition() })
      return true
    } catch (error) {
      console.error('Telegram auth error:', error)
      return false
    } finally {
      isLoading.value = false
      cleanupCallback()
    }
  }

  onUnmounted(() => {
    cleanupCallback()
  })

  return { isLoading, signIn }
}
