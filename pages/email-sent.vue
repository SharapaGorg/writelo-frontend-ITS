<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <CardTitle>{{ t('verification.title') }}</CardTitle>
        <CardDescription>
          {{ t('verification.description', {email}) }}
        </CardDescription>
      </CardHeader>

      <CardContent class="text-center text-sm text-muted-foreground">
        {{ t('verification.check_inbox') }}
      </CardContent>

      <CardFooter class="flex flex-col gap-y-3">
        <Button variant="ghost" @click="onResend" :disabled="resendCooldown > 0" class="w-full">
          <template v-if="resendCooldown > 0">
            {{ t('verification.resend_cooldown', {seconds: resendCooldown}) }}
          </template>
          <template v-else>
            {{ t('verification.resend') }}
          </template>
        </Button>

        <Button variant="outline" class="w-full" @click="goToAuth">
          {{ t('verification.back') }}
        </Button>

        <div class="text-xs text-muted-foreground/70 text-center mt-2">
          {{ t('common.support') }}
          <a href="https://t.me/NeoVisionSupport" target="_blank" class="hover:underline">
            t.me/NeoVisionSupport
          </a>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useWebAuthI18n} from '~/lib-modules/web-auth/composables/useWebAuthI18n'
import {toast} from "vue-sonner"
import {getToasterPosition} from "~/scripts/features/utils/toater"
import {AuthApiController} from "~/lib-modules/web-auth/helpers"

definePageMeta({
  layout: false
})

const route = useRoute()
const {t} = useWebAuthI18n()
const authApi = new AuthApiController()

const email = computed(() => (route.query.email as string) || '')

const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

onMounted(() => {
  if (!email.value) {
    navigateTo('/auth')
    return
  }
  startCooldown()
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

const onResend = async () => {
  try {
    await authApi.resendVerificationEmail(email.value)
    toast.success(t('verification.code_resent'), {
      position: getToasterPosition()
    })
    startCooldown()
  } catch (e: any) {
    // Error toast is shown by ApiController
  }
}

const goToAuth = () => {
  navigateTo('/auth')
}
</script>
