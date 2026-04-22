<script setup lang="ts">
import { computed } from 'vue'
import { Check, Crown, Sparkles, Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import type { SubscriptionType } from '~/scripts/shared/types/common'
import { formatDuration } from '../helpers/duration'
import PlanPurchaseButton from './PlanPurchaseButton.vue'

const props = defineProps<{
  plan: SubscriptionType
  isCurrent: boolean
  isPopular?: boolean
}>()

const isFree = computed(() => props.plan.price <= 0)
const durationLabel = computed(() => formatDuration(props.plan.duration))
const priceLabel = computed(() => (isFree.value ? '0 ₽' : `${props.plan.price} ₽`))
const showPopularBadge = computed(() => props.isPopular && !props.isCurrent)
const showPurchase = computed(() => !props.isCurrent && !isFree.value)

function handlePurchase(mode: 'self' | 'gift') {
  const message = mode === 'gift'
    ? 'Покупка в подарок пока недоступна'
    : 'Оплата скоро появится'
  toast(message, { position: getToasterPosition() })
}
</script>

<template>
  <div
    :class="cn(
      'relative flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm transition-colors',
      isCurrent
        ? 'border-primary ring-1 ring-primary/40'
        : isPopular
          ? 'border-amber-400/70 ring-1 ring-amber-400/30 dark:border-amber-500/60'
          : !isFree
            ? 'border-amber-300/60 dark:border-amber-800/60'
            : 'border-border'
    )"
  >
    <div
      v-if="isCurrent"
      class="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground shadow"
    >
      <Check class="h-3 w-3" />
      Ваш тариф
    </div>

    <div
      v-else-if="showPopularBadge"
      class="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-medium text-white shadow"
    >
      <Star class="h-3 w-3 fill-current" />
      Популярный
    </div>

    <div class="flex items-center gap-2">
      <component
        :is="isFree ? Sparkles : Crown"
        :class="cn(
          'h-5 w-5',
          isFree ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'
        )"
      />
      <h3 class="text-lg font-semibold truncate">{{ plan.title }}</h3>
    </div>

    <div class="flex items-baseline gap-2">
      <span class="text-4xl font-bold tracking-tight">{{ priceLabel }}</span>
      <span v-if="durationLabel" class="text-sm text-muted-foreground">/ {{ durationLabel }}</span>
    </div>

    <p v-if="plan.description" class="text-sm text-muted-foreground leading-relaxed">
      {{ plan.description }}
    </p>

    <div v-if="plan.featuresText?.length" class="flex flex-col gap-2">
      <div
        v-for="feature in plan.featuresText"
        :key="feature"
        class="flex items-start gap-2 text-sm"
      >
        <Check class="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>{{ feature }}</span>
      </div>
    </div>

    <Button
      v-if="isCurrent"
      disabled
      variant="outline"
      class="mt-auto w-full"
    >
      Ваш тариф
    </Button>

    <PlanPurchaseButton
      v-else-if="showPurchase"
      @purchase="handlePurchase"
    />
  </div>
</template>
