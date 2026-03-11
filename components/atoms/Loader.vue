<template>
  <div class="loader-container" :class="containerClasses">
    <div class="loader-content">
      <!-- Animation based on type -->
      <div class="animation-wrapper">
        <!-- Conversation Loading (Rotating arc) -->
        <div v-if="type === 'conversation'" class="conversation-loader">
          <div class="arc-container">
            <div class="arc"></div>
          </div>
        </div>
        
        <!-- Image Loading (Morphing squares) -->
        <div v-else-if="type === 'image'" class="image-loader">
          <div class="image-square"></div>
          <div class="image-square"></div>
          <div class="image-square"></div>
          <div class="image-square"></div>
        </div>
        
        <!-- File Loading (Document icon with progress) -->
        <div v-else-if="type === 'file'" class="file-loader">
          <div class="file-icon">
            <FileText class="w-8 h-8 text-gray-400" />
            <div class="file-progress"></div>
          </div>
        </div>
        
        <!-- Message Sending (Pulse dots) -->
        <div v-else-if="type === 'message'" class="message-loader">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        
        <!-- Search Loading (Magnifying glass) -->
        <div v-else-if="type === 'search'" class="search-loader">
          <Search class="search-icon" />
        </div>
        
        <!-- Dialogs Loading (Chat bubbles) -->
        <div v-else-if="type === 'dialogs'" class="dialogs-loader">
          <div class="chat-bubble chat-bubble-1"></div>
          <div class="chat-bubble chat-bubble-2"></div>
          <div class="chat-bubble chat-bubble-3"></div>
        </div>
        
        <!-- Default Loading (Simple spinner) -->
        <div v-else class="default-loader">
          <LoaderCircle class="animate-spin" />
        </div>
      </div>
      
      <!-- Loading text -->
      <div v-if="showText" class="loader-text">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ loadingText }}
        </p>
        <p v-if="subText" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ subText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { LoaderCircle, FileText, Search } from 'lucide-vue-next';

const { t } = useI18n();

interface Props {
  type?: 'default' | 'conversation' | 'image' | 'file' | 'message' | 'search' | 'dialogs';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  customText?: string;
  inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  showText: true,
  inline: false
});

// Dynamic loading texts based on type
const loadingTexts = computed(() => {
  const texts = {
    conversation: [
      t('loader.conversation.loading'),
      t('loader.conversation.fetching'),
      t('loader.conversation.preparing')
    ],
    image: [
      t('loader.image.loading'),
      t('loader.image.processing'),
      t('loader.image.optimizing')
    ],
    file: [
      t('loader.file.loading'),
      t('loader.file.analyzing'),
      t('loader.file.preparing')
    ],
    message: [
      t('loader.message.sending'),
      t('loader.message.processing')
    ],
    search: [
      t('loader.search.searching'),
      t('loader.search.finding')
    ],
    dialogs: [
      t('loader.dialogs.loading'),
      t('loader.dialogs.fetching'),
      t('loader.dialogs.organizing')
    ],
    default: [
      t('loader.default.loading'),
      t('loader.default.please_wait')
    ]
  };
  
  return texts[props.type] || texts.default;
});

const currentTextIndex = ref(0);
const loadingText = computed(() => 
  props.customText || loadingTexts.value[currentTextIndex.value]
);

const subText = computed(() => {
  if (props.type === 'file') return t('loader.file.subtext');
  if (props.type === 'search') return t('loader.search.subtext');
  if (props.type === 'dialogs') return t('loader.dialogs.subtext');
  return '';
});

// Rotate loading texts
let intervalId: NodeJS.Timeout;
onMounted(() => {
  if (loadingTexts.value.length > 1) {
    intervalId = setInterval(() => {
      currentTextIndex.value = (currentTextIndex.value + 1) % loadingTexts.value.length;
    }, 2000);
  }
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

// Size classes
const containerClasses = computed(() => {
  const sizeClasses = {
    small: 'scale-75',
    medium: 'scale-100',
    large: 'scale-125'
  };
  
  return [
    sizeClasses[props.size],
    props.inline ? 'inline-flex' : 'flex'
  ];
});
</script>

<style scoped>
.loader-container {
  @apply items-center justify-center pb-[150px];
}

.loader-content {
  @apply flex flex-col items-center gap-4;
}

.animation-wrapper {
  @apply relative;
}

/* Conversation loader - rotating arc */
.conversation-loader {
  @apply relative w-12 h-12 flex items-center justify-center;
}

.arc-container {
  @apply relative w-10 h-10;
  animation: arcRotate 2s linear infinite;
}

.arc {
  @apply absolute inset-0 rounded-full;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    #3b82f6 90deg,
    #8b5cf6 180deg,
    #ec4899 270deg,
    transparent 360deg
  );
  mask: radial-gradient(
    circle,
    transparent 55%,
    black 55%,
    black 100%
  );
  -webkit-mask: radial-gradient(
    circle,
    transparent 55%,
    black 55%,
    black 100%
  );
}

/* Image loader - morphing squares */
.image-loader {
  @apply grid grid-cols-2 gap-1 w-10 h-10;
}

.image-square {
  @apply w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-sm;
  animation: imageMorph 1.5s ease-in-out infinite;
}

.image-square:nth-child(1) { animation-delay: 0s; }
.image-square:nth-child(2) { animation-delay: 0.1s; }
.image-square:nth-child(3) { animation-delay: 0.2s; }
.image-square:nth-child(4) { animation-delay: 0.3s; }

/* File loader */
.file-loader {
  @apply relative;
}

.file-icon {
  @apply relative;
}

.file-progress {
  @apply absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full;
  animation: fileProgress 2s ease-in-out infinite;
}

/* Message loader - typing dots */
.message-loader {
  @apply flex gap-1;
}

.dot {
  @apply w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full;
  animation: messagePulse 1.4s ease-in-out infinite;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* Search loader */
.search-loader {
  @apply relative;
}

.search-icon {
  @apply w-8 h-8 text-gray-500 dark:text-gray-400;
  animation: searchRotate 2s ease-in-out infinite;
}

/* Dialogs loader - chat bubbles */
.dialogs-loader {
  @apply flex flex-col gap-1 w-12 h-12 justify-center;
}

.chat-bubble {
  @apply rounded-full bg-gray-300 dark:bg-gray-600;
  animation: chatBubbleFloat 1.8s ease-in-out infinite;
}

.chat-bubble-1 {
  width: 32px;
  height: 8px;
  align-self: flex-start;
  animation-delay: 0s;
}

.chat-bubble-2 {
  width: 24px;
  height: 8px;
  align-self: flex-end;
  animation-delay: 0.3s;
}

.chat-bubble-3 {
  width: 28px;
  height: 8px;
  align-self: flex-start;
  animation-delay: 0.6s;
}

/* Default loader */
.default-loader {
  @apply text-gray-500 dark:text-gray-400;
}

.default-loader .animate-spin {
  @apply w-8 h-8;
}

/* Loading text */
.loader-text {
  @apply text-center;
}

/* Animations */
@keyframes arcRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes imageMorph {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    border-radius: 0.125rem;
  }
  50% { 
    transform: scale(0.8) rotate(180deg);
    border-radius: 50%;
  }
}

@keyframes fileProgress {
  0% { width: 0%; }
  50% { width: 100%; }
  100% { width: 0%; }
}

@keyframes messagePulse {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@keyframes searchRotate {
  0%, 100% { transform: rotate(-15deg) scale(1); }
  50% { transform: rotate(15deg) scale(1.1); }
}

@keyframes chatBubbleFloat {
  0%, 100% { 
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>