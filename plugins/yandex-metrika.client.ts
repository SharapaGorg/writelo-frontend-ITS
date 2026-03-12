/**
 * Yandex Metrica plugin for Nuxt 3 SPA
 * - Loads Metrica script
 * - Tracks all SPA route changes
 * - Enables Webvisor for session recording
 */

const METRIKA_ID = 107274460

declare global {
    interface Window {
        ym: (id: number, action: string, ...args: unknown[]) => void
    }
}

// Augment NuxtApp for type-safe $ym and $trackGoal
declare module '#app' {
    interface NuxtApp {
        $ym: (action: string, ...args: unknown[]) => void
        $trackGoal: (goalName: string, params?: Record<string, unknown>) => void
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $ym: (action: string, ...args: unknown[]) => void
        $trackGoal: (goalName: string, params?: Record<string, unknown>) => void
    }
}

export default defineNuxtPlugin(() => {
    const router = useRouter()

    // Initialize Metrica
    const initMetrika = () => {
        // Create ym function queue
        window.ym = window.ym || function (...args: unknown[]) {
            (window.ym as unknown as { a: unknown[] }).a = (window.ym as unknown as { a: unknown[] }).a || []
            ;(window.ym as unknown as { a: unknown[] }).a.push(args)
        }

        // Configure counter
        window.ym(METRIKA_ID, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            trackHash: true,
        })

        // Load Metrica script
        const script = document.createElement('script')
        script.src = 'https://mc.yandex.ru/metrika/tag.js'
        script.async = true
        document.head.appendChild(script)

        // Fallback noscript pixel (for tracking even if JS fails after initial load)
        const noscript = document.createElement('noscript')
        const img = document.createElement('img')
        img.src = `https://mc.yandex.ru/watch/${METRIKA_ID}`
        img.style.cssText = 'position:absolute;left:-9999px'
        img.alt = ''
        noscript.appendChild(img)
        document.body.appendChild(noscript)
    }

    // Track SPA page views
    const trackPageView = (url: string) => {
        if (window.ym) {
            window.ym(METRIKA_ID, 'hit', url, {
                title: document.title,
            })
        }
    }

    // Initialize on client
    initMetrika()

    // Track route changes for SPA
    router.afterEach((to) => {
        // Small delay to ensure title is updated
        setTimeout(() => {
            trackPageView(to.fullPath)
        }, 100)
    })

    // Provide helper for manual goal tracking
    return {
        provide: {
            ym: (action: string, ...args: unknown[]) => {
                if (window.ym) {
                    window.ym(METRIKA_ID, action, ...args)
                }
            },
            trackGoal: (goalName: string, params?: Record<string, unknown>) => {
                if (window.ym) {
                    window.ym(METRIKA_ID, 'reachGoal', goalName, params)
                }
            },
        },
    }
})
