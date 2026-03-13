<template>
  <button class="telegram-button" :disabled="isLoading" @click="handleTelegramAuth">
    <div class="flex items-center gap-0.5 mx-auto w-fit">
      <svg
          v-if="!isLoading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 240 240"
          class="telegram-button__icon"
      >
        <circle cx="120" cy="120" r="120" fill="#229ED9"/>
        <path
            d="M179 69.2l-22.5 106.3c-1.7 7.6-6.2 9.5-12.6 5.9l-35-25.8-16.9 16.3c-1.9 1.9-3.4 3.4-7 3.4l2.5-35.6 64.9-58.6c2.8-2.5-0.6-3.9-4.3-1.4l-80.3 50.6-34.6-10.8c-7.5-2.3-7.6-7.5 1.6-11.1l135.3-52.2c6.2-2.3 11.6 1.5 9.6 11.2z"
            fill="#fff"
        />
      </svg>
      <Loader2 v-else class="telegram-button__icon animate-spin"/>
      <span class="telegram-button__text">{{ t('telegram.continue_with') }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import {ref, onUnmounted} from 'vue'
import {Loader2} from 'lucide-vue-next'
import {useWebAuthI18n} from '../composables/useWebAuthI18n'
import {AuthApiController} from '../helpers/api'
import type {TelegramAuthData} from '../types'
import {toast} from 'vue-sonner'
import {getToasterPosition} from '~/scripts/features/utils/toater'
import {Routes} from '~/scripts/shared/types'
import {useDemoGuard} from '~/lib-modules/demo-mode'

export type TelegramButtonMode = 'signin' | 'link'

const props = withDefaults(defineProps<{
  mode?: TelegramButtonMode
}>(), {
  mode: 'signin'
})

const config = useRuntimeConfig()
const BOT_USERNAME = config.public.telegramBotUsername as string
const ALLOWED_ORIGIN = config.public.appBaseUrl as string
const CALLBACK_NAME = `onTelegramAuth_${Date.now()}`

const {t} = useWebAuthI18n()
const {locale} = useI18n()
const userController = useUserController()
const settings = useSettings()
const authApi = new AuthApiController()
const {guardAction} = useDemoGuard()

const emit = defineEmits<{
  linked: []
}>()

const isLoading = ref(false)

// Check if we're on dev (localhost)
const isDev = computed(() => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

function handleTelegramAuth() {
  // Block in demo mode when linking (mode === 'link')
  if (props.mode === 'link' && guardAction(() => {})) return;

  if (isDev.value) {
    handleDevAuth()
  } else {
    handleProdAuth()
  }
}

// Dev mode: use real test data for local development
function handleDevAuth() {
  const mockData: TelegramAuthData = {
    id: 778327202,
    firstName: '/ Egor',
    lastName: 'Dushin /',
    username: 'sharapagorg',
    photoUrl: 'https://t.me/i/userpic/320/Md5N9YXeexDa_ZllvGf12yBwFLFYkU7Zs0O1_YEdbFI.jpg',
    authDate: 1769265945,
    hash: '07d29fc8d3fb908d29299d438c440022457dab2b63ebde558199ff917c131e2f'
  }

  toast.info('Dev mode: Using test Telegram auth', {position: getToasterPosition()})
  processAuthData(mockData)
}

// Production mode: open Telegram widget in popup
function handleProdAuth() {
  isLoading.value = true

  // Setup global callback (convert snake_case from Telegram to camelCase for backend)
  ;(window as any)[CALLBACK_NAME] = (user: any) => {
    const authData: TelegramAuthData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url,
      authDate: user.auth_date,
      hash: user.hash
    }
    processAuthData(authData)
  }

  // Create popup with Telegram widget
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
    toast.error('Popup blocked. Please allow popups for this site.', {position: getToasterPosition()})
    return
  }

  // Write HTML with Telegram widget to popup
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Telegram Login</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
        }
        .container {
          text-align: center;
        }
        .loading {
          color: #666;
          margin-bottom: 20px;
        }
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

  // Monitor popup close
  const checkPopup = setInterval(() => {
    if (!popup || popup.closed) {
      clearInterval(checkPopup)
      isLoading.value = false
      cleanupCallback()
    }
  }, 500)
}

function cleanupCallback() {
  delete (window as any)[CALLBACK_NAME]
}

async function processAuthData(data: TelegramAuthData) {
  isLoading.value = true
  try {
    if (props.mode === 'signin') {
      const authResponse = await authApi.signinTelegram(data)

      if (authResponse?.token) {
        userController.setAuthToken(authResponse.token)
        await settings.init(locale)

        toast.success(t('telegram.success'), {position: getToasterPosition()})
        await navigateTo(Routes.newConversation)
      }
    } else {
      await authApi.linkTelegram(data)
      await settings.refreshUserData()
      toast.success(t('telegram.linked'), {position: getToasterPosition()})
      emit('linked')
    }
  } catch (error: any) {
    console.error('Telegram auth error:', error)
    // Error toast is handled by ApiController
  } finally {
    isLoading.value = false
    cleanupCallback()
  }
}

onUnmounted(() => {
  cleanupCallback()
})
</script>

<style scoped>
.telegram-button {
  @apply px-3 py-2 rounded-md
  font-semibold text-white bg-[#229ED9]
  hover:bg-[#1d8fc2] active:scale-95
  shadow-md transition text-center w-full;
}

.telegram-button:disabled {
  @apply opacity-70 cursor-not-allowed;
}

.telegram-button__icon {
  @apply w-6 h-6 shrink-0;
}

.telegram-button__text {
  @apply text-base leading-none text-center;
}
</style>
