<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Send } from 'lucide-vue-next'
import { AppNavbar } from '~/lib-modules/app-layout'
import AppLoader from '~/components/atoms/AppLoader.vue'
import { Button } from '~/components/ui/button'
import { getToasterPosition, toastError } from '~/scripts/features/utils/toater'
import PlanCard from './PlanCard.vue'
import { usePlans } from '../composables/usePlans'

const { plans, loaded, isCurrentPlan, isPopularPlan } = usePlans()
const { t } = useI18n()

async function handlePaymentMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const data = event.data
  if (!data || data.type !== 'writelo:payment-result') return

  if (data.status === 'success') {
    try {
      await useSettings().refreshUserData()
    } catch (e) {
      console.error('refreshUserData after payment failed', e)
    }
    toast.success(t('plansPage.toasts.subscribed'), { position: getToasterPosition() })
  } else if (data.status === 'fail') {
    toastError(t('plansPage.toasts.paymentFailed'))
  }
}

onMounted(() => {
  window.addEventListener('message', handlePaymentMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handlePaymentMessage)
})
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar :breadcrumbs="[{ label: t('plansPage.breadcrumb') }]" />

    <div class="flex-1 overflow-y-auto">
      <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        <header class="flex flex-col gap-2">
          <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">{{ t('plansPage.title') }}</h1>
          <p class="text-sm text-muted-foreground max-w-2xl">
            {{ t('plansPage.subtitle') }}
          </p>
        </header>

        <AppLoader v-if="!loaded" :show-texts="false" />

        <div
          v-else-if="plans.length"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :is-current="isCurrentPlan(plan.id)"
            :is-popular="isPopularPlan(plan.id)"
          />
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground"
        >
          {{ t('plansPage.empty') }}
        </div>

        <div
          class="rounded-xl border border-border bg-muted/30 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
        >
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium">{{ t('plansPage.unsureTitle') }}</div>
            <p class="text-sm text-muted-foreground mt-1">
              {{ t('plansPage.unsureSub') }}
            </p>
          </div>
          <a
            href="https://t.me/sharapagorg"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0"
          >
            <Button variant="outline" class="gap-2 w-full sm:w-auto">
              <Send class="h-4 w-4" />
              <span>@sharapagorg</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
