<script setup lang="ts">

import ProfilePageBlock from "./ProfilePageBlock.vue";
import AppLoader from "~/components/atoms/AppLoader.vue";
import SubscriptionTimer from "./SubscriptionTimer.vue";
import {FeatureType, type SubscriptionType} from "~/scripts/shared/types/common";
import {Dot} from 'lucide-vue-next'
import {useProfileI18n} from '../composables/useProfileI18n';
import {useDemoMode} from '~/lib-modules/demo-mode';

const $settings = useSettings();
const {t} = useProfileI18n();
const {isGuestDemo} = useDemoMode();

const subscription = computed<SubscriptionType | null>(() => $settings.getSubscription());

// Use localized strings for demo mode
const subscriptionTitle = computed(() => {
  if (isGuestDemo.value) {
    return t('tariffPlan.demo.title');
  }
  return subscription.value?.title ?? '';
});

const subscriptionDescription = computed(() => {
  if (isGuestDemo.value) {
    return t('tariffPlan.demo.description');
  }
  return subscription.value?.description ?? '';
});

const subscriptionFeaturesText = computed(() => {
  if (isGuestDemo.value) {
    return [
      t('tariffPlan.demo.featuresText.interface'),
      t('tariffPlan.demo.featuresText.functionality'),
      t('tariffPlan.demo.featuresText.demoData')
    ];
  }
  return subscription.value?.featuresText ?? [];
});

const FEATURES_CHIPS = computed(() => ({
  [FeatureType.search]: t('tariffPlan.features.search'),
  [FeatureType.projects]: t('tariffPlan.features.clients'),
  [FeatureType.templates]: t('tariffPlan.features.templates'),
  [FeatureType.imageGeneration]: t('tariffPlan.features.imageGeneration')
}))

</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('tariffPlan.header') }}</template>
    <template #content>
      <div class="tariff-plan__container">
        <AppLoader :show-texts="false" v-if="!$settings.loaded"/>

        <div v-if="subscription" class="flex flex-col gap-y-3">
          <div class="grid grid-cols-2 justify-items-end items-center gap-3">
            <h1 class="text-xl font-bold w-full">{{ subscriptionTitle }}</h1>
            <SubscriptionTimer v-if="subscription.price"/>
          </div>

          <h3>{{ subscriptionDescription }}</h3>

          <h3 class="font-bold">{{ t('tariffPlan.functionality') }}</h3>

          <div class="flex flex-col gap-y-1">
            <div
                class="flex items-center -translate-x-3"
                v-for="feature in subscriptionFeaturesText"
                :key="feature"
            >
              <Dot class="w-8 h-8 flex-shrink-0"/>

              <span class="text-[13px]">
              {{ feature }}
            </span>
            </div>
          </div>

          <div class="feature-chips__container">
            <template
                v-for="chip in Object.keys(FEATURES_CHIPS) as FeatureType[]"
                :key="chip"
            >
              <div
                  :class="{ 'feature-chips__disabled-item': !$settings.hasFeature(chip) }"
                  class="feature-chips__item"
              >
                {{ FEATURES_CHIPS[chip] }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </ProfilePageBlock>
</template>

<style scoped>

.tariff-plan__container {
  @apply w-full p-4
}

.feature-chips__container {
  @apply flex items-center gap-x-2 flex-wrap gap-y-2
}

.feature-chips__item {
  background: rgb(59 130 246 / 0.3);
  color: rgb(59 130 246);
  @apply rounded-lg px-2 py-1 text-sm flex-shrink-0
}

.feature-chips__disabled-item {
  background: rgb(59 130 246 / 0.1) !important;
  color: rgb(59 130 246 / 0.5) !important;
}

</style>