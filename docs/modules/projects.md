# Модуль Projects

> Документация для понимания архитектуры модуля проектов

## Что такое Project

**Project** (проект/клиент) — контейнер для организации AI-диалогов:
- Группирует conversations по клиенту/бренду
- Хранит **customInstructions** — системный промпт, который применяется ко всем диалогам проекта
- Связь: User → Projects → Conversations (1:N:N)

---

## Структура модуля

```
lib-modules/projects/
├── components/           # 11 Vue компонентов
├── composables/          # useProjects, useConversationAssignment
├── helpers/              # API, toaster, formation utilities
├── stores/               # projectsStore.ts (Pinia)
├── types/                # Project, ProjectsState, etc.
└── index.ts              # Публичные экспорты
```

---

## Ключевые типы

```typescript
interface Project {
    id: string;
    title: string;
    customInstructions?: string;  // Системный промпт
    createdAt: string;
    modifiedAt: string;
}
```

---

## Store (projectsStore.ts)

**State:**
- `projects` — список проектов
- `selectedProjectId` — активный проект (null = "Все чаты")
- `currentConversations` — диалоги выбранного проекта
- `projectsConversations` — кэш диалогов по проектам (Map)

**Computed:**
- `currentGroups` — группировка по датам (today, last_7_days, last_30_days, годы)

**Actions:**
- `fetchProjects()`, `selectProject()`, `addProject()`, `updateProject()`, `removeProject()`
- `assignConversationToProject(previousId, projectId, conversationId)`

---

## Composables

### useProjects()

```typescript
createProject(input)
updateProject(id, input)
deleteProject(id)
selectProject(id | null)
addConversationToProject(projectId, conversationId, name)
removeConversationFromProject(projectId, conversationId)
```

### useConversationAssignment()

```typescript
assignmentMode: { conversationId, conversationTitle }
enterAssignmentMode(id, title)   // Начать перемещение
exitAssignmentMode()             // Отменить
isInAssignmentMode: computed
```

---

## Компоненты

| Компонент | Назначение |
|-----------|------------|
| **ProjectTabs.vue** | Главный контейнер — табы проектов + All Chats |
| **ProjectTab.vue** | Одна вкладка проекта |
| **AllChatsTab.vue** | Вкладка "Все чаты" |
| **AddProjectButton.vue** | Кнопка "+" для создания |
| **CancelButton.vue** | Отмена режима назначения |
| **ProjectCreateWindow.vue** | Форма создания с брифом (бренд, ниша, ЦА, стиль) |
| **ProjectRename.vue** | Диалог переименования |
| **ProjectEditInstructions.vue** | Редактор customInstructions (до 2000 симв.) |
| **ProjectDeleteConfirmation.vue** | Подтверждение удаления |
| **ProjectContextMenu.vue** | Контекстное меню (ПКМ) |

---

## API эндпоинты

```
GET    /projects                    — Список проектов
POST   /projects                    — Создать (RequireFeature: Projects)
GET    /projects/{id}               — Детали проекта
PATCH  /projects/{id}               — Обновить title/customInstructions
DELETE /projects/{id}               — Soft delete

POST   /conversation/{id}/edit      — Назначить проект диалогу
       Body: { project_id: UUID | null }
```

---

## Интеграция с Conversations

**DialogsContentBlock.vue** переключает источник:

```typescript
const groups = computed(() => {
  if (projectsStore.selectedProjectId === null) {
    return conversationsStore.groups     // Все диалоги
  }
  return projectsStore.currentGroups     // Только проекта
})
```

---

## Workflow: Назначение диалога проекту

1. Пользователь кликает на диалог → "Move to project"
2. `enterAssignmentMode(conversationId, title)`
3. Табы подсвечиваются, появляется анимация
4. Клик по табу проекта:
   - API: `POST /conversation/{id}/edit` с `project_id`
   - Store: перемещение между кэшами
   - Выбор проекта, выход из режима назначения

---

## Helpers

### Formation utilities (группировка диалогов по датам)

```typescript
// Array-based (современный)
addConversationToFormationArray(chats, conversation)
removeConversationFromFormationArray(chats, id)
moveConversationToFormationArray(from, to, id)
```

---

## Особенности

1. **Lazy loading + кэширование** — до 200 диалогов на проект, хранятся в Map
2. **Soft delete** — проекты помечаются `Deleted=true`
3. **Custom Instructions** — собираются из брифа (бренд, ниша, ЦА, стиль, стоп-слова)
4. **Assignment Mode** — глобальное состояние для click-to-assign UX

---

## Диаграмма связей

```
┌─────────────────────────────────────┐
│   ProjectTabs (Main UI Container)   │
│  - Shows tabs for all projects      │
│  - "All Chats" tab                  │
│  - Add project button               │
└────────────┬────────────────────────┘
             │ uses
             ▼
┌──────────────────────────┐
│   useProjectsStore       │
│  - projects list         │
│  - selectedProjectId     │
│  - currentConversations  │
│  - modal state           │
└────────────┬─────────────┘
             │ watches selectedProjectId
             ▼
┌──────────────────────────┐
│  Load conversations API  │
│  (if not cached)         │
└──────────────────────────┘

┌──────────────────────────────────┐
│  DialogsContentBlock (Integrated) │
│  - Listens to selectedProjectId   │
│  - Shows global or project convs  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  useConversationAssignment       │
│  - Global assignment state       │
│  - Enables click-to-assign UI    │
└──────────────────────────────────┘
```
