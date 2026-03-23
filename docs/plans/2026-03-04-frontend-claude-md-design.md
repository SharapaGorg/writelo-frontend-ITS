# Frontend CLAUDE.md Documentation Design

**Date:** 2026-03-04
**Status:** Approved

## Problem

Claude Code при работе с frontend проектом:
- Долго анализирует проект каждый раз
- Пишет чистый CSS вместо Tailwind + shadcn-vue
- Дублирует существующие утилиты (форматирование, валидация)
- Ошибается в API интеграции (неправильные endpoints)
- Частично понимает lib-modules структуру
- Неправильные пути импортов (`app-modules/`, `lib-modules/` без `~/`)

## Solution

Единый расширенный CLAUDE.md (~300-400 строк) с:
- Жёсткими правилами (Hard Rules)
- Справочниками утилит и API
- Примерами для сложных паттернов

### Почему единый файл, а не docs/*.md
- CLAUDE.md загружается автоматически — гарантированно в контексте
- docs/*.md требует явного чтения — можно забыть/пропустить
- Размер 300-400 строк (~2-3k токенов) не проблема для контекста

## Structure

### 1. Hard Rules
Жёсткие правила которые нельзя нарушать:
- **Styling:** Только Tailwind + shadcn-vue из `components/ui/`, никакого чистого CSS
- **API:** Только через ApiController, никакого raw fetch
- **Utilities:** Проверять существующие перед написанием новых
- **Imports:** Использовать `~/` alias, внутри модулей — относительные пути

### 2. Import Rules
```typescript
// Глобальные импорты
import { useProjects } from '~/lib-modules/projects'
import { Button } from '~/components/ui/button'

// Внутри модуля
import { useStore } from '../stores'

// Из модулей — только через index.ts
import { Component, useHook, type Type } from '~/lib-modules/module'
```

### 3. Code Organization

| Тип кода | Куда класть |
|----------|-------------|
| Новая фича | `lib-modules/new-feature/` |
| Компонент для одной фичи | `lib-modules/feature/components/` |
| Компонент для нескольких модулей | `components/` |
| UI-примитивы (shadcn) | `components/ui/` |
| Глобальный стейт | `composables/` или `stores/` |
| Утилита общего назначения | `lib-modules/shared/` |

**Правила:**
- Всё новое → в `lib-modules/`
- `components/` — только переиспользуемое между модулями
- `scripts/` — legacy, новое туда НЕ пишем

### 4. Utilities Reference
Таблица существующих утилит:
- Formatting: `eraseConversationTitle()`, `isToday()`, `getChatsGroupsFormationArray()`
- Device: `isMobile()`, `isIOS()`, `isAndroid()`, `isInTelegramApp`
- General: `generateUUID()`, `cn()`, `downloadFile()`
- Toasts: `toastError()`, `toastCopyClipboard()`, etc.

Для сложных функций — примеры использования.

### 5. API Reference
- Как использовать ApiController
- Список методов: `getMe()`, `getConversations()`, `sendMessage()`, etc.
- Extended controllers: `ProjectsApiController`, `AuthApiController`
- Пример streaming

### 6. Lib-Modules Reference
Краткое описание каждого модуля с публичным API:
- **conversations:** `useCurrentConversation()`, `Message`, `MessagesSection`
- **imageGenerator:** `useImageGenerator()`, `useImageHistory()`
- **projects:** `useProjects()`, `ProjectTabs`
- **profile:** `ProfilePage`, `useProfileI18n()`
- **web-auth:** `AuthApiController`, `AuthForm`
- **onboarding:** `useOnboarding()`

### 7. State Management
- `useUserController()` — auth, user data
- `useSettings()` — app settings
- `useEnv()` — current environment
- `eventBus` — cross-component events

### 8. Common Patterns
Примеры для частых задач:
- Streaming messages parsing
- Creating a new module
- Extending ApiController

## Implementation Plan

1. Переписать текущий CLAUDE.md с новой структурой
2. Добавить все секции с актуальными данными
3. Проверить что все пути и примеры корректны

## Success Criteria

- Claude Code не пишет чистый CSS
- Claude Code использует существующие утилиты
- Claude Code правильно импортирует модули
- Claude Code знает куда класть новый код
- Время на понимание проекта сокращается
