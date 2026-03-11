<script setup lang="ts">

import ProfilePageBlock from "./ProfilePageBlock.vue";
import SubscriptionGift from "./SubscriptionGift.vue";
import {useGifts} from "~/lib-modules/profile/helpers/useGifts";
import Spinner from "~/components/atoms/Spinner.vue";
import {Input} from "~/components/ui/input";
import {Gift, LoaderCircle} from "lucide-vue-next";
import {ApiController} from "~/scripts/shared/api/controller";
import {toast} from "vue-sonner";
import {getToasterPosition} from "~/scripts/features/utils/toater";
import {useProfileI18n} from "~/lib-modules/profile/composables/useProfileI18n";
import {AutoCompleteBlocker} from "~/lib-modules/web-auth";

const botUsername = useRuntimeConfig().public.telegramBotUsername;
const GIFT_URL_PREFIX = `https://t.me/${botUsername}?start=`;

const {t} = useProfileI18n();
const $api = new ApiController();
const {gifts, fetchGifts, giftsFetched} = useGifts();

const giftLink = ref('');
const isActivating = ref(false);
const errorMessage = ref('');

const extractHash = (link: string): string => {
  const trimmed = link.trim();
  if (trimmed.startsWith(GIFT_URL_PREFIX)) {
    return trimmed.slice(GIFT_URL_PREFIX.length);
  }
  return trimmed;
};

const activateGift = async () => {
  if (!giftLink.value.trim()) return;

  const hash = extractHash(giftLink.value);
  if (!hash) return;

  errorMessage.value = '';
  isActivating.value = true;
  try {
    await $api.activateGift(hash);
    toast.success(t('gifts.activated'), {position: getToasterPosition()});
    giftLink.value = '';
    await useSettings().refreshUserData();
  } catch (e: any) {
    errorMessage.value = e?.data?.message || t('gifts.invalidLink');
  } finally {
    isActivating.value = false;
  }
};

onBeforeMount(async () => {
  await fetchGifts();
})

</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('gifts.header') }}</template>
    <template #content>
      <div class="gifts-section__activate">
        <span class="gifts-section__activate-label">{{ t('gifts.activateLabel') }}</span>
        <div class="gifts-section__activate-row">

          <Input
              v-model="giftLink"
              :placeholder="t('gifts.placeholder')"
              class="flex-1"
              autocomplete="off"
              name="gift-code"
              @keyup.enter="activateGift"
              aria-autocomplete="none"

          />

          <Button
              size="icon"
              variant="secondary"
              :disabled="!giftLink.trim() || isActivating"
              @click="activateGift"
          >
            <LoaderCircle v-if="isActivating" class="w-4 h-4 animate-spin"/>
            <Gift v-else class="w-4 h-4"/>
          </Button>
        </div>
        <span v-if="errorMessage" class="gifts-section__error">{{ errorMessage }}</span>

        <AutoCompleteBlocker/>
      </div>

      <div class="gifts-section__container" v-if="gifts.length || !giftsFetched">
        <Spinner v-if="!giftsFetched"/>
        <SubscriptionGift
            v-for="gift in gifts"
            :key="gift.hash"
            v-bind="gift"
        />
      </div>
    </template>
  </ProfilePageBlock>
</template>

<style scoped>

.gifts-section__activate {
  @apply flex flex-col gap-y-1.5 mb-3;
}

.gifts-section__activate-label {
  @apply text-sm text-muted-foreground font-medium;
}

.gifts-section__activate-row {
  @apply flex gap-x-2 items-center;
}

.gifts-section__error {
  @apply text-sm text-red-500;
}

.gifts-section__container {
  @apply w-full flex flex-col gap-y-1 max-h-48 overflow-y-auto pr-1;

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
    transition: background 0.2s;

    &:hover {
      background: hsl(var(--muted-foreground) / 0.5);
    }
  }
}

</style>