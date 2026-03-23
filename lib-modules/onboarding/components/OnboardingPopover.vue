<template>
  <Teleport to="body">
    <!-- Hidden container for measuring dimensions before showing -->
    <div
      v-if="isVisible && !isPositionReady"
      ref="container"
      class="onboarding-custom-popover onboarding-custom-popover--measuring"
      :style="measuringStyle"
    >
      <div class="onboarding-custom-popover-content">
        <div class="onboarding-custom-popover-header">
          <h3 class="onboarding-custom-popover-title">{{ data?.title }}</h3>
        </div>
        <div class="onboarding-custom-popover-body">
          <p class="onboarding-custom-popover-description" v-html="data?.description"></p>
        </div>
        <div v-if="data?.showNext || data?.showPrevious" class="onboarding-custom-popover-footer">
          <div class="onboarding-custom-popover-buttons">
            <button v-if="data?.showNext" class="onboarding-custom-popover-btn onboarding-custom-popover-btn-primary">
              {{ buttonTexts.next }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actual visible popover -->
    <Transition name="popover-fade">
      <div v-if="isVisible && isPositionReady" class="onboarding-custom-popover" :style="popoverStyle">
        <Transition name="content-fade" mode="out-in">
          <div :key="contentKey" class="onboarding-custom-popover-content">
            <!--            <div v-if="!data?.fixedTop" class="onboarding-custom-popover-arrow" :class="`arrow-${popoverPlacement}`"></div>-->
            <div class="onboarding-custom-popover-header">
              <h3 class="onboarding-custom-popover-title">{{ data?.title }}</h3>
              <button
                  @click="clickFinish"
                  class="onboarding-custom-popover-close"
              >
                ✕
              </button>
            </div>
            <div class="onboarding-custom-popover-body">
              <p class="onboarding-custom-popover-description" v-html="data?.description"></p>
            </div>
            <div v-if="data?.showNext || data?.showPrevious" class="onboarding-custom-popover-footer">
              <div class="onboarding-custom-popover-buttons">
                <button
                    v-if="data?.showPrevious"
                    @click="$emit('previous')"
                    class="onboarding-custom-popover-btn onboarding-custom-popover-btn-secondary"
                >
                  {{ buttonTexts.previous }}
                </button>
                <button
                    v-if="data?.showNext"
                    @click="clickNext"
                    class="onboarding-custom-popover-btn onboarding-custom-popover-btn-primary"
                >
                  {{ buttonTexts.next }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {useOnboarding, ONBOARDING_BUTTONS} from "~/lib-modules/onboarding";

defineProps<{
  // isVisible: boolean
  // title: string
  // description: string
  // currentStep: number
  // totalSteps: number
  // showNext?: boolean
  // showPrevious?: boolean
}>()

defineEmits<{
  next: []
  previous: []
  close: []
}>()

const $onboarding = useOnboarding();
const {locale} = useI18n();

const isVisible = computed(() => $onboarding.isActive.value);
const data = computed(() => $onboarding.currentPopover.value);
const contentKey = computed(() => `${$onboarding.currentStep.value}-${Date.now()}`);

const isLast = computed(() => $onboarding.totalSteps.value - 1 === $onboarding.currentStep.value);

// Get localized button texts
const buttonTexts = computed(() => {
  const currentLocale = locale.value as 'ru' | 'en';
  return ONBOARDING_BUTTONS[currentLocale] || ONBOARDING_BUTTONS.ru;
});

const container = ref<HTMLElement | null>(null);

// Flag to control visibility after position is calculated
const isPositionReady = ref(false);

const clickNext = () => {
  $onboarding.next();
}

const clickFinish = () => {
  $onboarding.finish();
}

// Reactive position and placement
const popoverPosition = ref({x: 0, y: 0});
const popoverPlacement = ref<'top' | 'bottom' | 'left' | 'right'>('bottom');
const previousPosition = ref({x: 0, y: 0});

// Style for measuring container (invisible but in DOM)
const measuringStyle = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  opacity: '0',
  pointerEvents: 'none',
  zIndex: -1,
  visibility: 'hidden'
}));

