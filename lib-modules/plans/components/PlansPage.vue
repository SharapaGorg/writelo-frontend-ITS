<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import { AppNavbar } from '~/lib-modules/app-layout'
import AppLoader from '~/components/atoms/AppLoader.vue'
import { getToasterPosition, toastError } from '~/scripts/features/utils/toater'
import PlanCard from './PlanCard.vue'
import { usePlans } from '../composables/usePlans'

const { plans, loaded, isCurrentPlan, isPopularPlan } = usePlans()

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
    toast.success('Подписка активирована', { position: getToasterPosition() })
  } else if (data.status === 'fail') {
    toastError('Оплата не прошла')
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
    <AppNavbar :breadcrumbs="[{ label: 'Тарифы' }]" />

    <div class="flex-1 overflow-y-auto">
      <div class="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        <header class="flex flex-col gap-2">
          <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">Тарифы</h1>
          <p class="text-sm text-muted-foreground max-w-2xl">
            Сравните доступные планы и выберите подходящий.
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
          Пока нет доступных тарифов.
        </div>
      </div>
    </div>
  </div>
</template>
