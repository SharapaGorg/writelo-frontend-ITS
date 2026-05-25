<script setup lang="ts">
import { computed } from 'vue'
import { Check, Crown, Sparkles, Star, Users } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import type { PromoCodePricePreviewDto } from '~/scripts/shared/types/payment'
import type { SubscriptionType } from '~/scripts/shared/types/common'
import { formatDuration } from '../helpers/duration'
import { usePurchase, type PurchaseMode } from '../composables/usePurchase'
import PlanPurchaseButton from './PlanPurchaseButton.vue'

const props = defineProps<{
  plan: SubscriptionType
  isCurrent: boolean
  isPopular?: boolean
  promoPreview?: PromoCodePricePreviewDto | null
  promoCode?: string | null
}>()

const isFree = computed(() => props.plan.price <= 0)
const isBusiness = computed(() => props.plan.type === 'business')
const durationLabel = computed(() => formatDuration(props.plan.duration))
const showPopularBadge = computed(() => props.isPopular && !props.isCurrent)
const showPurchase = computed(() => !props.isCurrent && !isFree.value)

const discountActive = computed(() =>
  !!props.promoPreview
  && props.promoPreview.applicable
  && props.promoPreview.discountAmount > 0,
)

const priceLabel = computed(() => {
  if (isFree.value) return '0 ₽'
  if (discountActive.value) return `${props.promoPreview!.finalPrice} ₽`
  return `${props.plan.price} ₽`
})

const originalPriceLabel = computed(() =>
  discountActive.value ? `${props.promoPreview!.originalPrice} ₽` : null,
)

const discountLabel = computed(() =>
  discountActive.value ? `−${props.promoPreview!.discountAmount} ₽ по промокоду` : null,
)

const { purchase, isPurchasing } = usePurchase()

async function handlePurchase(mode: PurchaseMode) {
  await purchase({
    subscriptionId: props.plan.id,
    mode,
    // Promo codes don't apply to gift purchases (backend rejects the combo).
    promoCode: mode === 'gift' ? null : props.promoCode ?? null,
  })
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

    <div class="flex flex-col gap-1">
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
      <div
        v-if="isBusiness"
        class="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide font-medium text-brand"
      >
        <Users class="h-3 w-3" />
        Командная версия
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <div class="flex items-baseline gap-2">
        <span class="text-3xl sm:text-4xl font-bold tracking-tight">{{ priceLabel }}</span>
        <span
          v-if="originalPriceLabel"
          class="text-base text-muted-foreground line-through decoration-1"
        >
          {{ originalPriceLabel }}
        </span>
        <span v-if="durationLabel" class="text-sm text-muted-foreground">/ {{ durationLabel }}</span>
      </div>
      <span
        v-if="discountLabel"
        class="inline-flex items-center self-start rounded-full bg-brand/10 text-brand px-2 py-0.5 text-[11px] font-medium"
      >
        {{ discountLabel }}
      </span>
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
      :disabled="isPurchasing"
      @purchase="handlePurchase"
    />
  </div>
</template>
