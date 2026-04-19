// ~/composables/settings.ts

import {reactive, toRefs} from 'vue'
import {
    FeatureType,
    type ConfigType,
    type Language,
    type SubscriptionType
} from '~/scripts/shared/types/common'
import {ApiController} from '~/scripts/shared/api/controller'
import {useI18n} from 'vue-i18n'
import {useUserController} from '~/composables/user'

const apiController = new ApiController();

// Static demo config for guest demo mode
const DEMO_CONFIG: ConfigType = {
    languages: {ru: 'Русский', en: 'English'},
    roles: [],
    workspacePresets: {
        industries: [],
        toneOfVoice: []
    },
    filesConfig: {
        extensions: {
            'Images': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'Documents': ['pdf', 'doc', 'docx', 'txt']
        },
        maxFilesPerRequest: 5,
        maxFileSizeBytes: 10 * 1024 * 1024
    },
    imagesConfig: {
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
    },
    subscriptions: [
        {
            id: 1,
            price: 0,
            title: 'Demo',
            duration: 'P0D',
            description: '',
            features: [],
            featuresText: []
        },
        {
            id: 2,
            price: 990,
            title: 'Pro',
            duration: 'P30D',
            description: '',
            features: [FeatureType.search, FeatureType.workspaces, FeatureType.templates, FeatureType.imageGeneration],
            featuresText: []
        }
    ] as SubscriptionType[]
};

// Static demo user for guest demo mode
const DEMO_USER = {
    name: 'Демо Пользователь',
    email: 'demo@writelo.app',
    language: 'ru',
    currentRole: null,
    subscriptionId: 1,
    subscribedAt: null,
    pendingEmail: null,
    limits: {
        basic: {left: 50, total: 50},
        premium: {left: 0, total: 0}
    }
};

const state = reactive({
    loaded: false,
    config: null as ConfigType | null,
    language: 'ru' as Language,
    subscription: null as SubscriptionType | null,
    toolsEnabled: {} as Record<FeatureType, boolean>,
    role: null as Number | null,
    subscriptionStart: null as String | null,
    user: null as any | null
})

async function init(locale?: any) {
    const i18nLocale = locale || useI18n().locale
    const userController = useUserController()

    // Check if in demo mode (no token)
    const isGuestDemo = !userController.getToken()

    if (isGuestDemo) {
        // Use static demo config and user
        state.config = DEMO_CONFIG
        state.subscription = DEMO_CONFIG.subscriptions[0]
        state.user = DEMO_USER
        state.role = DEMO_USER.currentRole
        state.subscriptionStart = DEMO_USER.subscribedAt

        // Use local preference or default to ru
        const localPreferredLocale = typeof window !== 'undefined'
            ? localStorage.getItem('preferred-locale')
            : null

        if (localPreferredLocale && ['en', 'ru'].includes(localPreferredLocale)) {
            state.language = localPreferredLocale as Language
            i18nLocale.value = localPreferredLocale
        } else {
            state.language = 'ru'
            i18nLocale.value = 'ru'
        }

        state.loaded = true
        return
    }

    const config = await apiController.getConfig()
    if (!config) return
    state.config = config

    const profile = await apiController.getMe()
    state.user = profile
    state.subscription = config.subscriptions.find(item => item.id === profile.subscriptionId) || null
    state.role = profile.currentRole
    state.subscriptionStart = profile.subscribedAt

    // Only set language from server if user hasn't manually changed it locally
    const localPreferredLocale = typeof window !== 'undefined'
        ? localStorage.getItem('preferred-locale')
        : null

    if (localPreferredLocale && ['en', 'ru'].includes(localPreferredLocale)) {
        // User has a local preference, use it
        state.language = localPreferredLocale as Language
        i18nLocale.value = localPreferredLocale
    } else {
        // No local preference, use server value
        state.language = profile.language
        i18nLocale.value = state.language
    }

    state.loaded = true
}

function disableAllTools(): void {
    state.toolsEnabled = {};
}

function isPaidUser(): boolean {
    const sub = this.getSubscription();
    return sub && sub?.price > 0;
}

function getSubscription(): SubscriptionType | null {
    return state.subscription;
}

function getLanguage(): Language {
    return state.language
}

function getConfig(): ConfigType | null {
    return state.config
}

function getSubscriptionStart(): string | null {
    return state.subscriptionStart;
}

function getUser(): any | null {
    return state.user;
}

async function refreshUserData(): Promise<void> {
    // Skip in demo mode
    const userController = useUserController()
    if (!userController.getToken()) return

    const profile = await apiController.getMe()
    if (!profile) return

    state.user = profile

    if (state.config) {
        state.subscription = state.config.subscriptions.find(item => item.id === profile.subscriptionId) || null
    }
    state.role = profile.currentRole
    state.subscriptionStart = profile.subscribedAt
}

function setCurrentRole(value: number | null): void {
    state.role = value;
}

function getCurrentRole(): number | null {
    return state.role;
}

function isToolEnabled(tool: FeatureType): boolean {
    return !!state.toolsEnabled[tool];
}

function isBeenChanged(lang: string): boolean {
    return lang !== state.language
}

function hasFeature(feature: FeatureType): boolean {
    return (state.subscription && (state.subscription as SubscriptionType).features.includes(feature))
}

function setToolState(tool: FeatureType, toolState: boolean) {
    state.toolsEnabled[tool] = toolState
}

async function saveLanguage(language_: string) {
    if (language_ === state.language) return

    // Save previous value for rollback
    const prevLanguage = state.language

    // Optimistically update state
    state.language = language_ as Language

    // Also save to localStorage for persistence across sessions
    if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-locale', language_)
    }

    try {
        await apiController.saveSettings(language_)
    } catch (error) {
        // Rollback to previous value on error
        state.language = prevLanguage
        throw error
    }
}

const settings = {
    // State (as ref/ссылки):
    ...toRefs(state),

    // Methods:
    init,
    getSubscription,
    getLanguage,
    getConfig,
    isToolEnabled,
    isBeenChanged,
    hasFeature,
    setToolState,
    saveLanguage,
    disableAllTools,
    isPaidUser,
    getCurrentRole,
    getSubscriptionStart,
    setCurrentRole,
    getUser,
    refreshUserData,
}

export function useSettings() {
    return settings
}

export default settings;
