import TailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
    mode: "jit",
    darkMode: "media",
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
        "./lib-modules/**/*.{js,vue,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-text-color': 'var(--tg-theme-accent-text-color)',
                'color-scheme': 'var(--tg-color-scheme)',
                'bg-color': 'var(--tg-theme-bg-color)',
                'button-color': 'var(--tg-theme-button-color)',
                'button-text-color': 'var(--tg-theme-button-text-color)',
                'destructive-text-color': 'var(--tg-theme-destructive-text-color)',
                'header-bg-color': 'var(--tg-theme-header-bg-color)',
                'hint-color': 'var(--tg-theme-hint-color)',
                'link-color': 'var(--tg-theme-link-color)',
                'secondary-bg-color': 'var(--tg-theme-secondary-bg-color)',
                'section-bg-color': 'var(--tg-theme-section-bg-color)',
                'section-header-text-color': 'var(--tg-theme-section-header-text-color)',
                'subtitle-text-color': 'var(--tg-theme-subtitle-text-color)',
                'text-color': 'var(--tg-theme-text-color)',
                'design-background': '#0d0d0d',
                'design-text': '#e2e2e2',
                'design-sub-background': '#181818',
                'design-text-field': '#242424',
                't-background': '#000000',
                't-text': '#ffffff',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                code: '#27272A',
                "light-code": "#f9f9f9"
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            // Add transition and transform configuration
            transitionProperty: {
                'height': 'height', // Enable height transitions
                'spacing': 'margin, padding', // Enable margin and padding transitions
                'opacity': 'opacity', // Enable opacity transitions
                'transform': 'transform', // Enable transform transitions
            },
            transitionDuration: {
                '200': '200ms', // Add custom durations
                '300': '300ms',
                '500': '500ms',
            },
            transformOrigin: {
                'center': 'center', // Add transform origins
                'top': 'top',
                'bottom': 'bottom',
            },
            keyframes: {
                'accordion-down': {
                    from: {height: '0'},
                    to: {height: 'var(--radix-accordion-content-height)'},
                },
                'accordion-up': {
                    from: {height: 'var(--radix-accordion-content-height)'},
                    to: {height: '0'},
                },
                'marquee': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'marquee': 'marquee 15s linear infinite',
            }
        }
    },
    plugins: [
        require('tailwindcss-animate'),
        require('tailwindcss-gradients'),
        require('tailwindcss-transform'),
        TailwindScrollbar,
    ]
}