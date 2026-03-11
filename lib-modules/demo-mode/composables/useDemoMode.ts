// lib-modules/demo-mode/composables/useDemoMode.ts

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { DemoTemplate, DemoStreamOptions, UseDemoModeReturn } from '../types'
import { CONTENT_PLAN_RESPONSE, REELS_IDEAS_RESPONSE } from '../content/responses'

const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    id: 'content-plan',
    match: (text: string) => text.startsWith('Вы — "GPT'),
    response: CONTENT_PLAN_RESPONSE,
    title: 'Контент-план Кофейни Зерно'
  },
  {
    id: 'reels-ideas',
    match: (text: string) => text.startsWith('Придумай 10 идей'),
    response: REELS_IDEAS_RESPONSE,
    title: '10 идей для Reels'
  }
]

const DEFAULT_OPTIONS: DemoStreamOptions = {
  baseDelay: 15,
  variance: 10,
  punctuationDelay: 80
}

function createDemoStream(
  response: string,
  title: string,
  options: DemoStreamOptions = DEFAULT_OPTIONS
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const punctuation = new Set(['.', ',', '!', '?', '\n', ':', ';'])

  return new ReadableStream({
    async start(controller) {
      // Имитируем небольшую начальную задержку
      await sleep(300)

      // Отправляем символы по одному
      for (const char of response) {
        const sseData = JSON.stringify({ action: 'text_chunk', dt: char })
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`))

        // Задержка между символами
        let delay = options.baseDelay + (Math.random() * options.variance * 2 - options.variance)
        if (punctuation.has(char)) {
          delay += options.punctuationDelay
        }
        await sleep(delay)
      }

      // Отправляем title
      await sleep(200)
      const titleData = JSON.stringify({ action: 'set_title', title })
      controller.enqueue(encoder.encode(`data: ${titleData}\n\n`))

      // Завершаем стрим
      await sleep(100)
      const endData = JSON.stringify({ action: 'response_end', success: true })
      controller.enqueue(encoder.encode(`data: ${endData}\n\n`))

      controller.close()
    }
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const DEMO_STORAGE_KEY = 'demo-mode-active'

export function useDemoMode(): UseDemoModeReturn {
  const route = useRoute()

  // Сохраняем флаг в sessionStorage при первом обнаружении
  if (import.meta.client && route.query.demo === 'true') {
    sessionStorage.setItem(DEMO_STORAGE_KEY, 'true')
  }

  const isDemoMode = computed(() => {
    if (route.query.demo === 'true') return true
    if (import.meta.client) {
      return sessionStorage.getItem(DEMO_STORAGE_KEY) === 'true'
    }
    return false
  })

  const getDemoStream = (messageText: string): ReadableStream<Uint8Array> | null => {
    if (!isDemoMode.value) return null

    const template = DEMO_TEMPLATES.find(t => t.match(messageText))
    if (!template) return null

    console.log(`[Demo Mode] Using template: ${template.id}`)
    return createDemoStream(template.response, template.title)
  }

  return {
    isDemoMode,
    getDemoStream
  }
}
