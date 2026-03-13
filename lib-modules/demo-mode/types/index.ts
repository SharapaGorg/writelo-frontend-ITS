import type { ComputedRef } from 'vue'

export interface DemoTemplate {
  id: string
  match: (text: string) => boolean
  response: string
  title: string
}

export interface DemoStreamOptions {
  baseDelay: number // базовая задержка между символами (ms)
  variance: number // случайный разброс (ms)
  punctuationDelay: number // доп. задержка на пунктуации (ms)
}

export interface UseDemoModeReturn {
  isDemoMode: ComputedRef<boolean>
  isGuestDemo: ComputedRef<boolean> // true when demo due to unauthenticated
  getDemoStream: (messageText: string) => ReadableStream<Uint8Array> | null
}
