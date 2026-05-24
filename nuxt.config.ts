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
        // / is a server-side locale redirector (see server/middleware/locale-redirect.ts).
        // It must NOT be prerendered — a static index.html would shadow the middleware.
        '/': {ssr: true},
        // Prerender для SEO (статический HTML при билде + SSR включен явно)
        '/en': {ssr: true, prerender: true},
        '/ru': {ssr: true, prerender: true},
        // Auth must stay dynamic so public runtime config follows the deployed env.
        '/auth': {ssr: true},
        '/auth/**': {ssr: true},
        '/landing': {ssr: true, prerender: true},
        '/start': {ssr: true, prerender: true},
        // Feature detail pages (RU) — нужны prerender + SSR для SEO и LLM-краулеров
        '/poisk-trendov-v-instagrame': {ssr: true, prerender: true},
        '/kontent-plan-dlya-smm': {ssr: true, prerender: true},
        '/ai-razbor-reels': {ssr: true, prerender: true},
        '/brif-brenda-dlya-ai': {ssr: true, prerender: true},
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
            meta: [
                {charset: 'utf-8'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                // Open Graph общие
                {property: 'og:type', content: 'website'},
                {property: 'og:site_name', content: 'Writelo'},
                // Twitter
                {name: 'twitter:card', content: 'summary_large_image'},
            ],
            link: [
                {rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png'},
                {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
                {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
                {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
                {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
                {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap'},
            ],
            script: [
                {
                    innerHTML: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
                    tagPosition: 'head',
                    tagPriority: 'critical',
                },
                {src: "https://telegram.org/js/telegram-web-app.js?57", defer: true},
            ],
        },
    },

    runtimeConfig: {
        public: {
            appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL ||
                ((process.env.APP_ENV || process.env.NODE_ENV) === 'production'
                    ? 'https://writelo.io'
                    : 'https://staging.writelo.io'),
            telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
                ((process.env.APP_ENV || process.env.NODE_ENV) === 'production'
                    ? 'writelo_bot'
                    : 'writelo_staging_bot'),
            supportTelegram: process.env.NUXT_PUBLIC_SUPPORT_TELEGRAM || 'NeoVisionSupport',
            supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || 'dushin.egor.dm@yandex.ru',
        },
    },

    compatibilityDate: "2024-11-26",

    css: [
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
            routes: [
                '/en',
                '/ru',
                '/landing',
                '/start',
                '/auth',
                '/poisk-trendov-v-instagrame',
                '/kontent-plan-dlya-smm',
                '/ai-razbor-reels',
                '/brif-brenda-dlya-ai',
            ],
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
