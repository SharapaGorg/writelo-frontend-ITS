<template>
  <Card class="w-full">
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>{{ t('login.title') }}</CardTitle>
      <LanguageSelector/>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="email">{{ t('login.email') }}</Label>
        <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="example@domain.com"
            :class="{'border-destructive': errors.email}"
        />
        <FormError :error="errors.email ? globalT(errors.email, { min: 1 }) : undefined"/>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">{{ t('login.password') }}</Label>
          <Button variant="link" class="p-0 h-auto text-xs" @click="goToForgotPassword">
            {{ t('login.forgot_password') }}
          </Button>
        </div>
        <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            :class="{'border-destructive': errors.password}"
        />
        <FormError :error="errors.password ? globalT(errors.password, { min: 6 }) : undefined"/>
      </div>

      <div v-if="emailNotVerified" class="p-3 rounded-md bg-destructive/10 text-sm">
        <p class="text-destructive">{{ t('login.email_not_verified') }}</p>
      </div>
    </CardContent>

    <CardFooter class="flex flex-col gap-y-2">
      <Button @click="onSubmit" class="w-full" :disabled="isSubmitting">
        {{ t('login.submit') }}
      </Button>

      <Separator class="my-4" :label="t('common.or')"/>

      <GoogleButton/>

      <TelegramLoginButton/>

<!--      <YandexAuthButton/>-->

      <div class="text-sm text-muted-foreground text-center" style="margin-top: 40px">
        {{ t('login.no_account') }}
        <Button variant="link" class="p-0 h-auto" @click="$emit('signup')">
          {{ t('login.signup_link') }}
        </Button>
      </div>

      <div class="text-xs text-muted-foreground/70 text-center">
        {{ t('common.support') }}
        <a href="https://t.me/NeoVisionSupport" target="_blank" class="hover:underline">
          t.me/NeoVisionSupport
        </a>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import LanguageSelector from '~/components/atoms/LanguageSelector.vue'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'
import GoogleButton from "~/lib-modules/web-auth/components/GoogleButton.vue";
import FormError from "~/lib-modules/web-auth/components/FormError.vue";
import {useWebAuthI18n} from '../composables/useWebAuthI18n'
import {useForm} from 'vee-validate'
import {toTypedSchema} from '@vee-validate/zod'
import TelegramLoginButton from "./TelegramLoginButton.vue";
import YandexAuthButton from "./YandexAuthButton.vue";
import {type LoginFormData, loginSchema} from "~/lib-modules/web-auth";
import {toast} from "vue-sonner";
import {getToasterPosition} from "~/scripts/features/utils/toater";
import {Routes} from "~/scripts/shared/types";
import {AuthApiController} from "~/lib-modules/web-auth/helpers";

const {t, globalT} = useWebAuthI18n()
const {locale} = useI18n()
const userController = useUserController()
const settings = useSettings()
const authApi = new AuthApiController()

const emit = defineEmits<{
  (e: 'signup'): void
}>()

const goToForgotPassword = () => {
  navigateTo({
    path: '/forgot-password',
    query: email.value ? { email: email.value } : undefined
  })
}

const {defineField, handleSubmit, errors, isSubmitting, setErrors} = useForm<LoginFormData>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: ''
  }
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const emailNotVerified = ref(false)

const onSubmit = handleSubmit(async (values) => {
  emailNotVerified.value = false

  try {
    const response = await authApi.signinEmail(values.email, values.password)

    console.log('RESPONSE:', response);

    if (response?.token) {
      console.log('OBTAINED TOKEN:', response.token);
      userController.setAuthToken(response.token)
      await settings.init(locale)

      toast.success(t('login.success'), {
        position: getToasterPosition()
      })

      await navigateTo(Routes.newConversation)
    }
  } catch (error: any) {
    // ApiController already shows toast for server errors
    // We only handle field-specific validation errors here
    if (error?.data?.message || error?.data?.detail) {
      const detail = (error.data.message || error.data.detail).toLowerCase()
      if (detail.includes("invalid email or password") || detail.includes("not found")) {
        setErrors({password: t('login.invalid_credentials')});
      } else if (detail.includes("verified") || detail.includes("verify") || detail.includes("confirm")) {
        emailNotVerified.value = true
      }
    }
  }
})
</script>
