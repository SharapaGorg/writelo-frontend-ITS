<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <!-- Success state -->
      <template v-if="emailSent">
        <CardHeader class="text-center">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <CardTitle>{{ t('forgot_password.success_title') }}</CardTitle>
          <CardDescription>
            {{ t('forgot_password.success_description', { email: sentToEmail }) }}
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Button variant="ghost" class="w-full" @click="goToAuth">
            {{ t('forgot_password.back') }}
          </Button>
        </CardFooter>
      </template>

      <!-- Form state -->
      <template v-else>
        <CardHeader>
          <CardTitle>{{ t('forgot_password.title') }}</CardTitle>
          <CardDescription>{{ t('forgot_password.description') }}</CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email">{{ t('forgot_password.email') }}</Label>
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
        </CardContent>

        <CardFooter class="flex flex-col gap-y-3">
          <Button @click="onSubmit" class="w-full" :disabled="isSubmitting">
            {{ t('forgot_password.submit') }}
          </Button>

          <Button variant="link" class="p-0 h-auto text-muted-foreground" @click="goToAuth">
            {{ t('forgot_password.back') }}
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
import FormError from "~/lib-modules/web-auth/components/FormError.vue";
import {useWebAuthI18n} from '~/lib-modules/web-auth/composables/useWebAuthI18n'
import {useForm} from 'vee-validate'
import {toTypedSchema} from '@vee-validate/zod'
import {z} from 'zod'
import {AuthApiController} from "~/lib-modules/web-auth/helpers";

definePageMeta({
  layout: false
})

const route = useRoute()
const {t, globalT} = useWebAuthI18n()
const authApi = new AuthApiController()

const emailSent = ref(false)
const sentToEmail = ref('')

const schema = z.object({
  email: z.string().min(1, 'auth.validation.email_required').email('auth.validation.email_invalid')
})

const {defineField, handleSubmit, errors, isSubmitting, setFieldValue} = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    email: ''
  }
})

const [email, emailAttrs] = defineField('email')

onMounted(() => {
  const queryEmail = route.query.email as string
  if (queryEmail) {
    setFieldValue('email', queryEmail)
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    await authApi.forgotPassword(values.email)
    sentToEmail.value = values.email
    emailSent.value = true
  } catch (e: any) {
    // Error toast is shown by ApiController
  }
})

const goToAuth = () => {
  navigateTo('/auth')
}
</script>
