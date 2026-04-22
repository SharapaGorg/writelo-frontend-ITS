<script setup lang="ts">
import { Check, Lock } from 'lucide-vue-next'
import ProfilePageBlock from './ProfilePageBlock.vue'
import AppLoader from '~/components/atoms/AppLoader.vue'
import SubscriptionTimer from './SubscriptionTimer.vue'
import { FeatureType, type SubscriptionType } from '~/scripts/shared/types/common'
import { useProfileI18n } from '../composables/useProfileI18n'
import { useDemoMode } from '~/lib-modules/demo-mode'

const $settings = useSettings()
const { t } = useProfileI18n()
const { isGuestDemo } = useDemoMode()

const subscription = computed<SubscriptionType | null>(() => $settings.getSubscription())

const subscriptionTitle = computed(() => {
  if (isGuestDemo.value) return t('tariffPlan.demo.title')
  return subscription.value?.title ?? ''
})

const subscriptionDescription = computed(() => {
  if (isGuestDemo.value) return t('tariffPlan.demo.description')
  return subscription.value?.description ?? ''
})

const subscriptionFeaturesText = computed(() => {
  if (isGuestDemo.value) {
    return [
      t('tariffPlan.demo.featuresText.interface'),
      t('tariffPlan.demo.featuresText.functionality'),
      t('tariffPlan.demo.featuresText.demoData'),
    ]
  }
  return subscription.value?.featuresText ?? []
})

const FEATURE_LABELS = computed<Record<FeatureType, string>>(() => ({
  [FeatureType.search]: t('tariffPlan.features.search'),
  [FeatureType.workspaces]: t('tariffPlan.features.clients'),
  [FeatureType.templates]: t('tariffPlan.features.templates'),
  [FeatureType.imageGeneration]: t('tariffPlan.features.imageGeneration'),
}))

const activeFeatures = computed(() =>
  (Object.keys(FEATURE_LABELS.value) as FeatureType[]).filter((f) => $settings.hasFeature(f))
)

const lockedFeatures = computed(() =>
  (Object.keys(FEATURE_LABELS.value) as FeatureType[]).filter((f) => !$settings.hasFeature(f))
)
</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('tariffPlan.header') }}</template>
    <template #content>
      <AppLoader :show-texts="false" v-if="!$settings.loaded" />

      <div v-if="subscription" class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-0.5 min-w-0">
            <h2 class="text-xl font-semibold truncate">{{ subscriptionTitle }}</h2>
            <p class="text-sm text-muted-foreground">{{ subscriptionDescription }}</p>
          </div>
          <SubscriptionTimer v-if="subscription.price" />
        </div>

        <div v-if="subscriptionFeaturesText.length" class="flex flex-col gap-1.5">
          <div
            v-for="feature in subscriptionFeaturesText"
            :key="feature"
            class="flex items-start gap-2 text-sm"
          >
            <Check class="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span>{{ feature }}</span>
          </div>
        </div>

        <div v-if="activeFeatures.length || lockedFeatures.length" class="flex flex-col gap-2 pt-1">
          <div v-if="activeFeatures.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="f in activeFeatures"
              :key="f"
              class="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
            >
              <Check class="h-3 w-3" />
              {{ FEATURE_LABELS[f] }}
            </span>
          </div>

          <div v-if="lockedFeatures.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="f in lockedFeatures"
              :key="f"
              class="inline-flex items-center gap-1 rounded-md bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium"
            >
              <Lock class="h-3 w-3" />
              {{ FEATURE_LABELS[f] }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </ProfilePageBlock>
</template>