// Computed style for positioning
const popoverStyle = computed(() => {
  // Check if current item has topFixed property
  if (data.value?.fixedTop) {
    return {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10001,
      pointerEvents: 'all'
    };
  }

  if (data.value?.fixedBottom) {
    return {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10001,
      pointerEvents: 'all'
    };
  }

  const {x, y} = popoverPosition.value;
  const placement = popoverPlacement.value;

  let style: any = {
    position: 'fixed',
    zIndex: 10001,
    pointerEvents: 'all'
  };

  switch (placement) {
    case 'bottom':
      style.top = `${y}px`;
      style.left = `${x}px`;
      style.transform = 'translateX(-50%)';
      break;
    case 'top':
      style.bottom = `${window.innerHeight - y}px`;
      style.left = `${x}px`;
      style.transform = 'translateX(-50%)';
      break;
    case 'right':
      style.top = `${y}px`;
      style.left = `${x}px`;
      style.transform = 'translateY(-50%)';
      break;
    case 'left':
      style.top = `${y}px`;
      style.right = `${window.innerWidth - x}px`;
      style.transform = 'translateY(-50%)';
      break;
  }

  return style;
});

// Function to calculate best placement
const calculatePosition = async () => {
  // Wait for measuring container to render
  await nextTick();

  if (!$onboarding.isActive.value || !$onboarding.currentItem.value) {
    return;
  }

  // Skip position calculation if popover is fixed to top/bottom
  if (data.value?.fixedTop || data.value?.fixedBottom) {
    isPositionReady.value = true;
    return;
  }

  // Wait for container to be available
  if (!container.value) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (!container.value) {
    // Fallback: just show it
    isPositionReady.value = true;
    return;
  }

  const element = document.getElementById($onboarding.currentItem.value.$el);
  if (!element) {
    console.warn(`[OnboardingPopover] Unable to find element #${$onboarding.currentItem.value.$el}`);
    return;
  }

  // Use nextTick to ensure popover dimensions are updated
  if (!container.value) return;

  const popoverHeight = container.value.clientHeight;
  const popoverWidth = 398 || container.value.clientWidth;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const rect = element.getBoundingClientRect();

  const elementCenterX = rect.left + rect.width / 2;
  const elementCenterY = rect.top + rect.height / 2;

  // Calculate available space on each side
  const spaceTop = rect.top;
  const spaceBottom = windowHeight - rect.bottom;
  const spaceLeft = rect.left;
  const spaceRight = windowWidth - rect.right;

  // Margin from viewport edges and element
  const margin = 20;
  const offset = 15;

  // Determine best placement
  let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  let x = 0;
  let y = 0;

  // Prefer vertical placement (top/bottom) for better readability
  if (spaceBottom >= popoverHeight + margin) {
    placement = 'bottom';
    x = elementCenterX
    y = rect.bottom + offset;
  } else if (spaceTop >= popoverHeight + margin) {
    placement = 'top';
    x = elementCenterX;
    y = rect.top - offset;
  } else if (spaceRight >= popoverWidth + margin) {
    placement = 'right';
    x = rect.right + offset;
    y = elementCenterY;
  } else if (spaceLeft >= popoverWidth + margin) {
    placement = 'left';
    x = rect.left - offset;
    y = elementCenterY;
  } else {
    // Default to bottom even if space is limited
    placement = 'bottom';
    x = elementCenterX;
    y = rect.bottom + offset;
  }

  // Ensure popover stays within viewport bounds
  if (placement === 'top' || placement === 'bottom') {
    // Horizontal bounds check
    const halfWidth = popoverWidth / 2;

    x = Math.max(halfWidth + margin, Math.min(x, windowWidth - halfWidth - margin));

    // Vertical bounds check
    if (placement === 'bottom') {
      y = Math.min(y, windowHeight - popoverHeight - margin);
    }
  } else {
    // Vertical bounds check
    const halfHeight = popoverHeight / 2;
    y = Math.max(halfHeight + margin, Math.min(y, windowHeight - halfHeight - margin));

    // Horizontal bounds check
    if (placement === 'right') {
      x = Math.min(x, windowWidth - popoverWidth - margin);
    }
  }

  // Check if position change is too large (more than 300px in any direction)
  const distanceThreshold = 300;
  const prevX = previousPosition.value.x;
  const prevY = previousPosition.value.y;
  const distance = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));

  // Update position
  popoverPosition.value = {x, y};
  popoverPlacement.value = placement;
  previousPosition.value = {x, y};

  // Now ready to show
  isPositionReady.value = true;
};

