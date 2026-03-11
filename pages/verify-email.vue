<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div v-if="isLoading" class="mx-auto mb-4">
          <Loader2 class="w-12 h-12 animate-spin text-primary"/>
        </div>
        <div v-else-if="isSuccess"
             class="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check class="w-8 h-8 text-green-600"/>
        </div>
        <div v-else class="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <X class="w-8 h-8 text-destructive"/>
        </div>

        <CardTitle>
          <template v-if="isLoading">{{ t('verify_page.verifying') }}</template>
          <template v-else-if="isSuccess">{{ t('verify_page.success_title') }}</template>
          <template v-else>{{ t('verify_page.error_title') }}</template>
        </CardTitle>

        <CardDescription v-if="!isLoading">
          <template v-if="isSuccess">{{ t('verify_page.success_description') }}</template>
          <template v-else>{{ errorMessage || t('verify_page.error_description') }}</template>
        </CardDescription>
      </CardHeader>

      <CardFooter v-if="!isLoading" class="justify-center">
        <Button v-if="isSuccess" @click="goToApp">
          {{ t('verify_page.continue') }}
        </Button>
        <Button v-else variant="outline" @click="goToAuth">
          {{ t('verify_page.back_to_auth') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Loader2, Check, X} from 'lucide-vue-next'
import {AuthApiController} from "~/lib-modules/web-auth/helpers";
import {Routes} from "~/scripts/shared/types";
import {definePageMeta} from "#imports";

definePageMeta({
  layout: false
})

const {t} = useI18n()
const route = useRoute()
const {locale} = useI18n()
const userController = useUserController()
const settings = useSettings()
const authApi = new AuthApiController()

const isLoading = ref(true)
const isSuccess = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    isLoading.value = false
    errorMessage.value = t('verify_page.no_token')
    return
  }

  try {
    const response = await authApi.verifyEmail(token)

    if (response?.token) {
      userController.setAuthToken(response.token)
      await settings.init(locale)
      isSuccess.value = true
    } else {
      errorMessage.value = t('verify_page.error_description')
    }
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('verify_page.error_description')
  } finally {
    isLoading.value = false
  }
})

const goToApp = () => {
  navigateTo(Routes.newConversation)
}

const goToAuth = () => {
  navigateTo('/auth')
}
</script>
