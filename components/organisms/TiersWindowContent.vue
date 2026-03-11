<template>
  <div
      class="tier-window-container"
  >
    <Tier
        v-for="tier in subscriptions"
        :key="tier.id"
        :rows="tier.featuresText"
        :price="tier.price"
        :title="tier.title"
        :description="tier.description"
        :id="tier.id"
        @select-tier="emit('select-tier', $event)"
    />
  </div>
</template>

<script setup lang="ts">

import Tier from "~/components/molecules/Tier.vue";
import type {SubscriptionType} from "~/scripts/shared/types/common";

const emit = defineEmits(['select-tier']);

const props = defineProps<{ subscriptions: SubscriptionType[] }>();

</script>

<style scoped>

.tier-window-container {
  @apply grid w-full  gap-y-4
  overflow-y-auto xl:overflow-y-visible grid-cols-1 xl:grid-cols-3
  xl:gap-x-4 xl:h-[450px] pb-10 xl:pb-0 h-[500px]
}

</style>