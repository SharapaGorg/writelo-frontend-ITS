<template>
  <div class="app-root">
    <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>

    <ClientOnly>
      <div class="fixed inset-0 z-[9999] w-screen h-screen bg-white dark:bg-black flex items-center justify-center"
           v-if="loading">
        <div class="text-center">
          <AppLoader/>
        </div>
      </div>
    </ClientOnly>

    <div v-show="!loading" class="h-full">
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>

      <ClientOnly>
        <Toaster/>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">

import {Toaster} from "~/components/ui/sonner";
import AppLoader from "~/components/atoms/AppLoader.vue";

// На сервере (SSR/prerender) не показываем loading — контент должен быть в HTML для SEO
const loading = ref(!import.meta.server);

useTheme();

const $settings = useSettings();
const $user = useUserController();

const {locale} = useI18n();

const publicPages = ['/', '/ru', '/en', '/landing', '/start', '/auth', '/verify-email', '/reset-password', '/forgot-password', '/email-sent', '/privacy', '/terms', '/data-deletion']
const route = useRoute()

function isPublicPath(path: string): boolean {
  return publicPages.includes(path)
}

function isPublicPage(): boolean {
  if (import.meta.server) return false
  return isPublicPath(window.location.pathname)
}

// Watch for route changes: initialize settings when navigating from public to app pages
watch(() => route.path, (newPath, oldPath) => {
  // Skip if navigating between public pages or staying on same page
  if (isPublicPath(newPath) || !oldPath) return

  // Only init if navigating FROM a public page TO a non-public page and settings not loaded
  if (isPublicPath(oldPath) && !$settings.loaded.value) {
    loading.value = true
    $settings.init(locale).finally(() => {
      loading.value = false
    })
  }
})

watch(locale, () => {
  if (isPublicPage()) return

  loading.value = true;
  setTimeout(() => {
    $settings.init(locale).finally(() => {
      loading.value = false;
    });
  }, 500)
});

// Инициализация только на клиенте
if (!import.meta.server) {
  // Always init user controller so whenReady() resolves (needed for auth API calls)
  const userInitPromise = $user.init()

  if (isPublicPage()) {
    loading.value = false
  } else {
    Promise.all([
      userInitPromise,
      $settings.init()
    ]).finally(() => {
      loading.value = false
    })
  }
}


// todo: use https://www.shadcn-vue.com/docs/components/scroll-area.html


</script>

<style scoped>
.app-root {
  min-height: 100dvh;
  height: 100dvh;
  overscroll-behavior: none;
}
</style>