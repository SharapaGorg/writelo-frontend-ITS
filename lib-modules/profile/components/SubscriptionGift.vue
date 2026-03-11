<script setup lang="ts">

import {Copy} from 'lucide-vue-next'
import {toast} from "vue-sonner"
import {getToasterPosition} from "~/scripts/features/utils/toater"
import type {UserGift} from "~/lib-modules/profile/types";
import {useProfileI18n} from "~/lib-modules/profile/composables/useProfileI18n";
import {useI18n} from "vue-i18n";

const botUsername = useRuntimeConfig().public.telegramBotUsername;
const GIFT_URL_PREFIX = `https://t.me/${botUsername}?start=`;

const props = defineProps<UserGift>();

const {t} = useProfileI18n();
const {locale} = useI18n();
const settings = useSettings();

const subscriptionTitle = computed(() => {
  const config = settings.getConfig();
  const subscription = config?.subscriptions.find(s => s.id === props.subscriptionId);
  return subscription?.title ?? `#${props.subscriptionId}`;
});

const giftUrl = computed(() => `${GIFT_URL_PREFIX}${props.hash}`);

const isActivated = computed(() => !!props.activatedAt);

const formatDate = (dateString: string | null) => {
  if (!dateString) return t('gifts.notActivated');

  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(giftUrl.value);
    toast.success(t('gifts.linkCopied'), {
      position: getToasterPosition()
    });
  } catch (error) {
    console.error('Copy error:', error);
    const textArea = document.createElement('textarea');
    textArea.value = giftUrl.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success(t('gifts.linkCopied'), {
      position: getToasterPosition()
    });
  }
};

</script>

<template>
  <div class="subscription-gift__container">
    <div class="subscription-gift__title">{{ subscriptionTitle }}</div>
    <div class="subscription-gift__action-grid" v-if="isActivated">
      <span class="subscription-gift__activation-date">{{ formatDate(activatedAt) }}</span>
      <span v-if="activator" class="activator-chip">
        {{ activator }}
      </span>
    </div>

    <div v-else class="subscription-gift__action-grid">
      <span class="subscription-gift__activation-date">{{ t('gifts.notActivated') }}</span>
      <Button
          size="tiny"
          variant="secondary"
          @click="copyToClipboard"
      >
        <Copy/>
        <span>{{ t('gifts.copy') }}</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>

.subscription-gift__container {
  @apply w-full border-input border-2
  pl-2.5 pr-1.5 py-1.5 rounded-lg flex
  cursor-pointer select-none
}

.subscription-gift__title {
  @apply font-bold flex-grow
}

.subscription-gift__action-grid {
  @apply flex gap-x-2 w-fit items-center flex-grow
  justify-end
}

.subscription-gift__activation-date {
  @apply text-[13px] text-stone-500
}

.activator-chip {
  background: rgb(59 130 246 / 0.3);
  color: rgb(59 130 246);
  @apply rounded-lg px-2 py-1 text-sm
}

</style>