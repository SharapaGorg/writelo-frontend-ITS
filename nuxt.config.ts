export default defineNuxtConfig({
    modules: [
        "@nuxtjs/tailwindcss",
        "shadcn-nuxt",
        "@nuxtjs/i18n",
        "@nuxt/image",
        "@pinia/nuxt",
        "@sentry/nuxt"
    ],

    plugins: ["plugins/markdownit"],
    ssr: false, // 👉 SPA-only, поэтому сервер рендерить страницы не будет

    devtools: {enabled: false},

    vite: {
        server: {
            allowedHosts: true,
        },
    },

    app: {
        head: {
            script: [
                {src: "https://telegram.org/js/telegram-web-app.js?57", defer: true},
            ],
        },
    },

    runtimeConfig: {
        public: {
            appBaseUrl: process.env.NUXT_PUBLIC_APP_BASE_URL ||
                (process.env.NODE_ENV === 'production'
                    ? 'https://neovision.space'
                    : 'https://nv2.radolyn.com'),
            telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
                (process.env.NODE_ENV === 'production'
                    ? 'AIHubGPTBot'
                    : 'test_neovision_bot'),
            sentry: {
                dsn: process.env.SENTRY_DSN,
                environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
            },
        },
    },

    compatibilityDate: "2024-11-26",

    css: [
        "katex/dist/katex.min.css",
        "@/assets/css/main.css",
        "@/assets/css/transitions.css"
    ],

    shadcn: {
        prefix: "",
        componentDir: "./components/ui",
    },

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
        experimental: {
            wasm: true,
        },
        prerender: {
            routes: [],
        },
    },

    // 👉 Sentry интеграция
    sentry: {
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
    },

    sourcemap: {
        client: "hidden", // клиентский код не полностью доступен
        server: true,     // серверные сорсмапы нужны, если используешь API через Nitro
    },

    i18n: {
        locales: [
            {code: 'en', iso: 'en-US'},
            {code: 'ru', iso: 'ru-RU'}
        ],
        defaultLocale: 'ru',
        strategy: 'no_prefix',

    },
});
