<template>
  <Button
      variant="outline"
      class="relative w-full group overflow-hidden active:scale-95 transition-all"
      :disabled="isLoading"
      @click="handleGoogleSignIn"
  >
    <span
        class="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out"
        aria-hidden="true"
    ></span>

    <div class="flex items-center justify-center space-x-2 relative z-10">
      <svg v-if="!isLoading" class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <Loader2 v-else class="w-5 h-5 animate-spin" />
      <span>{{ t('google.continue_with') }}</span>
    </div>
  </Button>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Loader2} from 'lucide-vue-next'
import {useWebAuthI18n} from '../composables/useWebAuthI18n'
import {AuthApiController} from '../helpers/api'
import {toast} from 'vue-sonner'
import {getToasterPosition} from '~/scripts/features/utils/toater'
import {Routes} from '~/scripts/shared/types'
import {useDemoGuard} from '~/lib-modules/demo-mode'

export type GoogleButtonMode = 'signin' | 'link'

const props = withDefaults(defineProps<{
  mode?: GoogleButtonMode
}>(), {
  mode: 'signin'
})

const GOOGLE_CLIENT_ID = '753438069387-0cm5jv7j2ceseoein8q7ba5jqrq3tdg0.apps.googleusercontent.com'

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

function handleGoogleSignIn() {
  // Block in demo mode when linking (mode === 'link')
  if (props.mode === 'link' && guardAction(() => {})) return;

  isLoading.value = true
  openGooglePopup()
}

function openGooglePopup() {
  const redirectUri = window.location.origin
  const scope = 'openid email profile'
  const responseType = 'id_token'
  const nonce = Math.random().toString(36).substring(2)

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
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
        return
      }

      if (popup.location.href.includes(redirectUri)) {
        const hash = popup.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const idToken = params.get('id_token')

        popup.close()
        clearInterval(checkPopup)

        if (idToken) {
          processIdToken(idToken)
        } else {
          isLoading.value = false
          toast.error(t('google.error'), {position: getToasterPosition()})
        }
      }
    } catch (e) {
      // Cross-origin error - popup not yet redirected
    }
  }, 500)
}

async function processIdToken(idToken: string) {
  try {
    if (props.mode === 'signin') {
      const authResponse = await authApi.signinGoogle(idToken)

      if (authResponse?.token) {
        userController.setAuthToken(authResponse.token)
        await settings.init(locale)

        toast.success(t('google.success'), {position: getToasterPosition()})
        await navigateTo(Routes.newConversation)
      }
    } else {
      await authApi.linkGoogle(idToken)
      await settings.refreshUserData()
      toast.success(t('google.linked'), {position: getToasterPosition()})
      emit('linked')
    }
  } catch (error: any) {
    console.error('Google auth error:', error)
    // Error toast is handled by ApiController
  } finally {
    isLoading.value = false
  }
}
</script>
