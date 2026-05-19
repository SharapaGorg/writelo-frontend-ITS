import { useMediaQuery } from '@vueuse/core'

const MOBILE_QUERY = '(max-width: 767px)'

export function useViewport() {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  return { isMobile }
}
