<template>
  <div class="loader-wrapper">
    <!-- 3D Cube Fold Animation -->
    <div class="relative w-8 h-8 flex-shrink-0">
      <div class="cube-wrapper">
        <div class="cube">
          <div class="cube-face cube-face-front"></div>
          <div class="cube-face cube-face-back"></div>
          <div class="cube-face cube-face-right"></div>
          <div class="cube-face cube-face-left"></div>
          <div class="cube-face cube-face-top"></div>
          <div class="cube-face cube-face-bottom"></div>
        </div>
      </div>
    </div>

    <!-- Tips section with crossfade -->
    <div class="relative overflow-hidden flex-1 h-6">
      <Transition name="fade" mode="out-in">
        <div
            :key="`${currentTipIndex}`"
            class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic absolute inset-0 flex items-center"
        >
          <span class="mr-1">{{ tipIcon }}</span>
          <span>{{ currentTip }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed} from 'vue';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const tipIcons = ['💡', '🎯', '⚡', '🔍', '✨', '🚀', '🎪', '🌟', '🎨', '🎭', '🎪', '🎯'];

const locale_ = useI18n().locale;
const messages_ = useI18n().messages;

// Get all tips from i18n - access as nested properties
const tips = computed(() => {
  const locale = locale_.value;
  const messages = messages_.value[locale];

  if (!messages?.loading?.tips) {
    // Fallback tips if translations not loaded
    return [
      "Loading your response...",
      "Thinking about your question...",
      "Preparing the answer...",
      "Almost ready...",
      "Processing your request..."
    ];
  }

  const allTips: string[] = [];
  const categories = ['general', 'coding', 'productivity', 'features', 'fun'];

  categories.forEach(category => {
    const categoryTips = messages.loading.tips[category];
    if (Array.isArray(categoryTips)) {
      allTips.push(...categoryTips);
    }
  });

  return allTips.length > 0 ? allTips : ["Loading..."];
});

const currentTipIndex = ref(0);
const currentTip = computed(() => tips.value[currentTipIndex.value] || '');
const tipIcon = ref(tipIcons[0]);

let intervalId: NodeJS.Timeout;

const rotateTip = () => {
  if (tips.value.length > 0) {
    currentTipIndex.value = (currentTipIndex.value + 1) % tips.value.length;
    tipIcon.value = tipIcons[Math.floor(Math.random() * tipIcons.length)];
  }
};

onMounted(() => {
  // Start with a random tip
  if (tips.value.length > 0) {
    currentTipIndex.value = Math.floor(Math.random() * tips.value.length);
    tipIcon.value = tipIcons[Math.floor(Math.random() * tipIcons.length)];
  }

  // Rotate tips every 4 seconds for smoother reading experience
  intervalId = setInterval(rotateTip, 4000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
/* Wrapper with fade-in to mask initial lag */
.loader-wrapper {
  @apply flex items-center gap-3;
  animation: fadeIn 0.3s ease-out;
}

/* 3D Cube Container */
.cube-wrapper {
  @apply w-full h-full flex items-center justify-center;
  perspective: 200px;
}

.cube {
  @apply relative;
  width: 20px;
  height: 20px;
  transform-style: preserve-3d;
  animation: rotateCube 2.5s ease-in-out infinite;
}

/* Cube faces */
.cube-face {
  @apply absolute w-full h-full;
  @apply border border-gray-300 dark:border-gray-600;
  opacity: 0.9;
}

.cube-face-front {
  @apply bg-blue-500/20 dark:bg-blue-400/20;
  transform: rotateY(0deg) translateZ(10px);
}

.cube-face-back {
  @apply bg-purple-500/20 dark:bg-purple-400/20;
  transform: rotateY(180deg) translateZ(10px);
}

.cube-face-right {
  @apply bg-pink-500/20 dark:bg-pink-400/20;
  transform: rotateY(90deg) translateZ(10px);
}

.cube-face-left {
  @apply bg-indigo-500/20 dark:bg-indigo-400/20;
  transform: rotateY(-90deg) translateZ(10px);
}

.cube-face-top {
  @apply bg-teal-500/20 dark:bg-teal-400/20;
  transform: rotateX(90deg) translateZ(10px);
}

.cube-face-bottom {
  @apply bg-rose-500/20 dark:bg-rose-400/20;
  transform: rotateX(-90deg) translateZ(10px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotateCube {
  0% {
    transform: rotateX(-20deg) rotateY(-20deg);
  }
  25% {
    transform: rotateX(20deg) rotateY(20deg) scale(0.95);
  }
  50% {
    transform: rotateX(-20deg) rotateY(160deg) scale(0.9);
  }
  75% {
    transform: rotateX(20deg) rotateY(200deg) scale(0.95);
  }
  100% {
    transform: rotateX(-20deg) rotateY(340deg);
  }
}

/* Smooth crossfade transition */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-500 ease-out;
}

.fade-enter-from {
  @apply opacity-0 transform translate-y-1;
}

.fade-leave-to {
  @apply opacity-0 transform -translate-y-1;
}
</style>