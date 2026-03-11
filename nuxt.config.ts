export default defineNuxtConfig({
    modules: [
        "@nuxtjs/tailwindcss",
        "@nuxtjs/i18n",
        "@nuxt/image",
        "@pinia/nuxt",
    ],

    plugins: ["plugins/markdownit"],

    // Гибридный рендеринг: prerender для SEO-страниц, SPA для остального
    ssr: true,
    routeRules: {
        // Prerender для SEO (статический HTML при билде + SSR включен явно)
        '/': {ssr: true, prerender: true},
        '/auth': {ssr: true, prerender: true},
        '/auth/**': {ssr: true, prerender: true},
        '/landing': {ssr: true, prerender: true},
        '/start': {ssr: true, prerender: true},
        // SPA для приложения и остального
        '/app/**': {ssr: false},
        '/**': {ssr: false},
    },

    devtools: {enabled: false},

    vite: {
        server: {
            allowedHosts: true,
        },
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'ru',
            },
            title: 'Writelo — AI-ассистент для SMM',
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {
                    name: 'description',
                    content: 'AI-ассистент для создания контента в соцсетях. Посты, тексты и картинки за минуты. Бесплатный старт.'
                },
                // Open Graph
                {property: 'og:type', content: 'website'},
                {property: 'og:site_name', content: 'Writelo'},
                {property: 'og:locale', content: 'ru_RU'},
                {property: 'og:locale:alternate', content: 'en_US'},
                // Twitter
                {name: 'twitter:card', content: 'summary_large_image'},
            ],
            link: [
                {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
                {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
            ],
            script: [
                {src: "https://telegram.org/js/telegram-web-app.js?57", defer: true},
            ],
        },
    },

    runtimeConfig: {
        public: {
            appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL ||
                (process.env.NODE_ENV === 'production'
                    ? 'https://writelo.io'
                    : 'https://nv2.radolyn.com'),
            telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
                (process.env.NODE_ENV === 'production'
                    ? 'writelo_bot'
                    : 'test_neovision_bot'),
        },
    },

    compatibilityDate: "2024-11-26",

    css: [
        "katex/dist/katex.min.css",
        "@/assets/css/main.css",
        "@/assets/css/transitions.css"
    ],

    // Only scan .vue files in components/ui to avoid duplicates from index.ts re-exports
    components: [
        {path: '~/components/ui', extensions: ['vue']},
        {path: '~/components'},
    ],

    build: {
        postcss: {
            postcssOptions: {
                plugins: {
                    tailwindcss: {},
                    autoprefixer: {},
                },
            },
        },
    },

    typescript: {
        typeCheck: false,
    },

    image: {
        provider: "ipx",
        quality: 80,
        format: ["webp"],
        presets: {
            default: {
                modifiers: {
                    format: "webp",
                    quality: 80,
                },
            },
        },
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
        },
        ipx: {
            modifiers: {
                format: "webp",
                quality: 80,
            },
            maxAge: 60 * 60 * 24 * 7,
        },
    },

    nitro: {
        prerender: {
            routes: ['/', '/landing', '/start', '/auth'],
        },
        // Ускоряем билд
        minify: false,
    },

    sourcemap: false,

    i18n: {
        locales: [
            {code: 'en', iso: 'en-US'},
            {code: 'ru', iso: 'ru-RU'}
        ],
        defaultLocale: 'ru',
        strategy: 'no_prefix',

    },
});