watch([$onboarding.currentItem, isVisible], async () => {
  if (isVisible.value) {
    // Reset position ready flag before calculating
    isPositionReady.value = false;
    await calculatePosition();
  } else {
    // Reset when hiding
    isPositionReady.value = false;
    previousPosition.value = {x: 0, y: 0};
  }
}, {immediate: true});

// Дополнительный watch для пересчета при изменении данных попапа
watch([data], async () => {
  if (isVisible.value && !isPositionReady.value) {
    await calculatePosition();
  }
}, {flush: 'post'});

onMounted(() => {
  window.addEventListener('resize', calculatePosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition);
});

</script>

<style scoped>
.onboarding-custom-popover {
  /* Position is now handled dynamically via :style */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-out;
}

/* Measuring container - invisible but needs to render for size calculation */
.onboarding-custom-popover--measuring {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* Transition for the entire popover (show/hide) */
.popover-fade-enter-active {
  animation: slideDown 0.3s ease-out;
}

.popover-fade-leave-active {
  animation: slideUp 0.3s ease-in;
}

/* Transition for content changes */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.content-fade-enter-to,
.content-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

.onboarding-custom-popover-content {
  @apply bg-background border border-border rounded-lg shadow-xl;
  max-width: 400px;
  min-width: 320px;
  position: relative;
}

/* Arrow styles */
.onboarding-custom-popover-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

/* Arrow positioning for each placement */
.arrow-bottom {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent var(--border) transparent;
}

.arrow-bottom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: -7px;
  border-style: solid;
  border-width: 0 7px 7px 7px;
  border-color: transparent transparent var(--background) transparent;
}

.arrow-top {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 8px 0 8px;
  border-color: var(--border) transparent transparent transparent;
}

.arrow-top::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -7px;
  border-style: solid;
  border-width: 7px 7px 0 7px;
  border-color: var(--background) transparent transparent transparent;
}

.arrow-left {
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent var(--border);
}

.arrow-left::after {
  content: '';
  position: absolute;
  right: 1px;
  top: -7px;
  border-style: solid;
  border-width: 7px 0 7px 7px;
  border-color: transparent transparent transparent var(--background);
}

.arrow-right {
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 8px 8px 0;
  border-color: transparent var(--border) transparent transparent;
}

.arrow-right::after {
  content: '';
  position: absolute;
  left: 1px;
  top: -7px;
  border-style: solid;
  border-width: 7px 7px 7px 0;
  border-color: transparent var(--background) transparent transparent;
}

.onboarding-custom-popover-header {
  @apply px-5 py-4 border-b border-border relative flex items-center justify-between;
}

.onboarding-custom-popover-title {
  @apply text-lg font-semibold text-foreground m-0 flex-1;
}

.onboarding-custom-popover-close {
  @apply w-6 h-6 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium border-none bg-transparent cursor-pointer;
}

.onboarding-custom-popover-body {
  @apply px-5 py-4;
}

.onboarding-custom-popover-description {
  @apply text-sm text-muted-foreground leading-relaxed m-0;
}

.onboarding-custom-popover-footer {
  @apply px-5 py-4 border-t border-border flex items-center justify-between gap-3;
}

.onboarding-custom-popover-progress {
  @apply text-xs text-muted-foreground;
}

.onboarding-custom-popover-buttons {
  @apply flex items-center gap-2;
}

.onboarding-custom-popover-btn {
  @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50;
  min-height: 36px;
  padding: 0 16px;
}

.onboarding-custom-popover-btn-primary {
  @apply bg-primary text-primary-foreground shadow hover:bg-primary/90;
}

.onboarding-custom-popover-btn-secondary {
  @apply border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground;
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  .onboarding-custom-popover-content {
    @apply bg-design-sub-background border-stone-800;
  }
}

/* Адаптивность */
@media (max-width: 640px) {
  .onboarding-custom-popover {
    width: calc(100% - 20px);
    max-width: 400px;
  }

  .onboarding-custom-popover-content {
    min-width: auto;
  }
}
</style>