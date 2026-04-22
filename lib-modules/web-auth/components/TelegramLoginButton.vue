<template>
  <button class="telegram-button" :disabled="isLoading" @click="handleClick">
    <div class="flex items-center gap-0.5 mx-auto w-fit">
      <svg
          v-if="!isLoading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 240 240"
          class="telegram-button__icon"
      >
        <circle cx="120" cy="120" r="120" fill="#229ED9"/>
        <path
            d="M179 69.2l-22.5 106.3c-1.7 7.6-6.2 9.5-12.6 5.9l-35-25.8-16.9 16.3c-1.9 1.9-3.4 3.4-7 3.4l2.5-35.6 64.9-58.6c2.8-2.5-0.6-3.9-4.3-1.4l-80.3 50.6-34.6-10.8c-7.5-2.3-7.6-7.5 1.6-11.1l135.3-52.2c6.2-2.3 11.6 1.5 9.6 11.2z"
            fill="#fff"
        />
      </svg>
      <Loader2 v-else class="telegram-button__icon animate-spin"/>
      <span class="telegram-button__text">{{ t('telegram.continue_with') }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useWebAuthI18n } from '../composables/useWebAuthI18n'
import { useTelegramOAuth } from '../composables/useTelegramOAuth'

export type TelegramButtonMode = 'signin' | 'link'

const props = withDefaults(defineProps<{
  mode?: TelegramButtonMode
}>(), {
  mode: 'signin'
})

const emit = defineEmits<{ linked: [] }>()

const { t } = useWebAuthI18n()
const { isLoading, signIn } = useTelegramOAuth()

async function handleClick() {
  const ok = await signIn(props.mode)
  if (ok && props.mode === 'link') emit('linked')
}
</script>

<style scoped>
.telegram-button {
  @apply px-3 py-2 rounded-md
  font-semibold text-white bg-[#229ED9]
  hover:bg-[#1d8fc2] active:scale-95
  shadow-md transition text-center w-full;
}

.telegram-button:disabled {
  @apply opacity-70 cursor-not-allowed;
}

.telegram-button__icon {
  @apply w-6 h-6 shrink-0;
}

.telegram-button__text {
  @apply text-base leading-none text-center;
}
</style>
