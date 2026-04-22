<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Loader2 } from 'lucide-vue-next'
import ProfilePageBlock from './ProfilePageBlock.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OAuthProvider } from '~/lib-modules/web-auth'
import { AuthApiController } from '~/lib-modules/web-auth/helpers/api'
import { useWebAuthI18n } from '~/lib-modules/web-auth/composables/useWebAuthI18n'
import { useGoogleOAuth } from '~/lib-modules/web-auth/composables/useGoogleOAuth'
import { useTelegramOAuth } from '~/lib-modules/web-auth/composables/useTelegramOAuth'
import { useProfileI18n } from '../composables/useProfileI18n'
import { toast } from 'vue-sonner'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import { isInTelegramApp } from '~/scripts/features/utils'
import { useDemoGuard, useDemoMode } from '~/lib-modules/demo-mode'

const settings = useSettings()
const { t: tAuth } = useWebAuthI18n()
const { t } = useProfileI18n()
const authApi = new AuthApiController()
const { guardAction } = useDemoGuard()
const { isGuestDemo } = useDemoMode()

const { isLoading: googleLoading, signIn: googleSignIn } = useGoogleOAuth()
const { isLoading: telegramLoading, signIn: telegramSignIn } = useTelegramOAuth()

type ProviderKey = 'google' | 'telegram'

const unlinkingProvider = ref<ProviderKey | null>(null)
const confirmProvider = ref<ProviderKey | null>(null)

const oauthMode = computed<'signin' | 'link'>(() => (isGuestDemo.value ? 'signin' : 'link'))

const isLinked = (provider: OAuthProvider) => {
  const user = settings.getUser()
  return user?.oAuthProviders?.includes(provider) ?? false
}

const isGoogleLinked = computed(() => isLinked(OAuthProvider.Google))
const isTelegramLinked = computed(() => isLinked(OAuthProvider.Telegram))

const handleGoogleClick = () => {
  if (isGoogleLinked.value) {
    openUnlink('google')
  } else {
    googleSignIn(oauthMode.value)
  }
}

const handleTelegramClick = () => {
  if (isTelegramLinked.value) {
    openUnlink('telegram')
  } else {
    telegramSignIn(oauthMode.value)
  }
}

const openUnlink = (provider: ProviderKey) => {
  if (guardAction(() => {})) return
  confirmProvider.value = provider
}

const confirmTexts = computed(() => {
  if (confirmProvider.value === 'google') {
    return {
      title: tAuth('google.unlink_confirm_title'),
      description: tAuth('google.unlink_confirm_description'),
      cancel: tAuth('google.cancel'),
      unlink: tAuth('google.unlink'),
    }
  }
  return {
    title: tAuth('telegram.unlink_confirm_title'),
    description: tAuth('telegram.unlink_confirm_description'),
    cancel: tAuth('telegram.cancel'),
    unlink: tAuth('telegram.unlink'),
  }
})

async function handleUnlink() {
  const provider = confirmProvider.value
  if (!provider) return
  confirmProvider.value = null
  unlinkingProvider.value = provider
  try {
    await authApi.unlinkProvider(provider)
    await settings.refreshUserData()
    toast.success(tAuth(`${provider}.unlinked`), { position: getToasterPosition() })
  } catch (error) {
    console.error(`Failed to unlink ${provider}:`, error)
  } finally {
    unlinkingProvider.value = null
  }
}

const googleBusy = computed(() => googleLoading.value || unlinkingProvider.value === 'google')
const telegramBusy = computed(() => telegramLoading.value || unlinkingProvider.value === 'telegram')
</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('connections.header') }}</template>
    <template #content>
      <div class="flex flex-col divide-y divide-border">
        <!-- Google -->
        <div class="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
              <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </span>
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-sm font-medium">Google</span>
              <span v-if="isGoogleLinked" class="flex items-center gap-1 text-xs text-muted-foreground">
                <Check class="h-3 w-3 text-green-500" />
                {{ tAuth('google.account_linked') }}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="w-28 shrink-0"
            :disabled="googleBusy"
            @click="handleGoogleClick"
          >
            <Loader2 v-if="googleBusy" class="h-4 w-4 animate-spin" />
            <span v-else>{{ isGoogleLinked ? tAuth('google.unlink') : tAuth('google.link') }}</span>
          </Button>
        </div>

        <!-- Telegram -->
        <div class="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
              <svg class="h-4 w-4" viewBox="0 0 240 240" aria-hidden="true">
                <circle cx="120" cy="120" r="120" fill="#229ED9" />
                <path
                  d="M179 69.2l-22.5 106.3c-1.7 7.6-6.2 9.5-12.6 5.9l-35-25.8-16.9 16.3c-1.9 1.9-3.4 3.4-7 3.4l2.5-35.6 64.9-58.6c2.8-2.5-0.6-3.9-4.3-1.4l-80.3 50.6-34.6-10.8c-7.5-2.3-7.6-7.5 1.6-11.1l135.3-52.2c6.2-2.3 11.6 1.5 9.6 11.2z"
                  fill="#fff"
                />
              </svg>
            </span>
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-sm font-medium">Telegram</span>
              <span v-if="isTelegramLinked" class="flex items-center gap-1 text-xs text-muted-foreground">
                <Check class="h-3 w-3 text-green-500" />
                {{ tAuth('telegram.account_linked') }}
              </span>
            </div>
          </div>
          <Button
            v-if="!(isTelegramLinked && isInTelegramApp)"
            variant="outline"
            size="sm"
            class="w-28 shrink-0"
            :disabled="telegramBusy"
            @click="handleTelegramClick"
          >
            <Loader2 v-if="telegramBusy" class="h-4 w-4 animate-spin" />
            <span v-else>{{ isTelegramLinked ? tAuth('telegram.unlink') : tAuth('telegram.link') }}</span>
          </Button>
        </div>
      </div>
    </template>
  </ProfilePageBlock>

  <Dialog :open="confirmProvider !== null" @update:open="(v) => { if (!v) confirmProvider = null }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ confirmTexts.title }}</DialogTitle>
        <DialogDescription>{{ confirmTexts.description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="confirmProvider = null">{{ confirmTexts.cancel }}</Button>
        <Button @click="handleUnlink">{{ confirmTexts.unlink }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
