import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import enMessages from '../i18n/locales/en.json'
import ruMessages from '../i18n/locales/ru.json'

export const useProfileI18n = () => {
  const { locale, t, setLocaleMessage, getLocaleMessage } = useI18n()

  // Merge profile translations with global i18n
  const initProfileI18n = () => {
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
  initProfileI18n()

  // Helper function to get profile-specific translations
  const profileT = (key: string, params?: Record<string, unknown>) => {
    return t(`profile.${key}`, params ?? {})
  }

  return {
    locale: computed(() => locale.value),
    t: profileT,
    globalT: t, // Access to global translations if needed
  }
}