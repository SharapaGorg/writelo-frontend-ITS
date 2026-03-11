import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import enMessages from '../i18n/locales/en.json'
import ruMessages from '../i18n/locales/ru.json'

export const useWebAuthI18n = () => {
  const { locale, t, setLocaleMessage, getLocaleMessage } = useI18n()

  // Merge web-auth translations with global i18n
  const initWebAuthI18n = () => {
    const currentEn = getLocaleMessage('en') || {}
    const currentRu = getLocaleMessage('ru') || {}
    
    setLocaleMessage('en', {
      ...currentEn,
      ...enMessages,
    })
    setLocaleMessage('ru', {
      ...currentRu,
      ...ruMessages,
    })
  }

  // Initialize on first use
  initWebAuthI18n()

  // Helper function to get auth-specific translations
  const authT = (key: string, params?: Record<string, unknown>) => {
    return t(`auth.${key}`, params ?? {})
  }

  return {
    locale: computed(() => locale.value),
    t: authT,
    globalT: t, // Access to global translations if needed
  }
}