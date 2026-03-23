<script setup lang="ts">

import {ChevronsDown} from "lucide-vue-next";
import {useScrollButton} from "~/scripts/features/conversation/scrollDownButton";
import {isIOS} from "~/scripts/features/utils";

const {isScrollDownButtonVisible, scrollDownContainer} = useScrollButton();

const isShit = ref(false);

onMounted(() => {
  isShit.value = isIOS();
})

</script>

<template>
  <Transition name="lazy-loading">
    <div
        :style="{ bottom: isShit ? '182px' : '152px' }"
        class="w-full fixed flex justify-center pb-2"
        v-if="isScrollDownButtonVisible"
    >
      <Button size="sm" variant="outline" @click="scrollDownContainer" class="dark:bg-stone-950">
        <ChevronsDown/>
        <ChevronsDown/>
        <ChevronsDown/>
      </Button>
    </div>
  </Transition>

</template>

<style scoped>

</style>