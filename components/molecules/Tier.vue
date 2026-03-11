<script setup lang="ts">

import {Check} from "lucide-vue-next";
import {ApiController} from "~/scripts/shared/api/controller";

const emit = defineEmits(['select-tier'])

const props = defineProps<{
  title: String,
  price: Number,
  newPrice?: Number | null | undefined,
  id: Number,
  description: String,
  rows: Record<string, string>,
}>();

const isCurrentPlan = computed(() => {
  return useSettings().getSubscription()?.id === props.id;
})

</script>

<template>
  <div class="tier-container">
    <div class="text-lg mb-2">{{ title }}</div>
    <div class="text-5xl flex items-end gap-x-2 mb-5">
      <div v-if="newPrice === undefined">{{ price }} ₽</div>
      <div v-else class="flex gap-x-4">
        <div class="text-stone-300 dark:text-stone-600 line-through">{{ price }}</div>
        <div>{{ newPrice }} ₽</div>
      </div>

      <div class=" text-stone-900 dark:text-stone-50 text-sm">/ {{ $t('sub-landing.month') }}</div>
    </div>


    <div class="mb-5">{{ description }}</div>

    <div class="flex flex-col gap-y-1 flex-grow h-full">
      <div class="flex gap-x-2 items-start" v-for="row in rows" :key="row">
        <Check class="w-[20px] flex-shrink-0"/>
        <div class="text-sm">{{ row }}</div>
      </div>
    </div>

    <Button
        variant="premium"
        :disabled="isCurrentPlan"
        class="w-full mt-5 py-4"
        @click="!isCurrentPlan ? emit('select-tier', props.id) : null"
    >
      {{ isCurrentPlan ? $t('sub-landing.current-plan') : $t('sub-landing.subscribe') }}
    </Button>
  </div>
</template>

<style scoped>

.tier-container {
  @apply pb-5 px-6 pt-3 rounded-xl border-design-text border-solid border-[1px] w-full
  min-w-[300px] flex flex-col
}

</style>