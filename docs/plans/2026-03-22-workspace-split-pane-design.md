# Workspace Split-Pane Design

## Overview

Реализация VS Code-style системы панелей для одновременной работы с несколькими чатами и/или генераторами изображений.

## Requirements

- 2-3 панели максимум
- Каждая панель = chat или imageGenerator (любая комбинация)
- Drag-resize между панелями
- Правый клик на заголовок → split/close
- Desktop only (< 1024px → одна панель)
- Состояние в URL для шаринга

## Architecture

### File Structure

```
lib-modules/workspace/
├── components/
│   ├── WorkspaceLayout.vue      # Главный контейнер с панелями
│   ├── WorkspacePanel.vue       # Обёртка одной панели
│   ├── ResizeHandle.vue         # Вертикальный разделитель (drag)
│   ├── PanelHeader.vue          # Заголовок панели с кнопками
│   └── PanelContextMenu.vue     # Правый клик: split, close
├── composables/
│   └── useWorkspace.ts          # Логика панелей, resize, URL sync
├── stores/
│   └── workspaceStore.ts        # Pinia: panels[], sizes[], activePanel
├── types/
│   └── index.ts                 # Panel, PanelType, WorkspaceState
└── index.ts                     # Public API

pages/app/workspace.vue          # Unified workspace route
```

### Data Model

```typescript
type PanelType = 'chat' | 'image'

interface Panel {
  id: string              // уникальный ID панели (uuid)
  type: PanelType
  chatId?: string         // для type='chat' - ID диалога
}

interface WorkspaceState {
  panels: Panel[]         // массив панелей (1-3)
  sizes: number[]         // проценты ширины [60, 40] или [33, 33, 34]
  activePanelId: string   // какая панель в фокусе
}
```

### URL Format

```
/app/workspace?panels=chat:abc123,image,chat:xyz789&sizes=40,30,30
```

Parsing:
- `chat:abc123` → `{ type: 'chat', chatId: 'abc123' }`
- `image` → `{ type: 'image' }`
- `sizes` — проценты через запятую

### Store

```typescript
// workspaceStore.ts
export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    panels: [] as Panel[],
    sizes: [] as number[],
    activePanelId: ''
  }),

  actions: {
    addPanel(type: PanelType, chatId?: string)
    removePanel(panelId: string)
    resizePanels(newSizes: number[])
    setActivePanel(panelId: string)
    splitPanel(panelId: string, direction: 'right')
    syncToUrl()
    syncFromUrl()
  }
})
```

## UI/UX Behavior

### Resize

- Вертикальный разделитель 6px между панелями
- Cursor `col-resize` при наведении
- Drag меняет `sizes[]` в реальном времени
- Минимальная ширина панели: 20%
- Double-click на разделитель → сброс к равным долям

### Panel Header

```
┌─────────────────────────────────────┐
│ [icon] Chat: "Название диалога"  ✕ │
└─────────────────────────────────────┘
```

- Иконка типа (chat/image)
- Название (для чата — title диалога, для image — "Image Generator")
- Кнопка закрыть (✕) — только если панелей > 1

### Context Menu (right-click on header)

- "Split Right" → добавить панель справа (если < 3 панелей)
- "Close" → закрыть панель (если > 1 панели)
- "Open Chat..." → выбрать другой диалог (для chat-панели)

### Focus

- Клик на панель делает её активной
- Активная панель имеет subtle border highlight
- Keyboard shortcuts применяются к активной панели

### Responsive

- На экранах < 1024px показываем только одну панель (первую)

## Integration

### Reusing Components

Chat panel:
```vue
<WorkspacePanel type="chat" :chatId="panel.chatId">
  <MessagesSection />
  <SendMessageSection />
</WorkspacePanel>
```

Image panel:
```vue
<WorkspacePanel type="image">
  <ImageGeneratorInput />
  <ImageGeneratorOutput />
</WorkspacePanel>
```

### Changes to Existing Modules

1. **conversations:** Добавить проп `chatId` в `MessagesSection` и `SendMessageSection` для поддержки нескольких чатов одновременно.

2. **imageGenerator:** Убрать `clearConversation()` при маунте. Добавить `instanceId` для поддержки нескольких генераторов.

3. **Stores:** Map-подход для множественных инстансов:

```typescript
// imageGeneratorStore.ts (модификация)
state: () => ({
  instances: new Map<string, ImageGeneratorState>()
})
```

## Edge Cases

### Invalid URL

- `?panels=chat:несуществующий_id` → показать пустой чат или создать новый
- `?panels=` (пусто) → дефолт: одна chat-панель с новым чатом
- `?sizes=50,50,50` (не совпадает с количеством панелей) → пересчитать равномерно

### Navigation

- Клик на диалог в sidebar → открывает его в активной chat-панели
- Каждое изменение layout пушит в browser history
- Back/Forward работает для отмены split/close

### Projects

- Project context применяется к chat-панелям
- Image generator остаётся без project-привязки

## Redirects (optional)

- `/app/conversations/:id` → `/app/workspace?panels=chat:id`
- `/app/image-generator` → `/app/workspace?panels=image`
