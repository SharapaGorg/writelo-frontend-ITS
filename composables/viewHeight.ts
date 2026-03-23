// useViewHeight.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useViewHeight() {
    const viewHeight = ref(0)

    // Определяем, что работаем с клиентской частью
    const getHeight = () => {
        // Если доступен visualViewport (iOS 13+, современные браузеры)
        if (typeof window !== 'undefined' && window.visualViewport) {
            // visualViewport.height — видимая высота без клавиатуры
            return window.visualViewport.height
        }
        // Fallback для Android/старых браузеров
        if (typeof window !== 'undefined') {
            return window.innerHeight
        }
        // SSR fallback
        return 0
    }

    const updateHeight = () => {
        viewHeight.value = getHeight()
    }

    onMounted(() => {
        updateHeight()

        // Кроссплатформенно: и resize окна, и resize visualViewport
        window.addEventListener('resize', updateHeight)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateHeight)
        }
        // iOS Telegram иногда шлёт resize только после scroll/touch
        window.addEventListener('orientationchange', updateHeight)

        // Иногда нужно "дотолкать" вручную после появления клавиатуры
        document.addEventListener('focusin', updateHeight)
        document.addEventListener('focusout', updateHeight)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', updateHeight)
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', updateHeight)
        }
        window.removeEventListener('orientationchange', updateHeight)
        document.removeEventListener('focusin', updateHeight)
        document.removeEventListener('focusout', updateHeight)
    })

    return viewHeight
}
