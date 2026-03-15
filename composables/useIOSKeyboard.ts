// composables/useIOSKeyboard.ts
// Fixes iOS Safari keyboard issues with fixed positioned elements

import { ref, onMounted, onUnmounted } from 'vue'
import { isIOS } from '~/scripts/features/utils'

/**
 * iOS Safari has a bug where `position: fixed; bottom: 0` elements
 * don't reposition when the virtual keyboard appears.
 *
 * This composable tracks the keyboard height and provides a CSS variable
 * that can be used to offset fixed elements.
 */
export function useIOSKeyboard() {
    const keyboardHeight = ref(0)
    const isKeyboardVisible = ref(false)

    if (typeof window === 'undefined') {
        return { keyboardHeight, isKeyboardVisible }
    }

    // Only apply on iOS
    if (!isIOS()) {
        return { keyboardHeight, isKeyboardVisible }
    }

    let cleanup: (() => void) | null = null

    onMounted(() => {
        // Initialize CSS variable immediately
        document.documentElement.style.setProperty('--ios-keyboard-height', '0px')

        if (!window.visualViewport) {
            return
        }

        const updateKeyboardHeight = () => {
            // visualViewport.height is the visible area (excluding keyboard)
            // window.innerHeight is the full viewport (including area behind keyboard)
            const currentKeyboardHeight = Math.max(0, window.innerHeight - window.visualViewport!.height)

            // Also account for visualViewport offset (Safari scrolls the viewport)
            const viewportOffset = window.visualViewport!.offsetTop

            keyboardHeight.value = currentKeyboardHeight
            isKeyboardVisible.value = currentKeyboardHeight > 100

            // Set CSS variable for use in styles
            document.documentElement.style.setProperty(
                '--ios-keyboard-height',
                `${currentKeyboardHeight}px`
            )

            // Set viewport offset for scroll compensation
            document.documentElement.style.setProperty(
                '--ios-viewport-offset',
                `${viewportOffset}px`
            )

            // Also update the visual viewport height
            document.documentElement.style.setProperty(
                '--ios-visual-viewport-height',
                `${window.visualViewport!.height}px`
            )

            // Update --vh to account for keyboard (important for layouts using 100vh)
            const vh = window.visualViewport!.height * 0.01
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }

        // Initial update
        updateKeyboardHeight()

        // Listen to viewport changes
        window.visualViewport.addEventListener('resize', updateKeyboardHeight)
        window.visualViewport.addEventListener('scroll', updateKeyboardHeight)

        // Also listen to focus events as backup
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement
            if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') {
                // Delay to let keyboard appear
                setTimeout(updateKeyboardHeight, 100)
                setTimeout(updateKeyboardHeight, 300)
                setTimeout(updateKeyboardHeight, 500)
            }
        }

        const handleBlur = () => {
            // Reset after keyboard hides
            setTimeout(() => {
                keyboardHeight.value = 0
                isKeyboardVisible.value = false
                document.documentElement.style.setProperty('--ios-keyboard-height', '0px')
                document.documentElement.style.setProperty('--ios-viewport-offset', '0px')
                // Restore --vh to full window height
                const vh = window.innerHeight * 0.01
                document.documentElement.style.setProperty('--vh', `${vh}px`)
            }, 100)
        }

        document.addEventListener('focusin', handleFocus)
        document.addEventListener('focusout', handleBlur)

        // Click outside to unfocus (useful on mobile)
        const handleClickOutside = (e: MouseEvent) => {
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

        document.addEventListener('click', handleClickOutside)

        cleanup = () => {
            window.visualViewport?.removeEventListener('resize', updateKeyboardHeight)
            window.visualViewport?.removeEventListener('scroll', updateKeyboardHeight)
            document.removeEventListener('focusin', handleFocus)
            document.removeEventListener('focusout', handleBlur)
            document.removeEventListener('click', handleClickOutside)
        }
    })

    onUnmounted(() => {
        cleanup?.()
    })

    return { keyboardHeight, isKeyboardVisible }
}
