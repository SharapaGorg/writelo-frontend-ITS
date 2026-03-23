<script setup lang="ts">
// todo: подправить механику появления: сейчас если улучшить промпт, а потом убрать один символ, то снова появится возможность улучшить промпт
// хз пока, что с этим делать

import '../css/index.css'

import {ref, onMounted, watch} from 'vue';
import {usePromptImprover} from '~/composables/usePromptImprover';
import {Button} from '~/components/ui/button';
import type {UsePromptImproverOptions} from '~/composables/usePromptImprover';
import {isMobile} from '~/scripts/features/utils';

const props = withDefaults(defineProps<{
  modelValue: string;
  options?: UsePromptImproverOptions;
  disabled?: boolean;
  class?: string;
}>(), {
  disabled: false,
  class: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Create reactive ref for text that syncs with modelValue
const text = ref(props.modelValue);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  text.value = newVal;
});

// Watch for internal changes and emit
watch(text, (newVal) => {
  emit('update:modelValue', newVal);
});

// Initialize prompt improver
const {
  showImprover,
  isImproving,
  improvePrompt,
  setupKeyboardListener,
  markAsProcessed,
  buttonText,
  buttonTooltip
} = usePromptImprover(text, {
  enabled: !props.disabled,
  ...props.options
});

// Expose methods for parent components
defineExpose({
  markAsProcessed
});

// Wrapper element ref
const wrapperElement = ref<HTMLDivElement | null>(null);

onMounted(() => {
  // Find textarea inside the wrapper and set up keyboard listener
  const textarea = wrapperElement.value?.querySelector('textarea');
  if (textarea) {
    setupKeyboardListener(textarea as HTMLTextAreaElement);
  }
});

// Dynamic classes for the wrapper
const wrapperClasses = computed(() => {
  const classes = ['relative'];
  if (showImprover.value && !isImproving.value) {
    classes.push('prompt-improver-glow', 'active');
  }

  if (isImproving.value) {
    classes.push('rainbow-border')
  }

  if (props.class) {
    classes.push(props.class);
  }
  return classes.join(' ');
});
</script>

<template>
  <div ref="wrapperElement" :class="wrapperClasses">
    <!-- Slot for the textarea/input component -->
    <slot/>

    <!-- Tab/Enhance button -->
    <Transition name="prompt-improver-fade">
      <button
          v-if="showImprover && !isImproving"
          class="prompt-improver-button"
          :class="{ loading: isImproving }"
          :title="buttonTooltip"
          @click="improvePrompt"
          :disabled="disabled || isImproving"
          type="button"
      >
        {{ buttonText }}
      </button>
    </Transition>
  </div>
</template>