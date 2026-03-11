<template>
  <div class="fuck" :class="{ dark: isDark }">
    <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>

    <div class="fixed inset-0 z-[9999] w-screen h-screen bg-white dark:bg-black flex items-center justify-center"
         v-if="loading">
      <div class="text-center">
        <AppLoader/>
      </div>
    </div>

    <div v-show="!loading" class="h-full">
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>

      <ClientOnly>
        <OnboardingPopover/>
      </ClientOnly>

      <ClientOnly>
        <Toaster/>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">

import {Toaster} from "~/components/ui/sonner";
import AppLoader from "~/components/atoms/AppLoader.vue";
import {useTelegramViewportHack} from "~/composables/telegramHack";
import OnboardingPopover from "~/lib-modules/onboarding/components/OnboardingPopover.vue";

const loading = ref(true);
const isDark = ref(false);

const $settings = useSettings();
const $user = useUserController();

const {locale} = useI18n();

watch(locale, () => {
  loading.value = true;
  setTimeout(() => {
    $settings.init(locale).then(() => {
      loading.value = false;
    });
  }, 500)
});

// Initialize iOS keyboard fix
useTelegramViewportHack();

if (typeof window !== 'undefined') {
  isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

Promise.all([
  $user.init(),
  $settings.init()
]).then(() => {
  loading.value = false;
});


// todo: use https://www.shadcn-vue.com/docs/components/scroll-area.html


</script>

<style scoped>

/*
.fuck {
  min-height: var(--tg-viewport-stable-height);
  height: var(--tg-viewport-stable-height, 100vh);
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}

 */


.fuck {
  /* Use dynamic viewport height from useTelegramViewportHack */
  min-height: calc(var(--vh, 1vh) * 100);
  height: calc(var(--vh, 1vh) * 100);
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}


</style>