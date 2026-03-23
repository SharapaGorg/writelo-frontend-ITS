<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md xl:max-w-[80vw]">
      <DialogHeader>
        <DialogTitle>{{ $t('tariffs') }}</DialogTitle>
      </DialogHeader>

      <Spinner v-show="!$settings.loaded.value"/>

      <TiersWindowContent
          v-show="$settings.loaded.value"
          :subscriptions="subscriptions"
          @select-tier="emit('select-tier', $event); isOpen = false"
      />

      <DialogFooter class="sm:justify-start">

      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import TiersWindowContent from "~/components/organisms/TiersWindowContent.vue";

import Spinner from "~/components/atoms/Spinner.vue";
import type {SubscriptionType} from "~/scripts/shared/types/common";

const emit = defineEmits(['select-tier'])
const isOpen = ref(false);

const $settings = useSettings();
const subscriptions: Ref<SubscriptionType[]> = ref([]);

const initTiers = () => {
  subscriptions.value = $settings.getConfig().subscriptions.filter(item => item.price > 0);
}

if ($settings.loaded.value) {
  await initTiers();
}

watch($settings.loaded, value => {
  if (value) {
    initTiers();
  }
})


</script>