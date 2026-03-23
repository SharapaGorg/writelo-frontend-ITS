import {type AllowedButtons, driver} from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/onboarding.css";
import {
    ONBOARDING_ITEMS,
    ONBOARDING_ITEMS_LOCALIZED,
    ONBOARDING_BUTTONS,
    type OnboardingPopoverData
} from "~/lib-modules/onboarding";
import {Routes} from "~/scripts/shared/types";
import {toastOnboardingComplete} from "~/scripts/features/utils/toater";

// Get current locale from vue-i18n
function getCurrentLocale(): 'ru' | 'en' {
    if (process.client) {
        const {locale} = useI18n();
        return locale.value as 'ru' | 'en';
    }
    return 'ru';
}

function createLocalizedDriver(currentLocale: 'ru' | 'en') {
    const buttons = ONBOARDING_BUTTONS[currentLocale];

    return driver({
        showProgress: true,
        allowClose: false,
        doneBtnText: buttons.done,
        nextBtnText: buttons.next,
        prevBtnText: buttons.previous,
        showButtons: ['next', 'previous', 'close'],
        popoverClass: 'onboarding-popover',
        progressText: buttons.progress,
        overlayOpacity: 0.75,
    });
}


let $driver: any = null;

const currentStep = ref<number>(0);
const currentPopover = ref<OnboardingPopoverData | null>(null);
const isActive = ref<boolean>(false);

const fixedTopElements = ['settings-section', 'add-project-button', 'project-tab']; // todo: project-tab должен сам автоматически подстраиваться и не должен быть зафиксирован наверху
const fixedBottomElements = ['roles-section', 'project-edit-instructions-modal']

let currentClickHandler: ((event: Event) => void) | null = null;
let currentClickElement: HTMLElement | null = null;
let currentWatcherStop: (() => void) | null = null;

export const useOnboarding = () => {
    const {locale, t} = useI18n();
    const $settings = useSettings();

    // Get localized items based on current locale, filtered by available features
    const getLocalizedItems = () => {
        let items;
        if (process.client) {
            const currentLocale = locale.value as 'ru' | 'en';
            items = ONBOARDING_ITEMS_LOCALIZED[currentLocale] || ONBOARDING_ITEMS_LOCALIZED.ru;
        } else {
            items = ONBOARDING_ITEMS;
        }

        // Filter out items that require features the user doesn't have
        return items.filter(item => {
            if (!item.requiresFeature) return true;
            return $settings.hasFeature(item.requiresFeature);
        });
    };

    const cleanupClickHandler = () => {
        if (currentClickHandler && currentClickElement) {
            currentClickElement.removeEventListener('click', currentClickHandler);
            currentClickHandler = null;
            currentClickElement = null;
        }
    };

    const cleanupWatcher = () => {
        if (currentWatcherStop) {
            currentWatcherStop();
            currentWatcherStop = null;
        }
    };

    const showStep = (stepIndex: number) => {
        const items = getLocalizedItems();

        if (stepIndex < 0 || stepIndex >= items.length) {
            console.warn('[useOnboarding] < Invalid step index:', stepIndex);
            return;
        }

        cleanupClickHandler();
        cleanupWatcher();

        const element = items[stepIndex];
        const targetElement = document.getElementById(element.$el);

        currentPopover.value = {
            title: element.title,
            description: element.description,
            fixedTop: fixedTopElements.includes(element.$el),
            fixedBottom: fixedBottomElements.includes(element.$el)
        }

        if (!targetElement) {
            console.warn('[useOnboarding] < Element not found:', element.$el);
            return;
        }

        let buttons: AllowedButtons[] = ['close'];

        if (stepIndex > 0 && !element.waitForState) {
            // buttons.push('previous');
        }

        if (stepIndex < items.length - 1
            && !element.needClick
            && !element.waitForState
            && !element.externalAction
        ) {
            buttons.push('next');
            currentPopover.value.showNext = true;
        }

        // Initialize driver if not exists
        if (!$driver) {
            const currentLocale = locale.value as 'ru' | 'en';
            $driver = createLocalizedDriver(currentLocale);
        }

        if (element.needClick) {
            currentClickHandler = () => {
                if ($driver.isActive() && currentStep.value === stepIndex) {
                    setTimeout(() => {
                        next();
                    })
                }
            };

            currentClickElement = targetElement;
            targetElement.addEventListener('click', currentClickHandler);
        }

        if (element.waitForState) {
            currentWatcherStop = watch(element.waitForState, value => {
                if (!value) {
                    next();
                    cleanupWatcher();
                }
            })
        }

        // Special handling for settings section to allow dropdown interaction
        const highlightOptions: any = {
            element: "#" + element.$el,
        };

        // Special handling for settings section
        if (element.$el === "settings-section" || element.$el === 'roles-section') {
            // Destroy driver.js completely to allow full interaction
            $driver.destroy();
            return;
        }

        $driver.highlight(highlightOptions);
    }

    const start = async () => {
        // Navigate and wait for the route change to complete
        await navigateTo(Routes.newConversation);

        const items = getLocalizedItems();
        if (items.length === 0) {
            console.warn('[useOnboarding] < No onboarding items available');
            return;
        }

        // Initialize driver with current locale
        const currentLocale = locale.value as 'ru' | 'en';
        $driver = createLocalizedDriver(currentLocale);

        currentStep.value = 0;

        // Wait for DOM to render after navigation
        await nextTick();

        // Check that the first element exists before activating
        const firstElement = document.getElementById(items[0].$el);
        if (!firstElement) {
            // If element not found, wait a bit more for the page to fully render
            await new Promise(resolve => requestAnimationFrame(resolve));
            await nextTick();
        }

        isActive.value = true;
        showStep(0);
    }

    const finish = () => {
        cleanupClickHandler();
        cleanupWatcher();
        currentStep.value = 0;
        isActive.value = false;
        if ($driver) {
            $driver.destroy();
            $driver = null;
        }
        toastOnboardingComplete(t);
    }

    const next = () => {
        if (!isActive.value) return;

        const items = getLocalizedItems();
        const nextStep = currentStep.value + 1;
        if (nextStep >= items.length) {
            finish();
            return;
        }

        // Add a small delay to allow for smooth transitions
        cleanupClickHandler();
        cleanupWatcher();

        setTimeout(() => {
            currentStep.value = nextStep;
            showStep(nextStep);
        }, 50);
    }

    const previous = () => {
        if (!isActive.value) return;

        const prevStep = currentStep.value - 1;
        if (prevStep < 0) return;

        // Add a small delay to allow for smooth transitions
        cleanupClickHandler();
        cleanupWatcher();

        setTimeout(() => {
            currentStep.value = prevStep;
            showStep(prevStep);
        }, 50);
    }

    const currentItem = computed(() => {
        const items = getLocalizedItems();
        return items[currentStep.value];
    });

    return {
        start,
        finish,
        next,
        previous,
        currentStep: readonly(currentStep),
        isActive: readonly(isActive),
        totalSteps: computed(() => getLocalizedItems().length),
        currentItem,
        currentPopover
    }
}