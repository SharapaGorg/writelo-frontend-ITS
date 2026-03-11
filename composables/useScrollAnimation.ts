// composables/useScrollAnimation.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollAnimation(threshold = 0.1) {
  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            // Once visible, stop observing
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    elementRef,
    isVisible
  }
}
