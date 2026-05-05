// plugins/i18n.ts
import {defineNuxtPlugin} from '#app'
import i18n from '../scripts/shared/i18n'

export default defineNuxtPlugin((nuxtApp) => {
    // ВАЖНО: НЕ меняем locale до гидратации!
    // Иначе будет hydration mismatch: сервер рендерит с 'ru', а клиент ожидает 'en'

    // Устанавливаем дефолтный locale (должен совпадать с тем, что на сервере)
    i18n.global.locale.value = 'ru'

    nuxtApp.vueApp.use(i18n)

    // Применяем сохраненный locale ПОСЛЕ гидратации.
    // На /ru и /en источник истины — URL: страница сама форсит свою локаль,
    // localStorage не должен её перебивать (иначе зашёл на /en → текст пере-
    // ключается на ru через 50мс из-за сохранённой preferred-locale).
    if (typeof window !== 'undefined') {
        nuxtApp.hook('app:mounted', () => {
            const path = window.location.pathname
            if (path === '/ru' || path === '/en') return

            const savedLocale = localStorage.getItem('preferred-locale')
            if (savedLocale && ['en', 'ru'].includes(savedLocale)) {
                i18n.global.locale.value = savedLocale
            }
        })
    }
})
