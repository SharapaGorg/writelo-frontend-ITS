# Demo Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать демо-режим для записи промо-ролика с заготовленными ответами AI и имитацией посимвольной генерации.

**Architecture:** Изолированный модуль `lib-modules/demo-mode/` с composable `useDemoMode()`, который при `?demo=true` перехватывает отправку сообщений и возвращает фейковый SSE-стрим вместо реального запроса к бекенду.

**Tech Stack:** Vue 3, TypeScript, Nuxt 3, ReadableStream API

---

### Task 1: Создать структуру модуля и типы

**Files:**
- Create: `lib-modules/demo-mode/types/index.ts`
- Create: `lib-modules/demo-mode/index.ts`

**Step 1: Создать типы**

```typescript
// lib-modules/demo-mode/types/index.ts

export interface DemoTemplate {
  id: string
  match: (text: string) => boolean
  response: string
  title: string
}

export interface DemoStreamOptions {
  baseDelay: number      // базовая задержка между символами (ms)
  variance: number       // случайный разброс (ms)
  punctuationDelay: number // доп. задержка на пунктуации (ms)
}

export interface UseDemoModeReturn {
  isDemoMode: ComputedRef<boolean>
  getDemoStream: (messageText: string) => ReadableStream<Uint8Array> | null
}
```

**Step 2: Создать публичный API модуля**

```typescript
// lib-modules/demo-mode/index.ts

export { useDemoMode } from './composables/useDemoMode'
export { default as DemoIndicator } from './components/DemoIndicator.vue'
export * from './types'
```

**Step 3: Commit**

```bash
git add lib-modules/demo-mode/
git commit -m "feat(demo-mode): add module structure and types"
```

---

### Task 2: Создать заготовленные ответы

**Files:**
- Create: `lib-modules/demo-mode/data/responses.ts`

**Step 1: Создать файл с ответами**

```typescript
// lib-modules/demo-mode/data/responses.ts

export const CONTENT_PLAN_RESPONSE = `## Контент-план для Кофейни "Зерно" на март 2026

### Неделя 1 (4-10 марта)

| День | Тип | Тема | Описание | Подпись |
|------|-----|------|----------|---------|
| Пн | Видео | Утренний ритуал | Бариста готовит первый эспрессо дня. Лучи солнца через окно, пар от чашки | Понедельник начинается с правильного зерна. Новая Кения Каратина — ягодная кислотность и шоколадное послевкусие |
| Ср | Фото | Завтрак дня | Flat white + круассан с лососем, вид сверху | Завтрак, который не требует слов. Только ты и твой кофе |
| Пт | Видео | Как мы обжариваем | Процесс обжарки на ростере, крупный план зёрен | Specialty — это не маркетинг. Это 14 минут обжарки, 3 дня отдыха и твоя идеальная чашка |
| Сб | Фото | Уголок для работы | Ноутбук, чашка, блокнот, мягкий свет | Удалёнка со вкусом. Wi-Fi бесплатный, кофе — бесценный |
| Вс | Видео | Латте-арт челлендж | Бариста рисует тюльпан за 10 секунд | Сможешь повторить? Приходи, научим |

### Неделя 2 (11-17 марта)

| День | Тип | Тема | Описание | Подпись |
|------|-----|------|----------|---------|
| Пн | Фото | Новое зерно | Пачка Эфиопии Иргачеффе на барной стойке | Эфиопия Иргачеффе — цветочные ноты и цитрус. На баре с завтрашнего дня, порция ограничена |
| Ср | Видео | За кулисами | Утренняя подготовка кофейни до открытия | 7:00. Через час откроемся. А пока — наша медитация |
| Пт | Фото | Десерт недели | Чизкейк с маракуйей крупным планом | Не "вкусняшка", а произведение кондитерского искусства |
| Сб | Видео | Интервью с гостем | Постоянный гость рассказывает, почему выбирает нас | "Здесь кофе делают люди, которые его понимают" — Артём, с нами 2 года |
| Вс | Фото | Зерно крупным планом | Макросъёмка обжаренных зёрен | Каждое зерно — это 1200+ химических соединений. Мы знаем, как раскрыть лучшие |

### Неделя 3 (18-24 марта)

| День | Тип | Тема | Описание | Подпись |
|------|-----|------|----------|---------|
| Пн | Видео | Доставка Яндекс | Курьер забирает заказ, бариста машет рукой | Доставляем тепло. Буквально — стаканы с двойной термозащитой |
| Ср | Фото | Команда | Групповое фото барист у стойки | Трое людей, 47 лет опыта на троих, один стандарт — specialty |
| Пт | Фото | Сезонный напиток | Раф с фисташкой и кардамоном | Весенний раф — фисташка, кардамон, никакого сиропа. Только настоящие ингредиенты |
| Сб | Видео | Каппинг для гостей | Гости пробуют и сравнивают сорта | Приходи на каппинг в субботу. Научишься отличать Кению от Колумбии за 40 минут |
| Вс | Фото | Атмосфера | Интерьер с гостями, живые эмоции | Место, где можно остаться собой. И с хорошим кофе |

