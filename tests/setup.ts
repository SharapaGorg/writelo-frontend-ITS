import { vi } from 'vitest'
import { ref } from 'vue'

// Mock Nuxt auto-imports
vi.stubGlobal('defineNuxtPlugin', vi.fn())
vi.stubGlobal('useNuxtApp', vi.fn(() => ({
  $i18n: {
    locale: 'en',
    t: (key: string) => key
  }
})))
vi.stubGlobal('useRoute', vi.fn(() => ({
  params: {},
  query: {}
})))
vi.stubGlobal('useRouter', vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn()
})))
vi.stubGlobal('navigateTo', vi.fn())

// Mock Vue refs
vi.stubGlobal('ref', ref)
vi.stubGlobal('Ref', Object)

// Mock composables that might be called in templates
vi.stubGlobal('useSettings', vi.fn(() => ({
  getSubscription: vi.fn(() => null)
})))
vi.stubGlobal('useEnv', vi.fn(() => ({
  navbarVisible: ref(true),
  // currentDialogTitle: ref('Test Dialog')
})))

// Mock window.Telegram
global.window = global.window || {}
global.window.Telegram = {
  WebApp: {
    initData: 'test-init-data',
    initDataUnsafe: {
      user: {
        id: 123456,
        first_name: 'Test',
        last_name: 'User'
      }
    },
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    MainButton: {
      show: vi.fn(),
      hide: vi.fn(),
      setText: vi.fn()
    },
    BackButton: {
      show: vi.fn(),
      hide: vi.fn()
    },
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000'
    }
  }
} as any