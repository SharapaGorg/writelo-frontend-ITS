<template>
  <Card class="w-full">
    <CardHeader class="flex flex-row items-center justify-between">
      <CardTitle>{{ t('signup.title') }}</CardTitle>
      <LanguageSelector/>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label for="name">{{ t('signup.name') }}</Label>
        <Input
            id="name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            :placeholder="t('signup.name_placeholder')"
            :class="{'border-destructive': errors.name}"
        />
        <FormError :error="errors.name ? globalT(errors.name, { min: 2, max: 50 }) : undefined"/>
      </div>

      <div class="space-y-2">
        <Label for="email">{{ t('signup.email') }}</Label>
        <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="example@domain.com"
            :class="{'border-destructive': errors.email}"
        />
        <FormError :error="errors.email ? globalT(errors.email) : undefined"/>
      </div>

      <div class="space-y-2">
        <Label for="password">{{ t('signup.password') }}</Label>
        <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            :placeholder="t('signup.password_placeholder')"
            :class="{'border-destructive': errors.password}"
        />
        <FormError :error="errors.password ? globalT(errors.password, { min: 8 }) : undefined"/>
      </div>

      <div class="space-y-2">
        <Label for="confirmPassword">{{ t('signup.confirm_password') }}</Label>
        <Input
            id="confirmPassword"
            v-model="confirmPassword"
            v-bind="confirmPasswordAttrs"
            type="password"
            :class="{'border-destructive': errors.confirmPassword}"
        />
        <FormError :error="errors.confirmPassword ? globalT(errors.confirmPassword) : undefined"/>
      </div>

      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Checkbox id="terms" v-model="acceptTerms" v-bind="acceptTermsAttrs"/>
          <Label for="terms" class="text-sm">
            {{ t('signup.accept_terms') }}
          </Label>
        </div>
        <FormError :error="errors.acceptTerms ? globalT(errors.acceptTerms) : undefined"/>
      </div>
    </CardContent>

    <CardFooter class="flex flex-col gap-y-2">
      <Button @click="onSubmit" class="w-full" :disabled="isSubmitting">
        {{ t('signup.submit') }}
      </Button>

      <Separator class="my-4" :label="t('common.or')"/>

      <GoogleButton/>

      <TelegramLoginButton/>

<!--      <YandexAuthButton/>-->

      <div class="text-sm text-muted-foreground text-center mt-4">
        {{ t('signup.have_account') }}
        <Button variant="link" class="p-0 h-auto" @click="$emit('login')">
          {{ t('signup.login_link') }}
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
import {Checkbox} from '@/components/ui/checkbox'
import FormError from "~/lib-modules/web-auth/components/FormError.vue";
import {useWebAuthI18n} from '../composables/useWebAuthI18n'
import {useForm} from 'vee-validate'
import {toTypedSchema} from '@vee-validate/zod'
import {signUpSchema, type SignUpFormData} from '../types/validation'
import GoogleButton from "~/lib-modules/web-auth/components/GoogleButton.vue";
import TelegramLoginButton from "./TelegramLoginButton.vue";
import YandexAuthButton from "./YandexAuthButton.vue";
import {AuthApiController} from '../helpers/api'
import {Routes} from '~/scripts/shared/types'
import {toast} from 'vue-sonner'
import {getToasterPosition} from '~/scripts/features/utils/toater'

const {t, globalT} = useWebAuthI18n()
const {locale} = useI18n()

const emit = defineEmits<{
  (e: "login"): void
}>()

const userController = useUserController()
const settings = useSettings()
const authApi = new AuthApiController()

const {defineField, handleSubmit, errors, isSubmitting, setErrors} = useForm<SignUpFormData>({
  validationSchema: toTypedSchema(signUpSchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  }
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')
const [acceptTerms, acceptTermsAttrs] = defineField('acceptTerms')

const onSubmit = handleSubmit(async (values) => {
  try {
    const response = await authApi.signupEmail(values.email, values.name, values.password)

    // If server returns token directly, user is already verified (e.g. OAuth)
    if (response?.token) {
      userController.setAuthToken(response.token)
      await settings.init(locale)

      toast.success(t('signup.success'), {
        position: getToasterPosition()
      })

      await navigateTo(Routes.newConversation)
    } else {
      // Email verification required - redirect to verification page
      await navigateTo({
        path: '/email-sent',
        query: { email: values.email }
      })
    }
  } catch (error: any) {
    // ApiController already shows toast for server errors
    // We only handle field-specific validation errors here
    if (error?.data?.message) {
      const detail = error.data.message.toLowerCase()
      if (detail.includes('email') && detail.includes('already')) {
        setErrors({email: t('signup.email_exists')})
      }
    }
  }
})
</script>
