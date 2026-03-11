// // scripts/shared/i18n.ts
// import {createI18n} from 'vue-i18n'
//
// // Загружаем сообщения из JSON файлов
// const i18n = createI18n({
//     locales: [
//         {code: 'en', name: "English", iso: "en", file: 'en.json'},
//         {code: 'ru', name: "Espanol", iso: "ru", file: 'ru.json'}
//     ],
//     defaultLocale: 'en',
//     // vueI18n: {
//     //     fallbackLocale: 'en',
//     // },
//     strategy: 'prefix_except_default',
//     langDir: '../../i18n/locales/',
//     lazy: true,
//     vueI18n: '../../i18n/i18n.options.ts'
// })
//
// export default i18n

// scripts/shared/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '../../i18n/locales/en.json'
import ru from '../../i18n/locales/ru.json'

const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en,
        ru
    }
})

export default i18n
