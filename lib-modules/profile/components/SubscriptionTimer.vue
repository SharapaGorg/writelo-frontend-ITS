<script setup lang="ts">
import { useProfileI18n } from '../composables/useProfileI18n';

const $settings = useSettings();
const { t } = useProfileI18n();

const subscription = computed(() => $settings.getSubscription());
const subscriptionStart = computed(() => new Date($settings.getSubscriptionStart()));

// Таймер подписки
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
let intervalId: NodeJS.Timeout;

const updateTimeLeft = () => {
  if (!subscriptionStart.value || isNaN(subscriptionStart.value.getTime())) {
    return;
  }

  const now = new Date();
  const endDate = new Date(subscriptionStart.value);
  endDate.setDate(endDate.getDate() + 30); // Подписка на 30 дней

  const difference = endDate.getTime() - now.getTime();

  if (difference > 0) {
    timeLeft.value = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  } else {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (intervalId) clearInterval(intervalId);
  }
};

onMounted(() => {
  updateTimeLeft();
  intervalId = setInterval(updateTimeLeft, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div v-if="subscription && subscription.id !== 'free' && timeLeft.days >= 0"
       class="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-mono">
    {{ timeLeft.days }}{{ t('subscriptionTimer.days') }} {{ String(timeLeft.hours).padStart(2, '0') }}:{{ String(timeLeft.minutes).padStart(2, '0') }}:{{ String(timeLeft.seconds).padStart(2, '0') }}
  </div>
</template>