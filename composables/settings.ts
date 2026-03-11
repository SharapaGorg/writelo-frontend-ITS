// ~/composables/settings.ts

import {reactive, toRefs} from 'vue'
import type {
    ConfigType,
    FeatureType,
    Language,
    ModelType,
    ResponseStyleType,
    SubscriptionType
} from '~/scripts/shared/types/common'
import {ApiController} from '~/scripts/shared/api/controller'
import {useI18n} from 'vue-i18n'

const apiController = new ApiController();

const state = reactive({
    loaded: false,
    config: null as ConfigType | null,
    responseStyle: null as ResponseStyleType | null,
    language: 'ru' as Language,
    llm: null as ModelType | null,
    subscription: null as SubscriptionType | null,
    toolsEnabled: {} as Record<FeatureType, boolean>,
    role: null as Number | null,
    subscriptionStart: null as String | null,
    user: null as any | null
})

async function init(locale?: any) {
    const i18nLocale = locale || useI18n().locale
    const config = await apiController.getConfig()
    if (!config) return
    state.config = config

    const profile = await apiController.getMe()
    state.user = profile
    state.llm = config.models.find(item => item.name === profile.currentModel) || null
    state.subscription = config.subscriptions.find(item => item.id === profile.subscriptionId) || null
    state.role = profile.currentRole;
    state.subscriptionStart = profile.subscribedAt;

    // const settings = await apiController.getSettings()
    // if (!settings) return

    const styleId = profile.currentStyle
    if (styleId) {
        state.responseStyle = config.responseStyles.find(item => item.id === styleId) || null
    }
    state.language = profile.language
    i18nLocale.value = state.language

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

function getResponseStyle(): ResponseStyleType | null {
    return state.responseStyle
}

function getLanguage(): Language {
    return state.language
}

function getLlm(): ModelType | null {
    return state.llm
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
    const profile = await apiController.getMe()
    if (!profile) return

    state.user = profile

    if (state.config) {
        state.llm = state.config.models.find(item => item.name === profile.currentModel) || null
        state.subscription = state.config.subscriptions.find(item => item.id === profile.subscriptionId) || null
    }
    state.role = profile.currentRole;
    state.subscriptionStart = profile.subscribedAt;
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

function isBeenChanged(lang: string, respStyleId: number, llmName: string): boolean {
    return lang !== state.language ||
        respStyleId !== state.responseStyle?.id ||
        state.llm?.name !== llmName
}

function hasFeature(feature: FeatureType): boolean {
    return (state.subscription && (state.subscription as SubscriptionType).features.includes(feature))
}

function setToolState(tool: FeatureType, toolState: boolean) {
    state.toolsEnabled[tool] = toolState
}

async function saveChanges(language_: string, responseStyle_: ResponseStyleType, llm_: ModelType) {
    const sameLang = language_ === state.language
    const sameStyle = responseStyle_ === state.responseStyle
    const sameLlm = llm_ === state.llm

    if (sameLang && sameStyle && sameLlm) return

    // Save previous values for rollback
    const prevLanguage = state.language
    const prevResponseStyle = state.responseStyle
    const prevLlm = state.llm

    // Optimistically update state
    state.language = language_
    state.responseStyle = responseStyle_
    state.llm = llm_

    try {
        await apiController.saveSettings(language_, responseStyle_?.id ?? 0, llm_.name);
    } catch (error) {
        // Rollback to previous values on error
        state.language = prevLanguage
        state.responseStyle = prevResponseStyle
        state.llm = prevLlm
        throw error
    }
}

const settings = {
    // State (as ref/ссылки):
    ...toRefs(state),

    // Methods:
    init,
    getSubscription,
    getResponseStyle,
    getLanguage,
    getLlm,
    getConfig,
    isToolEnabled,
    isBeenChanged,
    hasFeature,
    setToolState,
    saveChanges,
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