### Неделя 4 (25-31 марта)

| День | Тип | Тема | Описание | Подпись |
|------|-----|------|----------|---------|
| Пн | Фото | Кофе на вынос | Стакан в руке на фоне весенней улицы | Весна + specialty = формула хорошего дня |
| Ср | Видео | Лайфхак от бариста | Как правильно хранить кофе дома | Герметичный контейнер, тёмное место, никакого холодильника. Запомни это |
| Пт | Фото | Бранч-сет | Полный завтрак с кофе, вид сверху | Бранч выходного дня: яйца бенедикт, авокадо-тост, двойной эспрессо |
| Сб | Видео | Q&A с основателем | Ответы на вопросы подписчиков | "Почему specialty дороже?" — Потому что это не commodity, это craft |
| Вс | Фото | Итоги месяца | Коллаж лучших моментов марта | Март был про кофе, людей и весеннее настроение. Апрель будет ещё лучше |

### Хештеги

#кофейнязерно #specialtycoffee #москвакофе #кофемосква #thirdwave #зерно #кофекультура #бариста #латтеарт #кофеманы`

export const REELS_IDEAS_RESPONSE = `## 10 идей для Reels — Кофейня "Зерно"

### 1. "Утро бариста за 15 секунд"
**Сценарий:** Быстрая нарезка: будильник 6:00 → душ → дорога → открытие кофейни → первый эспрессо → улыбка в камеру
**Текст на экране:** "POV: ты работаешь с кофе, который любишь"
**Звук:** Trending audio с нарастающим битом
**Хронометраж:** 15 сек

---

### 2. "Эспрессо в слоумо"
**Сценарий:** Экстракция эспрессо в рапиде 120fps. Густая струя, тигровые полоски, пенка крема
**Текст на экране:** "25 секунд совершенства" → "18 грамм зерна" → "36 грамм в чашке"
**Звук:** Lo-fi бит или ASMR (звук экстракции)
**Хронометраж:** 20 сек

---

### 3. "Угадай зерно"
**Сценарий:** Бариста с завязанными глазами пробует 3 сорта, угадывает каждый. Подписчики в комментах угадывают вместе
**Текст на экране:** "Кения?" → "Эфиопия?" → "Бразилия?" + правильные ответы
**Звук:** Интригующий trending audio
**Хронометраж:** 30 сек

---

### 4. "Латте-арт батл"
**Сценарий:** Два бариста одновременно рисуют арт. Сплит-скрин. В конце голосование — кто лучше?
**Текст на экране:** "Слева или справа?" → "Голосуй в комментах"
**Звук:** Competitive/battle trending audio
**Хронометраж:** 20 сек

---

### 5. "Как не надо заказывать кофе"
**Сценарий:** Серия "красных флагов": "Мне самый большой латте с карамелью и побольше сиропа" — бариста грустно смотрит в камеру
**Текст на экране:** "Мы не судим..." → "...но немного грустим"
**Звук:** Trending "red flag" audio
**Хронометраж:** 15 сек

---

### 6. "От зерна до чашки"
**Сценарий:** Быстрая цепочка: плантация → обжарка → помол → экстракция → чашка в руках гостя
**Текст на экране:** "8000 км" → "14 мин обжарки" → "25 сек экстракции" → "1 идеальная чашка"
**Звук:** Эпичный нарастающий трек
**Хронометраж:** 20 сек

---

### 7. "Типы гостей в кофейне"
**Сценарий:** Бариста показывает типажи: "Тот, кто работает 8 часов на одном капучино" → "Тот, кто пришёл на 5 минут и остался на весь день" → "Тот, кто знает имена всех барист"
**Текст на экране:** Соответствующие подписи
**Звук:** Trending character audio
**Хронометраж:** 25 сек

---

### 8. "Секретное меню"
**Сценарий:** Шёпотом: "Вообще-то у нас есть секретный напиток..." → показ приготовления необычного авторского напитка
**Текст на экране:** "Скажи бариста кодовое слово 'Зерно'" → "И получи это"
**Звук:** ASMR/whisper trending audio
**Хронометраж:** 25 сек

---

### 9. "Кофе vs. Не кофе"
**Сценарий:** Сплит-скрин: слева — утро с хорошим specialty, человек продуктивен, счастлив. Справа — утро без кофе, хаос, опоздание
**Текст на экране:** "С кофе" / "Без кофе"
**Звук:** Before/after trending audio
**Хронометраж:** 15 сек

---

### 10. "Ответ хейтерам specialty"
**Сценарий:** Зачитываем реальные комментарии: "Да это просто кофе, чё вы выпендриваетесь" → бариста спокойно готовит идеальный эспрессо, делает глоток, улыбается
**Текст на экране:** "Кто понял, тот понял"
**Звук:** Confident/unbothered trending audio
**Хронометраж:** 20 сек`
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/data/
git commit -m "feat(demo-mode): add pre-generated demo responses for Зерно"
```

---

### Task 3: Создать composable useDemoMode

**Files:**
- Create: `lib-modules/demo-mode/composables/useDemoMode.ts`

**Step 1: Создать composable**

```typescript
// lib-modules/demo-mode/composables/useDemoMode.ts

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { DemoTemplate, DemoStreamOptions, UseDemoModeReturn } from '../types'
import { CONTENT_PLAN_RESPONSE, REELS_IDEAS_RESPONSE } from '../data/responses'

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

