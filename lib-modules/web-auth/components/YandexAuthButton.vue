<script setup lang="ts">
import { useWebAuthI18n } from '../composables/useWebAuthI18n'

const { t } = useWebAuthI18n()
</script>

<template>
  <button class="yandex-button__container">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10z"
            fill="#FC3F1D"/>
      <path
          d="M13.32 7.666h-.924c-1.694 0-2.585.858-2.585 2.123 0 1.43.616 2.1 1.881 2.959l1.045.704-3.003 4.487H7.49l2.695-4.014c-1.55-1.111-2.42-2.19-2.42-4.015 0-2.288 1.595-3.85 4.62-3.85h3.003v11.868H13.32V7.666z"
          fill="#fff"/>
    </svg>

    <span>{{ t('yandex.continue_with') }}</span>
  </button>
</template>

<style scoped>

.yandex-button__container {
  @apply bg-[#292933] dark:bg-[#292933] w-full text-center py-2 rounded-lg
  flex gap-x-2 justify-center cursor-pointer select-none items-center
  hover:bg-[#FC3F1D] transition-all duration-200 ease-in-out
  active:scale-95
  text-white dark:text-white
}

</style>