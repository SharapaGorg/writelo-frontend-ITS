<script setup lang="ts">

import Navbar from "~/components/organisms/Navbar.vue";
import {useConversationsStore} from "~/stores/conversations";
import {onMounted, onUnmounted} from "vue";
import { DemoBanner, DemoAuthModal, useDemoMode } from "~/lib-modules/demo-mode";

const { isGuestDemo } = useDemoMode();

const conversationsStore = useConversationsStore();

onMounted(() => {
  conversationsStore.subscribeToEvents();
});

onUnmounted(() => {
  conversationsStore.unsubscribeFromEvents();
});

const onMainWrapperScroll = () => {
  // Unfocus text field when user scrolls the main wrapper
  const focusedElement = document.activeElement as HTMLElement;
  if (focusedElement && (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT')) {
    focusedElement.blur();
  }
}


</script>

<template>
  <div class="main-wrapper" :class="{ 'pt-10': isGuestDemo }" @scroll="onMainWrapperScroll">
    <DemoBanner />
    <DemoAuthModal />
    <Navbar/>
    <slot/>
  </div>
</template>

<style scoped>

</style>