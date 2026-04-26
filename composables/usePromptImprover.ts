import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import {useDebounce} from '@vueuse/core';
import {useI18n} from 'vue-i18n';
import {isMobile} from '~/scripts/features/utils';
import {ApiController} from '~/scripts/shared/api/controller';
import {useDemoMode} from '~/lib-modules/demo-mode';

export interface UsePromptImproverOptions {
    debounceMs?: number;
    minLength?: number;
    enabled?: boolean;
    // Landing showcase: behave like demo mode (no API call, fake response).
    showcaseMode?: boolean;
}

export function usePromptImprover(
    text: Ref<string>,
    options: UsePromptImproverOptions = {}
) {
    const {
        debounceMs = 2000,
        minLength = 10,
        enabled = true,
        showcaseMode = false
    } = options;

    const {t} = useI18n();
    const $api = new ApiController();
    const {isDemoMode} = useDemoMode();
    const useFakeResponse = () => isDemoMode.value || showcaseMode;

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
            // Demo / showcase: simulate loading and show demo message
            if (useFakeResponse()) {
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
                const demoResult = t('prompt-improver.demo-result');
                text.value = demoResult;
                lastText.value = demoResult;

                if (textareaElement.value) {
                    textareaElement.value.focus();
                    textareaElement.value.setSelectionRange(
                        textareaElement.value.value.length,
                        textareaElement.value.value.length
                    );
                }
                return;
            }

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