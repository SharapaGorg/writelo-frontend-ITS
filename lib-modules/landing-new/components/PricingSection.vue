<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import PriceCard from './PriceCard.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useUserController } from '~/composables/user'
import { Routes } from '~/scripts/shared/types'
import type { PriceCardProps, PriceCardCtaAction, PriceCardTier } from '../types'

const { t, tm, rt } = useI18n()
const router = useRouter()
const userController = useUserController()
const { $trackGoal } = useNuxtApp()
const { elementRef, isVisible } = useScrollReveal()

function features(key: string): string[] {
  const raw = tm(key) as Record<string, unknown> | unknown[]
  const list = Array.isArray(raw) ? raw : Object.values(raw ?? {})
  return list.map((v) => (typeof v === 'string' ? v : rt(v as never)))
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
  },
  {
    tier: 'business',
    name: t('landingNew.pricing.business.name'),
    description: t('landingNew.pricing.business.description'),
    price: t('landingNew.pricing.business.price'),
    features: features('landingNew.pricing.business.features'),
    cta: { label: t('landingNew.pricing.business.cta'), action: 'demo' },
  },
])

function handleCta(action: PriceCardCtaAction, tier: PriceCardTier) {
  $trackGoal('landing_cta_click', { button: `pricing_${tier}` })
  if (action === 'demo') {
    window.location.href = 'mailto:hello@writelo.io?subject=' + encodeURIComponent('Демо Writelo Business')
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
        <PriceCard
          v-for="card in cards"
          :key="card.name"
          v-bind="card"
          @cta="handleCta"
        />
      </div>
    </div>
  </section>
</template>
