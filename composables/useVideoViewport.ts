// composables/useVideoViewport.ts
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

interface UseVideoViewportOptions {
  threshold?: number
  rootMargin?: string
}

export function useVideoViewport(
  videoRef: Ref<HTMLVideoElement | null>,
  options: UseVideoViewportOptions = {}
) {
  const { threshold = 0.5, rootMargin = '0px' } = options
  const isInViewport = ref(false)

  let observer: IntersectionObserver | null = null

  function setupObserver() {
    if (!videoRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport.value = entry.isIntersecting

          if (entry.isIntersecting) {
            videoRef.value?.play().catch(() => {
              // Autoplay blocked - ignore silently
            })
          } else {
            videoRef.value?.pause()
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(videoRef.value)
  }

  onMounted(() => {
    if (videoRef.value) {
      setupObserver()
    }
  })

  watch(videoRef, (newRef) => {
    if (observer) {
      observer.disconnect()
    }
    if (newRef) {
      setupObserver()
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    isInViewport
  }
}
