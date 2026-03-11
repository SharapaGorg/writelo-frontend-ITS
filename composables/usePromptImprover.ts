import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import {useDebounce} from '@vueuse/core';
import {useI18n} from 'vue-i18n';
import {isMobile} from '~/scripts/features/utils';
import {ApiController} from '~/scripts/shared/api/controller';

export interface UsePromptImproverOptions {
    debounceMs?: number;
    minLength?: number;
    enabled?: boolean;
}

export function usePromptImprover(
    text: Ref<string>,
    options: UsePromptImproverOptions = {}
) {
    const {
        debounceMs = 2000,
        minLength = 10,
        enabled = true
    } = options;

    const {t} = useI18n();
    const $api = new ApiController();

    // State
    const isTyping = ref(false);
    const showImprover = ref(false);
    const isImproving = ref(false);
    const lastText = ref('');
    const textareaElement = ref<HTMLTextAreaElement | null>(null);

    // Debounced text to detect when user stops typing
    const debouncedText = useDebounce(text, debounceMs);

    // Watch for typing activity
    watch(text, (newVal, oldVal) => {
        if (newVal !== oldVal) {
            isTyping.value = true;
            showImprover.value = false;
        }
    });

    // Watch debounced text to show improver when user stops typing
    watch(debouncedText, () => {
        isTyping.value = false;

        // Show improver if conditions are met
        if (
            enabled &&
            text.value.trim().length >= minLength &&
            text.value !== lastText.value &&
            !isImproving.value
        ) {
            showImprover.value = true;
        }
    });

    // Handle Tab key press
    const handleKeydown = (event: KeyboardEvent) => {
        if (
            event.key === 'Tab' &&
            showImprover.value &&
            !isImproving.value &&
            !isMobile()
        ) {
            event.preventDefault();
            improvePrompt();
        }
    };

    // Improve prompt function
    const improvePrompt = async () => {
        if (!text.value.trim() || isImproving.value) return;

        isImproving.value = true;
        showImprover.value = false;
        lastText.value = text.value;

        try {
            const response = await $api.improvePrompt(text.value);

            if (response?.prompt && response.prompt !== text.value) {
                text.value = response.prompt;
                lastText.value = response.prompt; // Prevent re-showing improver for the same text

                // Refocus textarea after improvement if we have a reference
                if (textareaElement.value) {
                    textareaElement.value.focus();
                    // Move cursor to end
                    textareaElement.value.setSelectionRange(
                        textareaElement.value.value.length,
                        textareaElement.value.value.length
                    );
                }
            }
        } catch (error) {
            console.error('Failed to improve prompt:', error);
        } finally {
            isImproving.value = false;
        }
    };

    // Set up and clean up event listeners
    const setupKeyboardListener = (element: HTMLTextAreaElement) => {
        textareaElement.value = element;
        element.addEventListener('keydown', handleKeydown);
    };

    const cleanupKeyboardListener = () => {
        if (textareaElement.value) {
            textareaElement.value.removeEventListener('keydown', handleKeydown);
        }
    };

    onUnmounted(() => {
        cleanupKeyboardListener();
    });

    // Mark current text as processed (to prevent improver from showing)
    const markAsProcessed = () => {
        lastText.value = text.value;
        showImprover.value = false;
    };

    // Computed properties
    const buttonText = computed(() => {
        if (isMobile()) {
            return 'Улучшить промпт';
        }
        return 'Tab - улучшить промпт';
    });

    const buttonTooltip = computed(() => {
        if (isMobile()) {
            return t('prompt-improver.enhance');
        }
        return t('prompt-improver.press-tab');
    });

    return {
        // State
        showImprover,
        isImproving,

        // Methods
        improvePrompt,
        setupKeyboardListener,
        cleanupKeyboardListener,
        markAsProcessed,

        // UI helpers
        buttonText,
        buttonTooltip
    };
}