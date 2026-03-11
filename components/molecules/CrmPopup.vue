<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogTrigger as-child>
      <slot></slot>
    </DialogTrigger>
    <DialogContent class="w-full lg:w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ crmPopup.title }}</DialogTitle>
      </DialogHeader>

      <NuxtImg :src="crmPopup.image_url" class="crm-image" alt="preview"/>

      <div v-html="$mdRenderer.render(crmPopup.text || '')" class="text-sm"></div>

      <DialogFooter>
        <Button
            variant="premium"
            class="w-full mt-5 py-4"
            @click="emit('click-action'); isOpen = false;"
        >
          {{ isCurrentPlan ? $t('current-plan') : $t('subscribe') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "~/components/ui/dialog";
import {ApiController} from "~/scripts/shared/api/controller";
import type {CurrentPopupType} from "~/scripts/shared/types/communication";

const emit = defineEmits(['click-action']);

const isOpen = ref(false);
const crmPopup: Ref<CurrentPopupType | null> = ref(null);

const apiController = new ApiController();
const {$mdRenderer} = useNuxtApp();

const container = ref(null);

watch(isOpen, value => {
  if (window. innerWidth > 700) {
    return;
  }
  // useEnv().navbarVisible.value = !value;
})

onBeforeMount(async () => {
  let response = await apiController.getCurrentPopup();
  if (response) {
    crmPopup.value = response;
    setTimeout(() => {
      isOpen.value = true;
    }, 100)

    await apiController.viewCurrentPopup(response.id);
  }
})

</script>

<style scoped>

.crm-image {
  @apply w-full object-cover object-center
  rounded-md
}

</style>