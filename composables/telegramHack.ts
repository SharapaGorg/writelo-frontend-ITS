// composables/useTelegramViewportHack.ts

import {onMounted, onBeforeUnmount} from 'vue'
import {isIOS} from "~/scripts/features/utils";

/**
 * ARCHITECTURAL APPROACH - Document structure + CSS transforms + Touch simulation
 * Based on extensive research of Telegram WebApp iOS issues
 */
export function useTelegramViewportHack() {
    if (!isIOS()) return

    let isKeyboardVisible = false
    let touchSimulationTimer: number | null = null

    // 1. Setup document architecture to prevent Telegram viewport adjustment
    const setupDocumentArchitecture = () => {
        // Prevent document-level scrolling that triggers Telegram's behavior
        document.documentElement.style.overflow = 'hidden'
        document.documentElement.style.height = '100vh'
        document.body.style.overflow = 'hidden'
        document.body.style.height = '100vh'
        document.body.style.margin = '0'
        document.body.style.padding = '0'

        // Make the app container handle all scrolling internally
        const appContainer = document.querySelector('.fuck') as HTMLElement
        if (appContainer) {
            appContainer.style.overflow = 'hidden'
            appContainer.style.height = '100vh'
            appContainer.style.position = 'relative'
        }

        // Ensure document is always "scrollable" to prevent collapse
        // but with minimal scroll (1px) that doesn't affect layout
        document.documentElement.style.setProperty(
            "height",
            "calc(100vh + 1px)",
            "important"
        )

        // Force scroll to 1px to prevent collapse detection
        window.scrollTo(0, 1)
    }

    // 2. Setup Telegram WebApp with all available options
    const setupTelegramWebApp = () => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp

            // Use all available methods to prevent automatic behavior
            if (webApp.disableVerticalSwipes) {
                webApp.disableVerticalSwipes()
            }

            if (webApp.disableClosingConfirmation) {
                webApp.disableClosingConfirmation()
            }

            // Bind CSS variables for proper Telegram integration
            // Check if dark mode is active
            const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            const bgColor = isDarkMode ? '#0a0a0a' : '#ffffff' // --background: 0 0% 3.9% (dark) / 0 0% 100% (light)
            
            if (webApp.setHeaderColor) {
                webApp.setHeaderColor(bgColor)
            }

            if (webApp.setBackgroundColor) {
                webApp.setBackgroundColor(bgColor)
            }

            // Listen to Telegram viewport events and counter them
            if (webApp.onEvent) {
                webApp.onEvent('viewportChanged', (data: any) => {
                    // If Telegram tries to adjust viewport, counter it immediately
                    setTimeout(() => {
                        if (window.scrollY > 10) {
                            // Reset scroll position
                            window.scrollTo(0, 1)
                            // Trigger touch simulation to reset Telegram state
                            simulateUserTouch()
                        }
                    }, 50)
                })
                
                // Update colors when theme changes
                webApp.onEvent('themeChanged', () => {
                    const isDarkMode = window.Telegram?.WebApp?.colorScheme === 'dark'
                    const bgColor = isDarkMode ? '#0a0a0a' : '#ffffff'
                    
                    if (webApp.setHeaderColor) {
                        webApp.setHeaderColor(bgColor)
                    }

                    if (webApp.setBackgroundColor) {
                        webApp.setBackgroundColor(bgColor)
                    }
                })
            }
        }
    }

    // 3. CSS Transform approach for input positioning
    const setupInputPositioning = () => {
        const updateInputPosition = () => {
            if (isKeyboardVisible) {
                // Scroll the main wrapper to bottom to show text field above keyboard
                // Main wrapper now handles all scrolling while text field stays fixed
                const scrollContainer = document.querySelector('.main-wrapper') as HTMLElement
                if (scrollContainer) {
                    scrollContainer.scrollTo({
                        top: scrollContainer.scrollHeight,
                        behavior: 'smooth'
                    })
                }
            }
        }

        // Use Visual Viewport API if available
        if (window.visualViewport) {
            const handleViewportChange = () => {
                const keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport!.height)
                const wasVisible = isKeyboardVisible
                isKeyboardVisible = keyboardHeight > 100

                if (isKeyboardVisible !== wasVisible) {
                    updateInputPosition()

                    // If keyboard just appeared, prevent Telegram's auto-adjustment
                    if (isKeyboardVisible) {
                        preventTelegramAdjustment()
                    }
                }
            }

            window.visualViewport.addEventListener('resize', handleViewportChange)
            window.visualViewport.addEventListener('scroll', handleViewportChange)

            return () => {
                window.visualViewport!.removeEventListener('resize', handleViewportChange)
                window.visualViewport!.removeEventListener('scroll', handleViewportChange)
            }
        }

        // Fallback to window resize if Visual Viewport not available
        const handleResize = () => {
            updateInputPosition()
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }

    // 4. Prevent Telegram's delayed viewport adjustment
    const preventTelegramAdjustment = () => {
        // Clear any existing timer
        if (touchSimulationTimer) {
            clearTimeout(touchSimulationTimer)
        }

        // Monitor for Telegram's adjustment for 2 seconds
        let checkCount = 0
        const maxChecks = 20 // 2 seconds at 100ms intervals

        const checkAndCounter = () => {
            if (checkCount >= maxChecks || !isKeyboardVisible) return

            checkCount++

            // If Telegram moved us away from the 1px position, reset
            if (window.scrollY !== 1) {
                window.scrollTo(0, 1)

                // Simulate touch to reset Telegram's state
                simulateUserTouch()
            }

            // Continue monitoring
            setTimeout(checkAndCounter, 100)
        }

        // Start monitoring after a delay (Telegram adjusts after 500-1000ms)
        setTimeout(checkAndCounter, 200)
    }

    // 5. Simulate the user touch that fixes Telegram's behavior
    const simulateUserTouch = () => {
        try {
            // Create realistic touch events
            const touchObj = new Touch({
                identifier: Date.now(),
                target: document.body,
                clientX: window.innerWidth / 2,
                clientY: window.innerHeight / 2,
                force: 0.5,
                radiusX: 10,
                radiusY: 10,
                rotationAngle: 0
            })

            const touchStartEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [touchObj],
                targetTouches: [touchObj],
                changedTouches: [touchObj]
            })

            const touchEndEvent = new TouchEvent('touchend', {
                bubbles: true,
                cancelable: true,
                touches: [],
                targetTouches: [],
                changedTouches: [touchObj]
            })

            // Dispatch touch events with realistic timing
            document.body.dispatchEvent(touchStartEvent)

            setTimeout(() => {
                document.body.dispatchEvent(touchEndEvent)
            }, 50)

        } catch (error) {
            // Fallback: try to trigger a scroll event that might reset state
            window.dispatchEvent(new Event('scroll'))
        }
    }

    // 6. Handle input focus with minimal interference
    const handleInputFocus = () => {
        const onFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                isKeyboardVisible = true

                // Let the keyboard appear naturally, then prevent auto-adjustment
                setTimeout(() => {
                    preventTelegramAdjustment()
                }, 300)

                setTimeout(() => {
                    window.scrollTo({
                        top: window.innerHeight * 10,
                        behavior: 'smooth'
                    })
                }, 600)
            }
        }

        const onBlur = () => {
            setTimeout(() => {
                isKeyboardVisible = false

                // Clear any pending touch simulation
                if (touchSimulationTimer) {
                    clearTimeout(touchSimulationTimer)
                }

                // No need to reset anything - scrolling is natural
            }, 300)
        }

        document.addEventListener('focusin', onFocus)
        document.addEventListener('focusout', onBlur)

        return () => {
            document.removeEventListener('focusin', onFocus)
            document.removeEventListener('focusout', onBlur)
        }
    }

    // 7. Click outside to unfocus
    const handleClickOutside = () => {
        const onClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isInputElement = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT'
            const isInInputContainer = target.closest('.send-message-container')
            const hasNoBlurAttribute = target.closest('[data-no-blur="true"]')

            if (!isInputElement && !isInInputContainer && !hasNoBlurAttribute) {
                const focusedElement = document.activeElement as HTMLElement
                if (focusedElement && (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT')) {
                    focusedElement.blur()
                }
            }
        }

        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }

    onMounted(() => {
        console.log('Initializing Telegram viewport hack with architectural approach')

        // Setup document architecture first
        setupDocumentArchitecture()

        // Setup Telegram WebApp
        setupTelegramWebApp()

        // Setup input positioning with transforms
        const cleanupPositioning = setupInputPositioning()

        // Setup event handlers
        const cleanupFocus = handleInputFocus()
        const cleanupClick = handleClickOutside()

        // Initialize Telegram CSS variables
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        document.documentElement.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`)
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${window.innerHeight}px`)

        // Cleanup
        onBeforeUnmount(() => {
            if (cleanupPositioning) cleanupPositioning()
            cleanupFocus()
            cleanupClick()

            if (touchSimulationTimer) {
                clearTimeout(touchSimulationTimer)
            }

            // Reset document styles
            document.documentElement.style.overflow = ''
            document.documentElement.style.height = ''
            document.body.style.overflow = ''
            document.body.style.height = ''
        })
    })
}