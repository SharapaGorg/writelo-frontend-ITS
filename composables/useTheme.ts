import { ref, computed, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'
const VALID_MODES: ThemeMode[] = ['system', 'light', 'dark']
const isClient = typeof window !== 'undefined'

const stored = isClient ? localStorage.getItem(STORAGE_KEY) as ThemeMode | null : null
const theme = ref<ThemeMode>(stored && VALID_MODES.includes(stored) ? stored : 'system')
const systemDark = ref(false)

const isDark = computed(() =>
  theme.value === 'system' ? systemDark.value : theme.value === 'dark'
)

function applyClass(dark: boolean) {
  if (!isClient) return
  document.documentElement.classList.toggle('dark', dark)
}

let initialized = false
function ensureBootstrap() {
  if (!isClient || initialized) return
  initialized = true

  systemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyClass(isDark.value)

  watch(isDark, (value) => applyClass(value))

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (event: MediaQueryListEvent) => {
    systemDark.value = event.matches
  }
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handler)
  } else {
    // Safari < 14 fallback
    // @ts-expect-error legacy api
    mq.addListener(handler)
  }
}

ensureBootstrap()

function setTheme(value: ThemeMode) {
  if (!VALID_MODES.includes(value)) return
  theme.value = value
  if (isClient) localStorage.setItem(STORAGE_KEY, value)
}

export function useTheme() {
  return { theme, isDark, setTheme }
}
