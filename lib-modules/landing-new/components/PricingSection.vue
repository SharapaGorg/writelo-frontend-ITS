<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ShieldCheck } from 'lucide-vue-next'
import SectionHeader from './SectionHeader.vue'
import PriceCard from './PriceCard.vue'
import LandingPromoInput from './LandingPromoInput.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useUserController } from '~/composables/user'
import { Routes } from '~/scripts/shared/types'
import { usePromoCode } from '~/lib-modules/plans'
import type { PriceCardProps, PriceCardCtaAction, PriceCardTier } from '../types'

const { t, tm, rt } = useI18n()
const router = useRouter()
const route = useRoute()
const userController = useUserController()
const { $trackGoal } = useNuxtApp()
const { elementRef, isVisible } = useScrollReveal()

const promoState = usePromoCode()

const initialPromoFromUrl = computed(() => {
  const raw = route.query.promo
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
})

onMounted(() => {
  if (initialPromoFromUrl.value) {
    promoState.code.value = initialPromoFromUrl.value
    promoState.apply(initialPromoFromUrl.value)
  }
})

// Pro card maps to the most-expensive applicable subscription in the preview.
// Falls back to null when promo isn't applied or doesn't fit any paid tier.
const proPromoPreview = computed(() => {
  const applicable = promoState.previews.value.filter(
    p => p.applicable && p.discountAmount > 0,
  )
  if (!applicable.length) return null
  return applicable.reduce((max, p) =>
    p.originalPrice > max.originalPrice ? p : max,
  )
})

function features(key: string): string[] {
  const raw = tm(key) as unknown[]
  return raw.map((v) => (typeof v === 'string' ? v : rt(v as never)))
}

const cards = computed<PriceCardProps[]>(() => [
  {
    tier: 'free',
    name: t('landingNew.pricing.free.name'),
    description: t('landingNew.pricing.free.description'),
    price: t('landingNew.pricing.free.price'),
    features: features('landingNew.pricing.free.features'),
    cta: { label: t('landingNew.pricing.free.cta'), action: 'signup' },
  },
  {
    tier: 'pro',
    name: t('landingNew.pricing.pro.name'),
    description: t('landingNew.pricing.pro.description'),
    price: t('landingNew.pricing.pro.price'),
    period: t('landingNew.pricing.pro.period'),
    features: features('landingNew.pricing.pro.features'),
    cta: { label: t('landingNew.pricing.pro.cta'), action: 'signup' },
    highlighted: true,
    promoPreview: proPromoPreview.value,
  },
])

function handleCta(_action: PriceCardCtaAction, tier: PriceCardTier) {
  $trackGoal('landing_cta_click', { button: `pricing_${tier}` })

  if (tier === 'pro') {
    // Prefer the validated applied code; fall back to whatever sat in ?promo=…
    // so a user who pasted a marketing link but didn't click "Применить" still
    // gets the code carried into the checkout intent.
    const promo = promoState.appliedCode.value?.trim() || initialPromoFromUrl.value
    const checkoutTarget = promo
      ? `/app/plans?intent=auto&promo=${encodeURIComponent(promo)}`
      : '/app/plans?intent=auto'

    if (userController.getToken()) {
      router.push(checkoutTarget)
    } else {
      router.push(`/auth?next=${encodeURIComponent(checkoutTarget)}`)
    }
    return
  }

  if (userController.getToken()) {
    router.push(Routes.app)
  } else {
    router.push('/auth')
  }
}
</script>

<template>
  <section
    id="pricing"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader
        :label="t('landingNew.pricing.label')"
        :title="t('landingNew.pricing.title')"
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch max-w-[820px] mx-auto">
        <PriceCard
          v-for="card in cards"
          :key="card.name"
          v-bind="card"
          @cta="handleCta"
        />
      </div>

      <div class="mt-8 md:mt-10">
        <LandingPromoInput
          :state="promoState"
          :initially-open="!!initialPromoFromUrl"
        />
      </div>

      <div class="mt-6 md:mt-8 flex justify-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-[6px] border border-[#0a0a0a]/15 dark:border-[#ede8de]/15 bg-[#0a0a0a]/[0.02] dark:bg-[#ede8de]/[0.03]">
          <ShieldCheck class="w-4 h-4 text-[#5f5f5f] dark:text-[#a8a094] shrink-0" />
          <span class="lnf-body text-[13px] md:text-[14px] text-[#5f5f5f] dark:text-[#a8a094] leading-snug">
            {{ t('landingNew.pricing.guarantee') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
