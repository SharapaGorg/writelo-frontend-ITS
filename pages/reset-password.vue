<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <!-- Loading -->
      <template v-if="isVerifying">
        <CardHeader class="text-center">
          <div class="mx-auto mb-4">
            <Loader2 class="w-12 h-12 animate-spin text-primary"/>
          </div>
          <CardTitle>{{ tGlobal('verify_page.verifying') }}</CardTitle>
        </CardHeader>
      </template>

      <!-- Invalid token -->
      <template v-else-if="invalidToken">
        <CardHeader class="text-center">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <X class="w-8 h-8 text-destructive"/>
          </div>
          <CardTitle>{{ tGlobal('verify_page.error_title') }}</CardTitle>
          <CardDescription>{{ tGlobal('verify_page.error_description') }}</CardDescription>
        </CardHeader>
        <CardFooter class="justify-center">
          <Button variant="outline" @click="goToAuth">
            {{ tGlobal('verify_page.back_to_auth') }}
          </Button>
        </CardFooter>
      </template>

      <!-- Success -->
      <template v-else-if="isSuccess">
        <CardHeader class="text-center">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Check class="w-8 h-8 text-green-600"/>
          </div>
          <CardTitle>{{ t('reset_password.success') }}</CardTitle>
        </CardHeader>
        <CardFooter class="justify-center">
          <Button @click="goToAuth">
            {{ tGlobal('verify_page.back_to_auth') }}
          </Button>
        </CardFooter>
      </template>

      <!-- Form -->
      <template v-else>
        <CardHeader>
          <CardTitle>{{ t('reset_password.title') }}</CardTitle>
          <CardDescription>{{ t('reset_password.description') }}</CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="password">{{ t('reset_password.password') }}</Label>
            <Input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                autocomplete="new-password"
                :class="{'border-destructive': errors.password}"
            />
            <FormError :error="errors.password ? globalT(errors.password, { min: 8 }) : undefined"/>
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword">{{ t('reset_password.confirm_password') }}</Label>
            <Input
                id="confirmPassword"
                v-model="confirmPassword"
                v-bind="confirmPasswordAttrs"
                type="password"
                autocomplete="new-password"
                :class="{'border-destructive': errors.confirmPassword}"
            />
            <FormError :error="errors.confirmPassword ? globalT(errors.confirmPassword) : undefined"/>
          </div>
        </CardContent>

        <CardFooter>
          <Button @click="onSubmit" class="w-full" :disabled="isSubmitting">
            {{ t('reset_password.submit') }}
          </Button>
        </CardFooter>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'
import {Loader2, Check, X} from 'lucide-vue-next'
import FormError from "~/lib-modules/web-auth/components/FormError.vue";
import {useForm} from 'vee-validate'
import {toTypedSchema} from '@vee-validate/zod'
import {z} from 'zod'
import {AuthApiController} from "~/lib-modules/web-auth/helpers";
import {useWebAuthI18n} from "~/lib-modules/web-auth/composables/useWebAuthI18n";

definePageMeta({
  layout: false
})

const {t: tGlobal} = useI18n()
const {t, globalT} = useWebAuthI18n()
const route = useRoute()
const authApi = new AuthApiController()

const isVerifying = ref(true)
const invalidToken = ref(false)
const isSuccess = ref(false)
const token = ref('')

const schema = z.object({
  password: z
    .string()
    .min(1, 'auth.validation.password_required')
    .min(8, 'auth.validation.password_min_length')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'auth.validation.password_strength'
    ),
  confirmPassword: z.string().min(1, 'auth.validation.confirm_password_required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.validation.passwords_dont_match',
  path: ['confirmPassword']
})

const {defineField, handleSubmit, errors, isSubmitting} = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    password: '',
    confirmPassword: ''
  }
})

const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

onMounted(() => {
  const queryToken = route.query.token as string

  if (!queryToken) {
    invalidToken.value = true
    isVerifying.value = false
    return
  }

  token.value = queryToken
  isVerifying.value = false
})

const onSubmit = handleSubmit(async (values) => {
  try {
    await authApi.resetPassword(token.value, values.password)
    isSuccess.value = true
  } catch (e: any) {
    // Error toast is shown by ApiController
  }
})

const goToAuth = () => {
  navigateTo('/auth')
}
</script>
