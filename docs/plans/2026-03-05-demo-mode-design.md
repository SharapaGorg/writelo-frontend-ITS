# Demo Mode Design

## Overview

Демо-режим для записи промо-ролика. Позволяет получать заготовленные высококачественные ответы вместо реальных запросов к бекенду, с имитацией посимвольной генерации.

## Goals

- Записать промо-ролик с идеальными ответами AI
- Имитировать реалистичную генерацию (посимвольный вывод)
- Не зависеть от работоспособности бекенда
- Легко удалить после записи

## Constraints

- Только 2 шаблона: контент-план и идеи для Reels
- Ответы всегда про "Кофейню Зерно" (независимо от выбранного проекта)
- Активация через URL-параметр `?demo=true`

## Architecture

```
lib-modules/demo-mode/
├── composables/
│   └── useDemoMode.ts      # Основная логика
├── data/
│   └── responses.ts        # Заготовленные ответы
├── components/
│   └── DemoIndicator.vue   # Индикатор в углу
├── types/
│   └── index.ts            # Типы
└── index.ts                # Публичный API
```

## Data Flow

1. `useDemoMode()` проверяет `?demo=true` в URL
2. При отправке сообщения проверяет совпадение с шаблоном
3. Если совпадает — возвращает `ReadableStream` с фейковым SSE
4. Если не совпадает — возвращает `null`, идёт реальный запрос

## Integration Point

```typescript
// pages/conversations/[id].vue
const { isDemoMode, getDemoStream } = useDemoMode()

// В myNewMessage():
const demoStream = getDemoStream(messageText)
if (demoStream) {
  streamResponse = demoStream
} else {
  streamResponse = await apiController.sendMessage(...)
}
```

## Fake Stream Format

Совместим с существующим парсером:

```
data: {"action": "text_chunk", "dt": "П"}
data: {"action": "text_chunk", "dt": "р"}
...
data: {"action": "set_title", "title": "Контент-план для Зерно"}
data: {"action": "response_end", "success": true}
```

## Typing Simulation

- Базовая задержка: 30-50ms на символ
- Вариативность: ±10ms рандомно
- Паузы на пунктуации (`. , \n`): +100-200ms

## Template Detection

```typescript
const DEMO_TEMPLATES = {
  'content-plan': {
    match: (text) => text.startsWith('Вы — "GPT'),
    response: CONTENT_PLAN_RESPONSE,
    title: 'Контент-план Кофейни Зерно'
  },
  'reels-ideas': {
    match: (text) => text.startsWith('Придумай 10 идей'),
    response: REELS_IDEAS_RESPONSE,
    title: '10 идей для Reels'
  }
}
```

## Demo Indicator

- Позиция: левый нижний угол (fixed)
- Вид: бейдж "DEMO" с полупрозрачным фоном
- Показывается только при `isDemoMode === true`
- Легко обрезать при монтаже

## Demo Responses Context

Ответы генерируются для Кофейни "Зерно":
- Ниша: specialty-кофе, Москва
- ЦА: 22-35 лет, кофейная культура, удалёнка
- Стиль: живой, на "ты", без канцелярита
- Запрещено: "вкусняшка", "кушать", "ароматный", "побаловать"

## Cleanup

После записи ролика:
1. Удалить `lib-modules/demo-mode/`
2. Убрать импорт и вызов из `[id].vue` (3-4 строки)
