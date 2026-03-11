<template>
  <div class="app-loading-screen">
    <div class="app-loader-content">
      <!-- Logo or App Icon -->
      <div class="app-logo">
        <div class="logo-cube">
          <div class="logo-face logo-face-front"></div>
          <div class="logo-face logo-face-back"></div>
          <div class="logo-face logo-face-right"></div>
          <div class="logo-face logo-face-left"></div>
          <div class="logo-face logo-face-top"></div>
          <div class="logo-face logo-face-bottom"></div>
        </div>
      </div>

      <!-- Loading progress -->
      <div class="loading-progress" v-if="showProgressBar">
        <div class="progress-bar"></div>
      </div>

      <!-- Loading text -->
      <div class="loading-text" v-if="showTexts">
        <span class="text-gradient">{{ loadingText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';

withDefaults(defineProps<{
  showProgressBar?: boolean,
  showTexts?: boolean
}>(), {
  showProgressBar: true,
  showTexts: true
});

const loadingTexts = [
  'Инициализация AI ассистента...',
  'Загрузка языковых моделей...',
  'Подготовка интерфейса...',
  'Настройка нейронных сетей...',
  'Оптимизация производительности...',
  'Синхронизация данных...',
  'Почти готово...',
  'Ещё немного терпения...'
];

const loadingText = ref(loadingTexts[0]);
let textIndex = 0;
let intervalId: NodeJS.Timeout;

onMounted(() => {
  intervalId = setInterval(() => {
    textIndex = (textIndex + 1) % loadingTexts.length;
    loadingText.value = loadingTexts[textIndex];
  }, 2000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.app-loading-screen {
  @apply flex items-center justify-center w-full h-full;
}

.app-loader-content {
  @apply flex flex-col items-center gap-8;
}

/* 3D Logo Cube */
.app-logo {
  @apply relative w-24 h-24;
  perspective: 400px;
}

.logo-cube {
  @apply relative w-full h-full;
  transform-style: preserve-3d;
  animation: logoRotate 2s linear infinite;
  will-change: transform;
  animation-delay: 0s;
}

.logo-face {
  @apply absolute w-full h-full;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply backdrop-blur-sm;
}

.logo-face-front {
  @apply bg-gradient-to-br from-blue-500/30 to-purple-500/30;
  transform: rotateY(0deg) translateZ(48px);
}

.logo-face-back {
  @apply bg-gradient-to-br from-purple-500/30 to-pink-500/30;
  transform: rotateY(180deg) translateZ(48px);
}

.logo-face-right {
  @apply bg-gradient-to-br from-pink-500/30 to-rose-500/30;
  transform: rotateY(90deg) translateZ(48px);
}

.logo-face-left {
  @apply bg-gradient-to-br from-indigo-500/30 to-blue-500/30;
  transform: rotateY(-90deg) translateZ(48px);
}

.logo-face-top {
  @apply bg-gradient-to-br from-teal-500/30 to-cyan-500/30;
  transform: rotateX(90deg) translateZ(48px);
}

.logo-face-bottom {
  @apply bg-gradient-to-br from-amber-500/30 to-orange-500/30;
  transform: rotateX(-90deg) translateZ(48px);
}

/* Progress Bar */
.loading-progress {
  @apply w-48 h-1 mt-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full;
  width: 0%;
  animation: loadProgress 3s ease-out forwards;
}

/* Loading Text */
.loading-text {
  @apply text-sm font-medium;
}

.text-gradient {
  @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  @apply dark:from-blue-400 dark:to-purple-400;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes logoRotate {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  33% {
    transform: rotateX(20deg) rotateY(120deg);
  }
  66% {
    transform: rotateX(-20deg) rotateY(240deg);
  }
  100% {
    transform: rotateX(0deg) rotateY(360deg);
  }
}

@keyframes loadProgress {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>