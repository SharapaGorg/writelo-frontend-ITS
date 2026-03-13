<!-- lib-modules/demo-mode/components/DemoBanner.vue -->
<template>
  <Transition name="slide-down">
    <div v-if="isGuestDemo" class="demo-banner">
      <span>{{ t('demo.banner.text') }}</span>
      <NuxtLink to="/auth" class="underline ml-2 font-medium hover:text-white/90">
        {{ t('demo.banner.link') }}
      </NuxtLink>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDemoMode } from '../composables/useDemoMode'

const { t } = useI18n()
const { isGuestDemo } = useDemoMode()
</script>

<style scoped>
.demo-banner {
  @apply fixed top-0 left-0 right-0 z-[100];
  @apply bg-gradient-to-r from-purple-600 to-indigo-600;
  @apply text-white text-center py-2.5 px-4 text-sm;
  @apply shadow-lg;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
