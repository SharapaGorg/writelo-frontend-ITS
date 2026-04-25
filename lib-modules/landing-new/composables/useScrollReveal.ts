import { onMounted, onUnmounted, ref } from 'vue'

export function useScrollReveal(threshold = 0.15) {
  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || !elementRef.value) {
      isVisible.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer?.unobserve(entry.target)
          }
        }
      },
      { threshold },
    )
    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { elementRef, isVisible }
}