export function useDemoMode(): UseDemoModeReturn {
  const route = useRoute()

  const isDemoMode = computed(() => {
    return route.query.demo === 'true'
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
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/composables/
git commit -m "feat(demo-mode): add useDemoMode composable with stream generation"
```

---

### Task 4: Создать компонент DemoIndicator

**Files:**
- Create: `lib-modules/demo-mode/components/DemoIndicator.vue`

**Step 1: Создать компонент**

```vue
<!-- lib-modules/demo-mode/components/DemoIndicator.vue -->
<template>
  <Transition name="fade">
    <div v-if="isDemoMode" class="demo-indicator">
      DEMO
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useDemoMode } from '../composables/useDemoMode'

const { isDemoMode } = useDemoMode()
</script>

<style scoped>
.demo-indicator {
  @apply fixed bottom-4 left-4 z-50;
  @apply px-2 py-1 rounded text-xs font-mono font-bold;
  @apply bg-red-500/80 text-white;
  @apply pointer-events-none select-none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**Step 2: Commit**

```bash
git add lib-modules/demo-mode/components/
git commit -m "feat(demo-mode): add DemoIndicator component"
```

---

### Task 5: Интегрировать в страницу conversations/[id].vue

**Files:**
- Modify: `pages/conversations/[id].vue`

**Step 1: Добавить импорт и использование**

В начале `<script setup>` добавить:

```typescript
import { useDemoMode, DemoIndicator } from '~/lib-modules/demo-mode'
```

После `const apiController = new ApiController();` добавить:

```typescript
const { isDemoMode, getDemoStream } = useDemoMode()
```

**Step 2: Модифицировать myNewMessage**

Заменить блок в `myNewMessage()` (строки ~136-148):

```typescript
// Было:
streamResponse = await (async () => {
  switch (action) {
    case Action.reroll:
      return apiController.rerollMessage(conversation_id.value as string, response_uuid)
    case Action.newMessage:
      return apiController.sendMessage(conversation_id.value as string, messageText, request_uuid, response_uuid);
    case Action.edit:
      await apiController.editMessage(conversation_id.value as string, message_id, messageText);
      return apiController.rerollMessage(conversation_id.value as string, response_uuid);
  }
})();

// Стало:
streamResponse = await (async () => {
  // Demo mode: перехватываем для новых сообщений
  if (action === Action.newMessage) {
    const demoStream = getDemoStream(messageText)
    if (demoStream) {
      return demoStream
    }
  }

  switch (action) {
    case Action.reroll:
      return apiController.rerollMessage(conversation_id.value as string, response_uuid)
    case Action.newMessage:
      return apiController.sendMessage(conversation_id.value as string, messageText, request_uuid, response_uuid);
    case Action.edit:
      await apiController.editMessage(conversation_id.value as string, message_id, messageText);
      return apiController.rerollMessage(conversation_id.value as string, response_uuid);
  }
})();
```

**Step 3: Добавить DemoIndicator в template**

В `<template>` добавить перед `</template>`:

```vue
<DemoIndicator />
```

**Step 4: Commit**

```bash
git add pages/conversations/[id].vue
git commit -m "feat(demo-mode): integrate demo mode into conversation page"
```

---

### Task 6: Обновить index.ts модуля

**Files:**
- Modify: `lib-modules/demo-mode/index.ts`

**Step 1: Убедиться что все экспорты на месте**

Файл уже должен содержать нужные экспорты из Task 1. Проверить и при необходимости обновить.

**Step 2: Commit (если были изменения)**

```bash
git add lib-modules/demo-mode/index.ts
git commit -m "chore(demo-mode): update module exports"
```

---

### Task 7: Тестирование

**Step 1: Запустить dev-сервер**

```bash
yarn dev
```

**Step 2: Проверить демо-режим**

1. Открыть `http://localhost:3000/conversations/new?demo=true`
2. Убедиться что индикатор "DEMO" виден в левом нижнем углу
3. Выбрать шаблон "Контент-план" из дропдауна
4. Отправить сообщение
5. Убедиться что ответ появляется посимвольно
6. Убедиться что заголовок диалога устанавливается

**Step 3: Проверить что обычный режим работает**

1. Открыть `http://localhost:3000/conversations/new` (без ?demo=true)
2. Убедиться что индикатор НЕ виден
3. Отправить любое сообщение
4. Убедиться что идёт реальный запрос к бекенду

---

### Task 8: Финальный коммит

**Step 1: Проверить статус**

```bash
git status
```

**Step 2: Если есть незакоммиченные изменения**

```bash
git add .
git commit -m "feat(demo-mode): complete demo mode implementation"
```
