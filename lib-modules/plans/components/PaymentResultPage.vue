<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { CheckCircle2, Mail, Send, XCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  variant: 'success' | 'fail'
}>()

const isSuccess = computed(() => props.variant === 'success')
const { supportTelegram, supportEmail } = useRuntimeConfig().public

const title = computed(() =>
  isSuccess.value ? 'Платёж прошёл' : 'Оплата не прошла'
)
const subtitle = computed(() =>
  isSuccess.value
    ? 'Подписка будет активирована в течение минуты.'
    : 'Оплата отменена или отклонена банком.'
)
const subtitleHint = computed(() =>
  isSuccess.value
    ? 'Если не появилась — напишите нам.'
    : 'Если деньги списались — напишите в поддержку, мы разберёмся.'
)

onMounted(async () => {
  if (isSuccess.value) {
    try {
      await useSettings().refreshUserData()
    } catch (e) {
      console.error('refreshUserData after payment failed', e)
    }
  }

  if (typeof window === 'undefined') return
  if (!window.opener || window.opener === window) return

  try {
    window.opener.postMessage(
      { type: 'writelo:payment-result', status: props.variant },
      window.location.origin,
    )
  } catch (e) {
    console.error('postMessage to opener failed', e)
  }

  window.setTimeout(() => window.close(), 1500)
})
</script>

<template>
  <div class="flex h-full w-full items-center justify-center px-4 py-8">
    <div class="flex w-full max-w-md flex-col items-center gap-5 text-center">
      <component
        :is="isSuccess ? CheckCircle2 : XCircle"
        :class="[
          'h-14 w-14',
          isSuccess ? 'text-emerald-500' : 'text-destructive',
        ]"
      />
      <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
      <div class="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>{{ subtitle }}</p>
        <p>{{ subtitleHint }}</p>
      </div>

      <div class="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
        <a
          :href="`https://t.me/${supportTelegram}`"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Send class="h-4 w-4" />
          <span>@{{ supportTelegram }}</span>
        </a>
        <a
          :href="`mailto:${supportEmail}`"
          class="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Mail class="h-4 w-4" />
          <span>{{ supportEmail }}</span>
        </a>
      </div>

      <div class="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <NuxtLink to="/app/plans">
          <Button variant="outline" class="w-full sm:w-auto">К тарифам</Button>
        </NuxtLink>
        <NuxtLink to="/app">
          <Button class="w-full sm:w-auto">В приложение</Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
