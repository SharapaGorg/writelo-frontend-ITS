// plugins/i18n.ts
import {defineNuxtPlugin} from '#app'
import i18n from '../scripts/shared/i18n'

export default defineNuxtPlugin((nuxtApp) => {
    // Проверить сохраненный язык в localStorage
    const savedLocale = typeof window !== 'undefined'
        ? localStorage.getItem('preferred-locale')
        : null

    if (savedLocale && ['en', 'ru'].includes(savedLocale)) {
        i18n.global.locale.value = savedLocale
    }

    if (!savedLocale) {
        i18n.global.locale.value = 'ru';
    }

    nuxtApp.vueApp.use(i18n)
})
