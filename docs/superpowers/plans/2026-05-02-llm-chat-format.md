# LLM-чат: формат и место в продукте — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-05-02-llm-chat-format-design.md`

**Goal:** Вынести LLM-чат в отдельный раздел продукта (`/app/assistant`) с историей диалогов и action-кнопками, перевести editor-чат в режим scratch.

**Architecture:** Пять фаз, каждая независимо проверяется в браузере на гейте.
- Phase 0 — Skeleton: маршрут, sidebar item, заглушка страницы.
- Phase 1 — Активный чат: composer, SSE-стрим, lazy-create conversation, empty state.
- Phase 2 — Правая колонка истории: store, fetch, поиск, переключение, last-active.
- Phase 3 — Action-протокол: parser (с TDD), `ActionCard`, `save_as_idea`, `open_in_editor`, system_prompt.
- Phase 4 — Editor-чат: scratch-режим + кнопка `Очистить` + парсер для скрытия маркера.

**Tech Stack:** Nuxt 3 (file-based routing), Vue 3 + `<script setup>`, TypeScript, Tailwind, shadcn-vue, vue-sonner для тостов, vitest+happy-dom для unit-тестов чистой логики, `lucide-vue-next` для иконок.

**Конвенции (важно перед стартом):**
- API-контроллеры — **композиция** (`private api: ApiController`), не наследование. См. `lib-modules/workspaces/helpers/api.ts:11-19`. CLAUDE.md в этом пункте устарел — следовать реальному коду.
- Singleton-фабрика: `useFooApi()` хранит в `let instance: FooApiController | null = null`. См. `lib-modules/workspaces/helpers/api.ts:46-53`.
- Pure-логика → vitest (`lib-modules/<mod>/__tests__/<name>.test.ts`, `yarn test`). UI/composables/API → проверка только в браузере на гейте фазы.
- **Коммиты — только на verification gate в конце фазы**, после фразы пользователя «работает». Внутри фазы — никаких `git commit`. (memory: Don't auto-commit until user confirms.)
- AlertDialog (для rename/delete диалога истории) — два ref'а: `v-model:open` boolean + отдельный target ref (memory: derived `:open` гасит handler'ы).
- Виды импорта: `~/lib-modules/<mod>` извне модуля, относительные пути внутри.

**Уже в репо (не дублировать):**
- `ApiAliases.workspaceConversations`, `workspacePosts` — `scripts/shared/types/index.ts:43,80`.
- `ApiController.getWorkspaceConversations`, `createWorkspaceConversation`, `sendWorkspaceMessage`, `stopWorkspaceGeneration` — `scripts/shared/api/controller.ts:627-`.
- `useWorkspaceContext().requireWorkspaceId()` + смена workspace — `lib-modules/workspaces`.
- `Message`, `Role`, `BottomBar`, `AttachedFileArea`, `SendMessageSection` — `lib-modules/conversations`.
- `createPost(workspaceId, data)` — `lib-modules/content-calendar/helpers/api.ts:206`. Принимает `Omit<CalendarPost, 'id'>`.
- `ContentStatus = 'idea' | 'draft' | 'ready' | 'published'` — `lib-modules/content-editor/types/index.ts:4`. Статус «idea» уже поддерживается.
- `eventBus` — `composables/eventBus`.
- Iconset: `lucide-vue-next`. Регистрация в `AppSidebar.vue` через `iconComponents` map.

**Зависимости от бэка (проверить ПЕРЕД Phase 3):**
1. Возможность дописать кастомную system-инструкцию в `sendWorkspaceMessage`. Проверить `docs/v1-28.04.json`. Если параметра нет — попросить бэк добавить либо вшить инструкцию в дефолтный system_prompt бэка. До этого Phase 3 блокирована.
2. `createPost` принимает `status: 'idea'` без обязательных полей publish-таргетов. Проверить, что минимальный набор `{ status: 'idea', title, description, scheduledAt: null }` валиден.

---

## Files map

### Создаются

| Файл | Ответственность |
|---|---|
| `pages/app/assistant.vue` | Wrapper `<AssistantPage />` + `definePageMeta({ layout: 'app' })`. |
| `lib-modules/assistant/index.ts` | Public API модуля. |
| `lib-modules/assistant/types/index.ts` | `Action`, `ActionType`, `AssistantMessage`, `ConversationSummary`. |
| `lib-modules/assistant/helpers/api.ts` | `AssistantApiController` (композиция) + `useAssistantApi()`. Фасад над `getWorkspaceConversations`, `createWorkspaceConversation`, `sendWorkspaceMessage`, `stopWorkspaceGeneration`, плюс `renameConversation`, `deleteConversation` если нужно. |
| `lib-modules/assistant/helpers/actionsParser.ts` | Pure: парсит хвост ответа, режет маркер, возвращает `{ visibleText, actions[] }`. |
| `lib-modules/assistant/helpers/systemPrompt.ts` | Константа `SYSTEM_PROMPT_ACTIONS` — текст инструкции для модели. |
| `lib-modules/assistant/__tests__/actionsParser.test.ts` | Unit-тесты парсера. |
| `lib-modules/assistant/stores/assistantStore.ts` | Pinia-like store: список диалогов per workspace, `lastActiveId` per workspace, кэш в `localStorage`. |
| `lib-modules/assistant/composables/useAssistantChat.ts` | Активный conversation: messages, send, stop, lazy-create, парсинг хвоста. |
| `lib-modules/assistant/composables/useAssistantHistory.ts` | Загрузка/обновление списка, search filter, rename/delete actions, switch active. |
| `lib-modules/assistant/components/AssistantPage.vue` | Two-pane контейнер: chat + history panel. |
| `lib-modules/assistant/components/AssistantChat.vue` | Центральная колонка: messages + composer. |
| `lib-modules/assistant/components/AssistantHistoryPanel.vue` | Правая колонка ~260px: search + list. |
| `lib-modules/assistant/components/AssistantHistoryItem.vue` | Одна строка списка с context-menu (rename/delete). |
| `lib-modules/assistant/components/EmptyStateHero.vue` | Hero для пустого чата + 4 suggested-prompt-кнопки. |
| `lib-modules/assistant/components/ActionCard.vue` | Карточка action под Message с одной кнопкой. |

### Модифицируются

| Файл | Что меняется |
|---|---|
| `lib-modules/app-layout/composables/useAppLayout.ts:13-27` | Добавить `{ id: 'assistant', icon: 'sparkles', label: 'Ассистент', route: '/app/assistant' }` последним в `allItems`. |
| `lib-modules/app-layout/components/AppSidebar.vue:46-56` | Импорт `Sparkles` + регистрация в `iconComponents`. |
| `lib-modules/content-editor/components/EditorChatPanel.vue` | Phase 4: убрать восстановление `?chat=` из query, всегда стартовать пустым, добавить кнопку `Очистить`, вызвать `actionsParser` для скрытия system-маркера (без рендера ActionCard). |
| `lib-modules/content-editor/composables/useContentEditor.ts` | Phase 4: убедиться, что `chatMessages`/`conversationId` сбрасываются на mount editor-чата. |

---

## Phase 0 — Skeleton: маршрут, сайдбар-пункт, заглушка страницы

**Цель фазы:** в браузере виден новый пункт «Ассистент» в сайдбаре, по клику открывается `/app/assistant` с заглушкой two-pane layout (без логики). Гейт.

### Task 0.1: Иконка Sparkles в сайдбаре

**Files:**
- Modify: `lib-modules/app-layout/components/AppSidebar.vue:4-19,46-56`

- [ ] **Step 1: Импортировать Sparkles**

В `<script setup>` блоке `AppSidebar.vue` среди существующих lucide-импортов уже есть `Sparkles` (строка 15) — проверить, что он там и используется (если нет — оставить, импортирован уже). В `iconComponents` map (строки 46-56) добавить:

```ts
const iconComponents: Record<string, typeof Calendar> = {
  'calendar': Calendar,
  'pen-square': PenSquare,
  'film': Film,
  'trending-up': TrendingUp,
  'briefcase': Briefcase,
  'user': User,
  'settings': Settings,
  'users': Users,
  'history': History,
  'sparkles': Sparkles,  // ← добавить
}
```

- [ ] **Step 2: Дев-сервер уже запущен у пользователя на :3000 (memory)**

Не запускать `yarn dev`. Проверка визуала — пользователь смотрит сам в конце фазы.

### Task 0.2: Пункт «Ассистент» в `useAppLayout`

**Files:**
- Modify: `lib-modules/app-layout/composables/useAppLayout.ts:13-27`

- [ ] **Step 1: Добавить item последним в allItems**

```ts
const allItems: SidebarItem[] = [
  { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
  { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
  { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
  { id: 'workspaces', icon: 'briefcase', label: 'Бренды', route: '/app/workspaces' },
  { id: 'team', icon: 'users', label: 'Команда', route: '/app/team', requiresBusinessPlan: true },
  {
    id: 'activity',
    icon: 'history',
    label: 'Журнал',
    route: '/app/activity',
    requiresBusinessPlan: true,
    requiresPermission: 'canViewActivityLog',
  },
  { id: 'assistant', icon: 'sparkles', label: 'Ассистент', route: '/app/assistant' },
]
```

`assistant` без `requiresBusinessPlan` / `requiresPermission` — доступен всем ролям, бэк сам 403-нет если что.

### Task 0.3: Заглушка модуля `lib-modules/assistant`

**Files:**
- Create: `lib-modules/assistant/components/AssistantPage.vue`
- Create: `lib-modules/assistant/index.ts`
- Create: `pages/app/assistant.vue`

- [ ] **Step 1: AssistantPage.vue (заглушка с two-pane скелетом)**

```vue
<script setup lang="ts">
// Phase 0 stub. Filled in Phase 1 (chat) and Phase 2 (history).
</script>

<template>
  <div class="flex h-full">
    <!-- Active chat (центр, fills) -->
    <div class="flex-1 flex flex-col items-center justify-center text-muted-foreground">
      <p class="text-sm">Ассистент: заглушка</p>
    </div>

    <!-- History panel (правая колонка, всегда видима на >=lg) -->
    <aside class="w-[260px] border-l border-border hidden lg:flex flex-col">
      <div class="p-3 border-b border-border text-xs text-muted-foreground">История</div>
      <div class="flex-1 overflow-y-auto p-3 text-xs text-muted-foreground">
        Заглушка списка диалогов
      </div>
    </aside>
  </div>
</template>
```

- [ ] **Step 2: index.ts — public API**

```ts
export { default as AssistantPage } from './components/AssistantPage.vue'
```

- [ ] **Step 3: pages/app/assistant.vue — wrapper**

```vue
<script setup lang="ts">
import { AssistantPage } from '~/lib-modules/assistant'

definePageMeta({
  layout: 'app'
})
</script>

<template>
  <AssistantPage />
</template>
```

### ✋ Verification gate Phase 0

Сказать пользователю:

> «Phase 0 готова. Проверь в браузере:
> 1. В сайдбаре появился пункт **Ассистент** с иконкой звёздочек, последний в списке.
> 2. Клик ведёт на `/app/assistant`, видна заглушка с подписью "Ассистент: заглушка" и правой колонкой "История".
> 3. На узком окне (<1024px) правая колонка скрывается.
> Если работает — скажи «работает», тогда коммитим.»

После «работает» — коммит:

```bash
git add lib-modules/app-layout/components/AppSidebar.vue \
        lib-modules/app-layout/composables/useAppLayout.ts \
        lib-modules/assistant/ \
        pages/app/assistant.vue
git commit -m "feat(assistant): scaffold /app/assistant page and sidebar entry"
```

---

## Phase 1 — Активный чат: composer, стрим, empty state

**Цель фазы:** в `/app/assistant` можно написать сообщение, получить ответ от LLM (как в editor-чате), увидеть `set_title`. История ещё не работает (правая колонка остаётся со заглушкой). Гейт.

### Task 1.1: Типы

**Files:**
- Create: `lib-modules/assistant/types/index.ts`

- [ ] **Step 1: Базовые типы (без Action — это в Phase 3)**

```ts
import { Role } from '~/lib-modules/conversations'

export interface AssistantMessage {
  id: string                  // uuid на фронте до прихода backend message id
  backendId?: string          // request_message_id / response_message_id из стрима
  role: 'user' | 'assistant'
  text: string
  visibleText?: string        // после парсинга (Phase 3); до парсинга === text
  actions?: Action[]          // после парсинга (Phase 3)
  createdAt: number
  processing?: boolean
  error?: boolean
}

export interface ConversationSummary {
  id: string
  title: string | null
  updatedAt: string           // ISO
}

// Phase 3 fills these:
export type ActionType = 'save_as_idea' | 'open_in_editor'

export interface Action {
  type: ActionType
  title: string
  description: string
}

// Helper to convert string role -> Role enum from conversations module
export { Role }
```

### Task 1.2: API-фасад

**Files:**
- Create: `lib-modules/assistant/helpers/api.ts`

- [ ] **Step 1: AssistantApiController (композиция)**

```ts
import { ApiController, RequestMethod } from '~/scripts/shared/api/controller'
import { ApiAliases, buildUrl } from '~/scripts/shared/types'
import type { ConversationSummary } from '../types'

export class AssistantApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  listConversations(workspaceId: string): Promise<ConversationSummary[]> {
    // Phase 2 will add ?_t=Date.now() if backend caches; test first.
    return this.api.getWorkspaceConversations(workspaceId, 0, 50)
  }

  createConversation(workspaceId: string): Promise<{ id: string }> {
    return this.api.createWorkspaceConversation(workspaceId)
  }

  sendMessage(workspaceId: string, conversationId: string, text: string): Promise<ReadableStream<Uint8Array>> {
    return this.api.sendWorkspaceMessage(workspaceId, conversationId, text)
  }

  stopGeneration(workspaceId: string, conversationId: string): Promise<void> {
    return this.api.stopWorkspaceGeneration(workspaceId, conversationId)
  }

  renameConversation(workspaceId: string, conversationId: string, title: string): Promise<void> {
    // Phase 2: TODO if backend exposes endpoint. Otherwise skip rename in v1.
    // Verify in docs/v1-28.04.json before implementing.
    throw new Error('Not implemented — verify backend support in Phase 2')
  }

  deleteConversation(workspaceId: string, conversationId: string): Promise<void> {
    // Phase 2: TODO same as above.
    throw new Error('Not implemented — verify backend support in Phase 2')
  }
}

let instance: AssistantApiController | null = null

export function useAssistantApi(): AssistantApiController {
  if (!instance) {
    instance = new AssistantApiController()
  }
  return instance
}
```

> Methods для rename/delete оставлены throw-ами, потому что в Phase 1/2 их нет в требованиях. Реализуем в Phase 2 при необходимости — после проверки `docs/v1-28.04.json`. Если бэк не умеет — фича удаления/переименования в v1 отрезается, заменяется только локальным «удалить из истории» (без бэка). Решение зафиксируется в Phase 2.

### Task 1.3: useAssistantChat composable (без actions)

**Files:**
- Create: `lib-modules/assistant/composables/useAssistantChat.ts`

- [ ] **Step 1: Активный диалог + send без парсинга actions**

```ts
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { generateUUID } from '~/scripts/features/utils'
import { useAssistantApi } from '../helpers/api'
import type { AssistantMessage } from '../types'

const messages = ref<AssistantMessage[]>([])
const conversationId = ref<string | null>(null)
const isProcessing = ref(false)
const isStopping = ref(false)

export function useAssistantChat() {
  const route = useRoute()
  const router = useRouter()
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useAssistantApi()

  function reset() {
    messages.value = []
    conversationId.value = null
    isProcessing.value = false
    isStopping.value = false
  }

  function setActiveConversation(convId: string | null) {
    if (conversationId.value === convId) return
    reset()
    conversationId.value = convId
    // Phase 2 will fetch existing messages here.
  }

  function addMessage(role: 'user' | 'assistant', text: string): string {
    const id = generateUUID()
    messages.value.push({
      id,
      role,
      text,
      visibleText: text,
      createdAt: Date.now(),
      processing: role === 'assistant' && text === '',
    })
    return id
  }

  function appendChunk(messageId: string, chunk: string) {
    const m = messages.value.find(x => x.id === messageId)
    if (!m) return
    m.text += chunk
    m.visibleText = m.text  // Phase 3: parser may shrink visibleText below text
  }

  function setMessageError(messageId: string, error = true) {
    const m = messages.value.find(x => x.id === messageId)
    if (m) m.error = error
  }

  function setMessageBackendId(messageId: string, backendId: string) {
    const m = messages.value.find(x => x.id === messageId)
    if (m) m.backendId = backendId
  }

  async function ensureConversation(workspaceId: string): Promise<string> {
    if (conversationId.value) return conversationId.value
    const conv = await api.createConversation(workspaceId)
    conversationId.value = conv.id
    router.replace({ query: { ...route.query, conv: conv.id } })
    return conv.id
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isProcessing.value) return

    const workspaceId = requireWorkspaceId()
    const requestId = addMessage('user', trimmed)
    const responseId = addMessage('assistant', '')
    isProcessing.value = true

    let convId: string
    try {
      convId = await ensureConversation(workspaceId)
    } catch (e) {
      setMessageError(responseId)
      const m = messages.value.find(x => x.id === responseId)
      if (m) { m.text = 'Не удалось создать диалог. Попробуй ещё раз.'; m.visibleText = m.text }
      isProcessing.value = false
      return
    }

    let stream: ReadableStream<Uint8Array>
    try {
      stream = await api.sendMessage(workspaceId, convId, trimmed)
    } catch (e: any) {
      const detail = e?.data?.detail || 'Не удалось отправить сообщение.'
      setMessageError(responseId)
      const m = messages.value.find(x => x.id === responseId)
      if (m) { m.text = detail; m.visibleText = m.text }
      isProcessing.value = false
      return
    }

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const handle = (parsed: any) => {
      if (parsed.action === 'text_chunk' || parsed.action === 'process_response') {
        appendChunk(responseId, parsed.dt ?? '')
      } else if (parsed.action === 'request_message_id') {
        setMessageBackendId(requestId, parsed.messageId)
      } else if (parsed.action === 'response_message_id') {
        setMessageBackendId(responseId, parsed.messageId)
      } else if (parsed.action === 'set_title') {
        // Phase 2: bubble up to history store. Phase 1: no-op.
      } else if (parsed.action === 'response_end' || parsed.action === 'finish_response') {
        isProcessing.value = false
        const m = messages.value.find(x => x.id === responseId)
        if (m) m.processing = false
        if (!parsed.success && !isStopping.value) {
          appendChunk(responseId, parsed.message || parsed.error || '\n**Сервер занят**')
          setMessageError(responseId)
        }
        isStopping.value = false
        // Phase 3: parse actions from completed message text here.
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      while (true) {
        const lineEnd = buffer.indexOf('\n')
        if (lineEnd === -1) break
        const line = buffer.slice(0, lineEnd).trim()
        buffer = buffer.slice(lineEnd + 1)
        if (line.startsWith('data: ')) {
          try { handle(JSON.parse(line.slice(6))) } catch { /* ignore bad json */ }
        }
      }
    }
  }

  async function stop() {
    if (!conversationId.value) return
    isStopping.value = true
    isProcessing.value = false
    const m = messages.value[messages.value.length - 1]
    if (m) m.processing = false
    await api.stopGeneration(requireWorkspaceId(), conversationId.value).catch(() => { /* noop */ })
  }

  return {
    messages: computed(() => messages.value),
    conversationId: computed(() => conversationId.value),
    isProcessing: computed(() => isProcessing.value),
    reset,
    setActiveConversation,
    send,
    stop,
  }
}
```

### Task 1.4: EmptyStateHero компонент

**Files:**
- Create: `lib-modules/assistant/components/EmptyStateHero.vue`

- [ ] **Step 1: 4 suggested prompts**

```vue
<script setup lang="ts">
const SUGGESTED = [
  'Дай 5 идей для рилса в нише бьюти',
  'Что сейчас в трендах у инфлюенсеров',
  'Напиши хук для поста про новый продукт',
  'Анализ моего бренда: с чего начать',
]

const emit = defineEmits<{
  (e: 'pick', text: string): void
}>()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-8 text-center">
    <h2 class="text-2xl font-semibold mb-2">Чем поможет?</h2>
    <p class="text-sm text-muted-foreground mb-6">
      Спроси про идеи постов, тренды, или просто поговори про свой бренд
    </p>
    <div class="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        v-for="prompt in SUGGESTED"
        :key="prompt"
        class="rounded-md border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
        @click="emit('pick', prompt)"
      >
        {{ prompt }}
      </button>
    </div>
  </div>
</template>
```

### Task 1.5: AssistantChat компонент

**Files:**
- Create: `lib-modules/assistant/components/AssistantChat.vue`

- [ ] **Step 1: Базовый layout с composer'ом, переиспользуем `Message`**

```vue
<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Role } from '~/lib-modules/conversations'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Send, Square, Plus } from 'lucide-vue-next'
import { isMobile } from '~/scripts/features/utils'
import { useAssistantChat } from '../composables/useAssistantChat'
import EmptyStateHero from './EmptyStateHero.vue'

const route = useRoute()
const router = useRouter()
const { messages, conversationId, isProcessing, send, stop, reset, setActiveConversation } = useAssistantChat()

const ROWS_LIMIT = 7
const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textarea = ref<InstanceType<typeof Textarea> | null>(null)

const rows = computed(() => {
  const lineCount = (input.value.match(/\n/g) || []).length + 1
  return Math.min(lineCount, ROWS_LIMIT)
})

function getRoleEnum(role: 'user' | 'assistant'): Role {
  return role === 'user' ? Role.user : Role.assistant
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, () => nextTick(scrollToBottom))

async function onSend() {
  const text = input.value.trim()
  if (!text || isProcessing.value) return
  input.value = ''
  await send(text)
}

function onPrompt(text: string) {
  input.value = text
  nextTick(() => textarea.value?.textarea?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  if (isMobile()) {
    if (e.shiftKey || e.ctrlKey) { e.preventDefault(); onSend() }
  } else {
    if (!e.shiftKey) { e.preventDefault(); onSend() }
  }
}

function onNewChat() {
  reset()
  router.replace({ query: { ...route.query, conv: undefined } })
  nextTick(() => textarea.value?.textarea?.focus())
}

// Sync conv from URL on mount + when query changes
watch(
  () => route.query.conv,
  (id) => {
    setActiveConversation(typeof id === 'string' ? id : null)
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 h-14">
      <div class="text-sm text-muted-foreground truncate">Ассистент</div>
      <Button variant="ghost" size="sm" @click="onNewChat">
        <Plus class="h-4 w-4 mr-1" /> Новый чат
      </Button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[760px] px-4 py-4 space-y-4">
        <EmptyStateHero v-if="messages.length === 0" @pick="onPrompt" />
        <template v-else>
          <Message
            v-for="(m, i) in messages"
            :key="m.id"
            :id="m.id"
            :text="m.visibleText ?? m.text"
            :role="getRoleEnum(m.role)"
            :created_at="m.createdAt"
            :processing="m.processing"
            :error="m.error"
            :is-last="i === messages.length - 1"
          />
        </template>
      </div>
    </div>

    <!-- Composer -->
    <div class="border-t border-border">
      <div class="mx-auto max-w-[760px] p-4">
        <div class="flex items-end gap-2">
          <Textarea
            ref="textarea"
            v-model="input"
            :rows="rows"
            :disabled="isProcessing"
            class="resize-none"
            placeholder="Напиши сообщение..."
            @keydown="onKeydown"
          />
          <Button
            v-if="!isProcessing"
            size="icon"
            :disabled="!input.trim()"
            @click="onSend"
          >
            <Send class="h-4 w-4" />
          </Button>
          <Button
            v-else
            variant="destructive"
            size="icon"
            @click="stop"
          >
            <Square class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Task 1.6: Подключить AssistantChat в AssistantPage

**Files:**
- Modify: `lib-modules/assistant/components/AssistantPage.vue` (полностью переписываем)

- [ ] **Step 1: Заменить заглушку на AssistantChat (history-panel остаётся заглушкой)**

```vue
<script setup lang="ts">
import AssistantChat from './AssistantChat.vue'
</script>

<template>
  <div class="flex h-full">
    <div class="flex-1 min-w-0">
      <AssistantChat />
    </div>
    <aside class="w-[260px] border-l border-border hidden lg:flex flex-col">
      <div class="p-3 border-b border-border text-xs text-muted-foreground">История</div>
      <div class="flex-1 overflow-y-auto p-3 text-xs text-muted-foreground">
        Phase 2: список диалогов
      </div>
    </aside>
  </div>
</template>
```

### Task 1.7: Обновить index.ts

**Files:**
- Modify: `lib-modules/assistant/index.ts`

- [ ] **Step 1: Экспорт нового публичного API**

```ts
export { default as AssistantPage } from './components/AssistantPage.vue'
export * from './types'
export { useAssistantApi } from './helpers/api'
```

### ✋ Verification gate Phase 1

> «Phase 1 готова. Проверь:
> 1. На `/app/assistant` пустое состояние с заголовком "Чем поможет?" и 4 кнопками-prompt'ами.
> 2. Клик на prompt подставляет текст в textarea, не отправляет.
> 3. Отправка сообщения создаёт диалог, в URL появляется `?conv=<id>`, ассистент отвечает в стрим.
> 4. Кнопка `Stop` (квадрат) во время стрима останавливает генерацию.
> 5. Клик "Новый чат" сбрасывает диалог и убирает `conv` из URL.
> 6. F5 на `/app/assistant?conv=<id>` восстанавливает... — нет, в Phase 1 не восстанавливает старые сообщения, это Phase 2. Просто проверить, что страница не падает.
> Если работает — скажи «работает», коммитим.»

После «работает»:

```bash
git add lib-modules/assistant/ pages/app/assistant.vue
git commit -m "feat(assistant): live chat with streaming and lazy conversation create"
```

---

## Phase 2 — История диалогов в правой колонке

**Цель фазы:** правая колонка `/app/assistant` показывает список диалогов текущего workspace, можно переключаться между ними, поиск по названию работает, активный диалог восстанавливается при F5 (через URL и localStorage). Гейт.

### Task 2.1: Проверить бэк-эндпоинты для rename/delete

**Files:**
- Read: `docs/v1-28.04.json`

- [ ] **Step 1: Найти `rename`/`delete` для conversation**

Если есть — записать пути в `helpers/api.ts` и реализовать `renameConversation`/`deleteConversation`.

Если нет — отключить пункты «Переименовать»/«Удалить» в context-menu в Task 2.5; вместо удаления — клиентский «Скрыть из списка» (запоминаем в localStorage). В этом плане предполагаем, что **rename есть, delete есть**; если нет — корректировать в Task 2.5.

### Task 2.2: Store истории диалогов

**Files:**
- Create: `lib-modules/assistant/stores/assistantStore.ts`

- [ ] **Step 1: Простой reactive store без pinia (как в `useContentEditor`)**

```ts
import { ref, computed } from 'vue'
import type { ConversationSummary } from '../types'

const conversationsByWorkspace = ref<Record<string, ConversationSummary[]>>({})
const lastActiveByWorkspace = ref<Record<string, string | null>>({})

const LAST_ACTIVE_KEY = 'assistant.lastActive.v1'

function loadLastActive(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveLastActive(map: Record<string, string | null>) {
  try { localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(map)) } catch { /* noop */ }
}

if (typeof window !== 'undefined') {
  lastActiveByWorkspace.value = loadLastActive()
}

export function useAssistantStore() {
  function setConversations(workspaceId: string, list: ConversationSummary[]) {
    conversationsByWorkspace.value = {
      ...conversationsByWorkspace.value,
      [workspaceId]: list,
    }
  }

  function upsertConversation(workspaceId: string, conv: ConversationSummary) {
    const prev = conversationsByWorkspace.value[workspaceId] ?? []
    const filtered = prev.filter(c => c.id !== conv.id)
    setConversations(workspaceId, [conv, ...filtered])
  }

  function removeConversation(workspaceId: string, convId: string) {
    const prev = conversationsByWorkspace.value[workspaceId] ?? []
    setConversations(workspaceId, prev.filter(c => c.id !== convId))
    if (lastActiveByWorkspace.value[workspaceId] === convId) {
      setLastActive(workspaceId, null)
    }
  }

  function getConversations(workspaceId: string): ConversationSummary[] {
    return conversationsByWorkspace.value[workspaceId] ?? []
  }

  function setLastActive(workspaceId: string, convId: string | null) {
    lastActiveByWorkspace.value = {
      ...lastActiveByWorkspace.value,
      [workspaceId]: convId,
    }
    saveLastActive(lastActiveByWorkspace.value)
  }

  function getLastActive(workspaceId: string): string | null {
    return lastActiveByWorkspace.value[workspaceId] ?? null
  }

  return {
    setConversations,
    upsertConversation,
    removeConversation,
    getConversations,
    setLastActive,
    getLastActive,
  }
}
```

### Task 2.3: useAssistantHistory composable

**Files:**
- Create: `lib-modules/assistant/composables/useAssistantHistory.ts`

- [ ] **Step 1: Загрузка списка + search filter**

```ts
import { ref, computed } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useAssistantApi } from '../helpers/api'
import { useAssistantStore } from '../stores/assistantStore'

const isLoading = ref(false)
const search = ref('')

export function useAssistantHistory() {
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useAssistantApi()
  const store = useAssistantStore()

  const items = computed(() => {
    const workspaceId = requireWorkspaceId()
    const list = store.getConversations(workspaceId)
    const query = search.value.trim().toLowerCase()
    if (!query) return list
    return list.filter(c => (c.title ?? '').toLowerCase().includes(query))
  })

  async function refresh() {
    isLoading.value = true
    const workspaceId = requireWorkspaceId()
    try {
      const list = await api.listConversations(workspaceId)
      store.setConversations(workspaceId, list)
    } finally {
      isLoading.value = false
    }
  }

  async function rename(id: string, title: string) {
    const workspaceId = requireWorkspaceId()
    await api.renameConversation(workspaceId, id, title)
    const current = store.getConversations(workspaceId).find(c => c.id === id)
    if (current) {
      store.upsertConversation(workspaceId, { ...current, title })
    }
  }

  async function remove(id: string) {
    const workspaceId = requireWorkspaceId()
    await api.deleteConversation(workspaceId, id)
    store.removeConversation(workspaceId, id)
  }

  function setSearch(v: string) { search.value = v }

  return {
    items,
    isLoading: computed(() => isLoading.value),
    search: computed(() => search.value),
    setSearch,
    refresh,
    rename,
    remove,
  }
}
```

### Task 2.4: Подключить store в useAssistantChat

**Files:**
- Modify: `lib-modules/assistant/composables/useAssistantChat.ts`

- [ ] **Step 1: Обновить `set_title` handler и `ensureConversation`**

В блоке `handle()` для `set_title`:

```ts
} else if (parsed.action === 'set_title') {
  const wid = requireWorkspaceId()
  const cid = conversationId.value
  if (cid) {
    const store = useAssistantStore()
    store.upsertConversation(wid, {
      id: cid,
      title: parsed.title ?? null,
      updatedAt: new Date().toISOString(),
    })
  }
}
```

(Импортировать `useAssistantStore` сверху файла.)

В `ensureConversation` после создания:

```ts
const conv = await api.createConversation(workspaceId)
conversationId.value = conv.id
const store = useAssistantStore()
store.upsertConversation(workspaceId, {
  id: conv.id,
  title: null,
  updatedAt: new Date().toISOString(),
})
store.setLastActive(workspaceId, conv.id)
router.replace({ query: { ...route.query, conv: conv.id } })
```

В `setActiveConversation` обновить last-active:

```ts
function setActiveConversation(convId: string | null) {
  if (conversationId.value === convId) return
  reset()
  conversationId.value = convId
  if (convId) {
    const wid = requireWorkspaceId()
    const store = useAssistantStore()
    store.setLastActive(wid, convId)
  }
  // Phase 2.5: load existing messages from backend if convId set.
}
```

### Task 2.5: AssistantHistoryItem с context-menu

**Files:**
- Create: `lib-modules/assistant/components/AssistantHistoryItem.vue`

- [ ] **Step 1: Item с переименованием/удалением через DropdownMenu**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib-modules/utils'
import type { ConversationSummary } from '../types'

const props = defineProps<{
  item: ConversationSummary
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'rename', title: string): void
  (e: 'delete'): void
}>()

// AlertDialog: separate :open boolean + target ref (memory rule)
const renameOpen = ref(false)
const deleteOpen = ref(false)
const renameTitle = ref('')

function startRename() {
  renameTitle.value = props.item.title ?? ''
  renameOpen.value = true
}

function confirmRename() {
  const t = renameTitle.value.trim()
  if (t && t !== props.item.title) emit('rename', t)
  renameOpen.value = false
}

function confirmDelete() {
  emit('delete')
  deleteOpen.value = false
}
</script>

<template>
  <div
    :class="cn(
      'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent',
      active && 'bg-accent'
    )"
    @click="emit('click')"
  >
    <span class="flex-1 truncate">{{ item.title || 'Без названия' }}</span>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 opacity-0 group-hover:opacity-100"
          @click.stop
        >
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="startRename">
          <Pencil class="h-4 w-4 mr-2" /> Переименовать
        </DropdownMenuItem>
        <DropdownMenuItem class="text-destructive" @click="deleteOpen = true">
          <Trash2 class="h-4 w-4 mr-2" /> Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <AlertDialog v-model:open="renameOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Переименовать диалог</AlertDialogTitle>
      </AlertDialogHeader>
      <Input v-model="renameTitle" placeholder="Название" @keydown.enter="confirmRename" />
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction @click="confirmRename">Сохранить</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Удалить диалог?</AlertDialogTitle>
        <AlertDialogDescription>
          Действие нельзя отменить. История этого диалога будет утеряна.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive" @click="confirmDelete">Удалить</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

> Если в Task 2.1 окажется, что бэк не умеет в rename/delete — убираем соответствующие `DropdownMenuItem` и AlertDialog'и; вместо них добавляем «Скрыть из списка» (только клиентский). Этот выбор фиксируется в коде до коммита фазы.

### Task 2.6: AssistantHistoryPanel компонент

**Files:**
- Create: `lib-modules/assistant/components/AssistantHistoryPanel.vue`

- [ ] **Step 1: Поиск + список + кнопка «+ Новый»**

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Search, Plus } from 'lucide-vue-next'
import { useAssistantHistory } from '../composables/useAssistantHistory'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import AssistantHistoryItem from './AssistantHistoryItem.vue'
import { useAssistantStore } from '../stores/assistantStore'

const route = useRoute()
const router = useRouter()
const { items, search, setSearch, refresh, rename, remove } = useAssistantHistory()
const { currentWorkspace } = useWorkspaceContext()
const store = useAssistantStore()

onMounted(refresh)
// Re-fetch when workspace switches
watch(() => currentWorkspace.value?.id, (id) => { if (id) refresh() })

const activeId = computed(() => (typeof route.query.conv === 'string' ? route.query.conv : null))

function pick(id: string) {
  router.replace({ query: { ...route.query, conv: id } })
}

function onNew() {
  router.replace({ query: { ...route.query, conv: undefined } })
  if (currentWorkspace.value?.id) {
    store.setLastActive(currentWorkspace.value.id, null)
  }
}
</script>

<template>
  <aside class="w-[260px] border-l border-border hidden lg:flex flex-col">
    <div class="p-2 border-b border-border space-y-2">
      <Button class="w-full justify-start" variant="outline" size="sm" @click="onNew">
        <Plus class="h-4 w-4 mr-2" /> Новый чат
      </Button>
      <div class="relative">
        <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          :model-value="search"
          placeholder="Поиск..."
          class="pl-8 h-8 text-sm"
          @update:model-value="setSearch(String($event))"
        />
      </div>
    </div>
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <AssistantHistoryItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :active="item.id === activeId"
        @click="pick(item.id)"
        @rename="(t) => rename(item.id, t)"
        @delete="remove(item.id)"
      />
      <div v-if="!items.length" class="text-xs text-muted-foreground p-2">
        Нет диалогов. Напиши первое сообщение.
      </div>
    </div>
  </aside>
</template>
```

### Task 2.7: Подгрузка существующих сообщений диалога

**Files:**
- Modify: `lib-modules/assistant/helpers/api.ts`
- Modify: `lib-modules/assistant/composables/useAssistantChat.ts`

- [ ] **Step 1: Метод `getConversationMessages` в api**

Найти в `ApiController` метод получения сообщений конкретного диалога (например `getWorkspaceConversationMessages`). Если нет — проверить `docs/v1-28.04.json`. Имя у нас гипотетическое — открыть `scripts/shared/api/controller.ts` и найти существующий метод (поиск по `messages` или `conversation`).

Добавить в `AssistantApiController`:

```ts
getConversationMessages(workspaceId: string, conversationId: string): Promise<{ messages: Array<{ id: string; role: 'user' | 'assistant'; text: string; createdAt?: string }> }> {
  return this.api.getWorkspaceConversationMessages(workspaceId, conversationId)
  // ↑ имя подставить реальное; если нет — возвращать [] и фиксировать как ограничение в v1.
}
```

- [ ] **Step 2: Загрузить сообщения в `setActiveConversation`**

```ts
async function setActiveConversation(convId: string | null) {
  if (conversationId.value === convId) return
  reset()
  conversationId.value = convId
  if (convId) {
    const wid = requireWorkspaceId()
    const store = useAssistantStore()
    store.setLastActive(wid, convId)
    try {
      const { messages: msgs } = await api.getConversationMessages(wid, convId)
      messages.value = msgs.map(m => ({
        id: m.id,
        backendId: m.id,
        role: m.role,
        text: m.text,
        visibleText: m.text,
        createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      }))
    } catch (e) {
      // If endpoint missing — leave empty, conversation continues fresh.
      console.error('[Assistant] failed to load messages', e)
    }
  }
}
```

> Если `getWorkspaceConversationMessages` не существует — фиксируем как известное ограничение v1: переключение между диалогами стартует пустым, история сообщений не загружается. На гейте Phase 2 это явно отметить.

### Task 2.8: Подключить HistoryPanel в AssistantPage

**Files:**
- Modify: `lib-modules/assistant/components/AssistantPage.vue`

- [ ] **Step 1: Заменить заглушку**

```vue
<script setup lang="ts">
import AssistantChat from './AssistantChat.vue'
import AssistantHistoryPanel from './AssistantHistoryPanel.vue'
</script>

<template>
  <div class="flex h-full">
    <div class="flex-1 min-w-0">
      <AssistantChat />
    </div>
    <AssistantHistoryPanel />
  </div>
</template>
```

### Task 2.9: Восстановление last-active при заходе без `?conv=`

**Files:**
- Modify: `lib-modules/assistant/components/AssistantChat.vue`

- [ ] **Step 1: Добавить mount-логику восстановления**

В `<script setup>` `AssistantChat.vue` после `watch` на `route.query.conv` добавить:

```ts
import { onMounted } from 'vue'
import { useAssistantStore } from '../stores/assistantStore'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const { currentWorkspace } = useWorkspaceContext()
const store = useAssistantStore()

onMounted(() => {
  // Если в URL уже есть conv — watch уже отработал в immediate.
  if (route.query.conv) return
  const wid = currentWorkspace.value?.id
  if (!wid) return
  const last = store.getLastActive(wid)
  if (last) {
    router.replace({ query: { ...route.query, conv: last } })
  }
})
```

### ✋ Verification gate Phase 2

> «Phase 2 готова. Проверь:
> 1. На `/app/assistant` правая колонка показывает список твоих диалогов (если их ещё нет — пустое состояние с подсказкой).
> 2. После первого сообщения в новом чате — он появляется сверху списка с заголовком от `set_title`.
> 3. Клик на диалог в списке — переключает активный чат, URL обновляется на `?conv=<id>`, сообщения загружаются (или пустой чат, если бэк-эндпоинт получения сообщений ещё не подключен — это известное ограничение, отметим).
> 4. Поиск фильтрует список по названию.
> 5. Hover-меню (три точки) — переименовать / удалить (если бэк поддерживает; иначе пункты убраны или клиентский «скрыть»).
> 6. F5 без `?conv=` — открывается last-active диалог из localStorage.
> 7. Смена workspace через AppNavbar — список обновляется.
> Если работает — скажи «работает».»

После «работает»:

```bash
git add lib-modules/assistant/
git commit -m "feat(assistant): conversation history panel with search and switching"
```

---

## Phase 3 — Action-протокол (TDD parser + ActionCard + save_as_idea + open_in_editor)

**Цель фазы:** AI-ответ может содержать в хвосте system-блок, парсер режет его из видимого текста, под сообщением рендерятся ActionCard'ы; клик создаёт пост-идею и опционально перекидывает в редактор. Гейт.

**Pre-flight:** проверить что бэк принимает кастомную system-инструкцию (зависимость 1 из spec). Без этого AI инструкции не получит, и блок никогда не появится. Если бэк не позволяет — всё равно делаем парсер и ActionCard (дешевле), а инструкцию просим бэк добавить в дефолтный system_prompt.

### Task 3.1: TDD-парсер actionsParser.ts

**Files:**
- Create: `lib-modules/assistant/__tests__/actionsParser.test.ts`
- Create: `lib-modules/assistant/helpers/actionsParser.ts`

- [ ] **Step 1: Написать failing-тесты**

```ts
import { describe, it, expect } from 'vitest'
import { parseActionsTail, isMarkerLikely } from '../helpers/actionsParser'

describe('parseActionsTail', () => {
  it('returns full text and empty actions when no marker', () => {
    const r = parseActionsTail('Hello world')
    expect(r.visibleText).toBe('Hello world')
    expect(r.actions).toEqual([])
  })

  it('strips marker and parses a single action', () => {
    const input = 'Visible text\n========SYSTEM======\n{"actions":[{"type":"save_as_idea","title":"T","description":"D"}]}'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('Visible text')
    expect(r.actions).toEqual([{ type: 'save_as_idea', title: 'T', description: 'D' }])
  })

  it('parses multiple actions array', () => {
    const json = JSON.stringify({ actions: [
      { type: 'save_as_idea', title: 'A', description: 'a' },
      { type: 'save_as_idea', title: 'B', description: 'b' },
    ]})
    const input = `Body\n========SYSTEM======\n${json}`
    const r = parseActionsTail(input)
    expect(r.actions).toHaveLength(2)
    expect(r.actions[1].title).toBe('B')
  })

  it('strips marker even on broken json (failsafe)', () => {
    const input = 'Body\n========SYSTEM======\n{not json'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('Body')
    expect(r.actions).toEqual([])
  })

  it('ignores unknown action types', () => {
    const input = 'B\n========SYSTEM======\n{"actions":[{"type":"unknown","title":"T","description":"D"}]}'
    const r = parseActionsTail(input)
    expect(r.actions).toEqual([])
  })

  it('isMarkerLikely returns true once partial marker appeared', () => {
    expect(isMarkerLikely('text\n=====')).toBe(true)
    expect(isMarkerLikely('text\n=====S')).toBe(true)
    expect(isMarkerLikely('text only')).toBe(false)
  })

  it('handles trailing whitespace after marker line', () => {
    const input = 'Body \n========SYSTEM======   \n{"actions":[{"type":"open_in_editor","title":"X","description":"Y"}]}'
    const r = parseActionsTail(input)
    expect(r.actions).toEqual([{ type: 'open_in_editor', title: 'X', description: 'Y' }])
  })
})
```

- [ ] **Step 2: Запустить тесты — должны провалиться**

```bash
yarn test --run lib-modules/assistant/__tests__/actionsParser.test.ts
```

Ожидаемо: FAIL — модуль ещё не существует.

- [ ] **Step 3: Реализовать парсер**

```ts
// lib-modules/assistant/helpers/actionsParser.ts
import type { Action, ActionType } from '../types'

const MARKER = '========SYSTEM======'
const KNOWN_TYPES: ActionType[] = ['save_as_idea', 'open_in_editor']

export interface ParsedTail {
  visibleText: string
  actions: Action[]
}

export function parseActionsTail(text: string): ParsedTail {
  const idx = text.indexOf(MARKER)
  if (idx === -1) {
    return { visibleText: text, actions: [] }
  }

  // Cut everything from the start of the line that contains MARKER.
  const lineStart = text.lastIndexOf('\n', idx)
  const visibleText = (lineStart === -1 ? '' : text.slice(0, lineStart)).trimEnd()

  const tail = text.slice(idx + MARKER.length).trim()
  // tail may have leading newline + JSON.
  let parsed: any
  try {
    parsed = JSON.parse(tail)
  } catch {
    return { visibleText, actions: [] }
  }

  const rawActions = Array.isArray(parsed?.actions) ? parsed.actions : []
  const actions: Action[] = rawActions
    .filter((a: any) => a && typeof a.type === 'string' && KNOWN_TYPES.includes(a.type))
    .map((a: any) => ({
      type: a.type as ActionType,
      title: typeof a.title === 'string' ? a.title : '',
      description: typeof a.description === 'string' ? a.description : '',
    }))

  return { visibleText, actions }
}

/**
 * Cheap streaming check: returns true if `text` contains a partial or full marker prefix
 * (for hiding the tail from UI while still streaming).
 */
export function isMarkerLikely(text: string): boolean {
  // Look for last newline + run of '=' that could be the marker prefix.
  const re = /\n=+/
  return re.test(text) || text.includes(MARKER)
}
```

- [ ] **Step 4: Запустить тесты — должны пройти**

```bash
yarn test --run lib-modules/assistant/__tests__/actionsParser.test.ts
```

Ожидаемо: PASS все 7.

### Task 3.2: System-prompt константа

**Files:**
- Create: `lib-modules/assistant/helpers/systemPrompt.ts`

- [ ] **Step 1: Текст инструкции**

```ts
export const SYSTEM_PROMPT_ACTIONS = `Когда в обсуждении появляется конкретная идея для поста (тема + общее описание), в конце ответа добавь блок:
========SYSTEM======
{"actions":[{"type":"save_as_idea","title":"...","description":"..."}]}

Допустимые типы: "save_as_idea" (юзер сохранит идею в календарь), "open_in_editor" (юзер откроет идею в редакторе сразу).
Можно вернуть массив (несколько идей за раз — каждая отдельным элементом).
Если идеи нет — блок не пиши.`
```

### Task 3.3: Передача system-prompt в send

**Files:**
- Modify: `lib-modules/assistant/helpers/api.ts`
- Modify: `lib-modules/assistant/composables/useAssistantChat.ts`

- [ ] **Step 1: Проверить, как `sendWorkspaceMessage` принимает system**

Посмотреть `scripts/shared/api/controller.ts:672+` — есть ли параметр `additional_system` / `systemPrompt` / `metadata`. Если нет — вариант A: договориться с бэком (записать в комментарии, оставить TODO в plan). Вариант B: вшить инструкцию в первое user-сообщение (хак). На старте — **A**, и пока action-блок просто не появится. Это явно отметим в gate.

Если параметр есть — добавить его проброс:

```ts
sendMessage(workspaceId: string, conversationId: string, text: string, systemPrompt?: string): Promise<ReadableStream<Uint8Array>> {
  return this.api.sendWorkspaceMessage(workspaceId, conversationId, text, systemPrompt)
}
```

В `useAssistantChat.send`:

```ts
import { SYSTEM_PROMPT_ACTIONS } from '../helpers/systemPrompt'
// ...
stream = await api.sendMessage(workspaceId, convId, trimmed, SYSTEM_PROMPT_ACTIONS)
```

### Task 3.4: Парсер на response_end + hide-tail в стриме

**Files:**
- Modify: `lib-modules/assistant/composables/useAssistantChat.ts`

- [ ] **Step 1: hide-tail в `appendChunk`**

```ts
import { parseActionsTail, isMarkerLikely } from '../helpers/actionsParser'

function appendChunk(messageId: string, chunk: string) {
  const m = messages.value.find(x => x.id === messageId)
  if (!m) return
  m.text += chunk
  if (isMarkerLikely(m.text)) {
    const { visibleText } = parseActionsTail(m.text)
    m.visibleText = visibleText
  } else {
    m.visibleText = m.text
  }
}
```

- [ ] **Step 2: Финальный парсинг на `response_end`**

В блоке `response_end`:

```ts
} else if (parsed.action === 'response_end' || parsed.action === 'finish_response') {
  isProcessing.value = false
  const m = messages.value.find(x => x.id === responseId)
  if (m) {
    m.processing = false
    const { visibleText, actions } = parseActionsTail(m.text)
    m.visibleText = visibleText
    m.actions = actions
  }
  if (!parsed.success && !isStopping.value) { /* ... как раньше ... */ }
  isStopping.value = false
}
```

### Task 3.5: ActionCard компонент

**Files:**
- Create: `lib-modules/assistant/components/ActionCard.vue`

- [ ] **Step 1: Карточка с одной кнопкой**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Pencil, Check } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useContentCalendarApi } from '~/lib-modules/content-calendar'
import type { Action } from '../types'

const props = defineProps<{ action: Action }>()

const isLoading = ref(false)
const createdPostId = ref<string | null>(null)
const createdTitle = ref<string | null>(null)

const router = useRouter()
const { requireWorkspaceId } = useWorkspaceContext()

async function createIdea(): Promise<string | null> {
  const calendarApi = useContentCalendarApi()  // assuming such factory; if not — useCalendarApi or direct controller
  const post = await calendarApi.createPost(requireWorkspaceId(), {
    status: 'idea',
    title: props.action.title,
    description: props.action.description,
    scheduledAt: null,
  } as any)
  return post.id
}

async function onClick() {
  if (createdPostId.value) {
    if (props.action.type === 'open_in_editor') {
      router.push(`/app/editor?postId=${createdPostId.value}`)
    } else {
      router.push(`/app/calendar?postId=${createdPostId.value}`)
    }
    return
  }
  isLoading.value = true
  try {
    const id = await createIdea()
    if (!id) throw new Error('No id returned')
    createdPostId.value = id
    createdTitle.value = props.action.title
    if (props.action.type === 'open_in_editor') {
      router.push(`/app/editor?postId=${id}`)
    } else {
      toast.success(`Идея сохранена: ${props.action.title}`)
    }
  } catch (e) {
    toast.error('Не удалось сохранить идею')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="rounded-md border border-border p-3 bg-card">
    <div class="text-sm font-medium truncate">{{ action.title }}</div>
    <div class="text-xs text-muted-foreground line-clamp-2 mt-1">{{ action.description }}</div>
    <div class="flex justify-end mt-2">
      <Button v-if="!createdPostId" size="sm" :disabled="isLoading" @click="onClick">
        <component :is="action.type === 'open_in_editor' ? Pencil : Plus" class="h-4 w-4 mr-1" />
        {{ action.type === 'open_in_editor' ? 'В редактор' : 'Идея' }}
      </Button>
      <Button v-else size="sm" variant="ghost" @click="onClick">
        <Check class="h-4 w-4 mr-1" />
        Сохранено: "{{ createdTitle }}"
      </Button>
    </div>
  </div>
</template>
```

> `useContentCalendarApi` — проверить точное имя в `lib-modules/content-calendar/index.ts`. Если фабрики нет, инстанцировать `new ContentCalendarApiController()` напрямую или использовать существующий метод. Для `createPost` структура DTO — проверить `CalendarPost` тип в `lib-modules/content-calendar/types/`. `scheduledAt: null` может быть невалидным — подставить корректное значение из типа (или `undefined`).

### Task 3.6: Рендер ActionCard в AssistantChat

**Files:**
- Modify: `lib-modules/assistant/components/AssistantChat.vue`

- [ ] **Step 1: Импорт + ряд карточек под Message**

```vue
<script setup lang="ts">
// ...existing imports...
import ActionCard from './ActionCard.vue'
</script>

<template>
  <!-- внутри messages-loop, после <Message ...> -->
  <Message ... />
  <div
    v-if="m.role === 'assistant' && m.actions && m.actions.length"
    class="flex flex-wrap gap-2 mt-2"
  >
    <ActionCard
      v-for="(a, j) in m.actions"
      :key="j"
      :action="a"
      class="min-w-[240px] flex-1"
    />
  </div>
</template>
```

### ✋ Verification gate Phase 3

> «Phase 3 готова. Проверь:
> 1. Запусти `yarn test --run lib-modules/assistant/__tests__/actionsParser.test.ts` — все 7 тестов зелёные.
> 2. В чате попроси «дай 5 идей для рилса в нише X» — под последним сообщением ассистента появляются 5 карточек ActionCard с кнопками `+ Идея`.
> 3. Если бэк не принимает кастомную system-инструкцию — проверь в DevTools, что system-блок прилетает в стриме (если нет — фиксируем как блокер, фаза останется частично рабочей: парсер готов, но AI инструкции не получает).
> 4. Клик `+ Идея` — toast «Идея сохранена», открой `/app/calendar` — пост появился со статусом «идея».
> 5. Клик `📝 В редактор` — открывается `/app/editor?postId=<id>` с этой идеей.
> 6. Двойной клик «+ Идея» не создаёт две идеи; вместо этого второй клик ведёт на созданный пост.
> 7. Если AI прислал битый JSON в system-блоке — текст сообщения отображается без хвоста (без actions), пользователь не видит «========SYSTEM======».
> Если работает — скажи «работает».»

После «работает»:

```bash
git add lib-modules/assistant/
git commit -m "feat(assistant): action protocol with save_as_idea and open_in_editor"
```

---

## Phase 4 — Editor-чат: scratch-режим, кнопка Очистить, скрытие маркера

**Цель фазы:** editor-чат всегда стартует пустым при открытии любого поста, в шапке появляется кнопка `Очистить`, system-маркер скрывается из текста (если вдруг прилетел). Гейт.

### Task 4.1: Editor-чат всегда стартует пустым

**Files:**
- Modify: `lib-modules/content-editor/components/EditorChatPanel.vue:65-110`
- Modify: `lib-modules/content-editor/composables/useContentEditor.ts` (если там есть hydration)

- [ ] **Step 1: Удалить чтение `?chat=` из query на mount**

Проверить, где читается `route.query.chat` для восстановления `conversationId`. Удалить эту логику. Конкретное место — посмотреть `useContentEditor.ts` и любые `onMounted`/`onActivated` хуки в `EditorChatPanel.vue`.

- [ ] **Step 2: Не писать `?chat=` в URL**

В `EditorChatPanel.vue:99-100`:

```ts
// БЫЛО:
router.replace({ query: { ...route.query, chat: convId } })
// СТАЛО:
// (удалить эту строку — больше не пишем chat в URL)
```

- [ ] **Step 3: Сброс состояния на mount/postId-change**

В `useContentEditor` или в `EditorChatPanel.vue` `onMounted`:

```ts
onMounted(() => {
  // Editor chat is a scratch pad — clear UI state on every mount.
  chatMessages.value = []
  setConversationId(null)
})
```

Если есть `watch(() => route.query.postId, ...)` — сбрасывать там же.

### Task 4.2: Кнопка «Очистить» в шапке

**Files:**
- Modify: `lib-modules/content-editor/components/EditorChatPanel.vue`

- [ ] **Step 1: Добавить header с иконкой Eraser**

В template, перед `<!-- Messages area -->`:

```vue
<div class="flex items-center justify-end px-3 h-9 border-b border-border">
  <Button
    variant="ghost"
    size="icon"
    class="h-7 w-7"
    title="Очистить чат"
    :disabled="chatMessages.length === 0 && !conversationId"
    @click="clearChat"
  >
    <Eraser class="h-4 w-4" />
  </Button>
</div>
```

```ts
import { Eraser } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

function clearChat() {
  chatMessages.value = []
  setConversationId(null)
  // Backend conversation остаётся, не дёргаем delete.
}
```

### Task 4.3: Скрытие system-маркера в editor-чате

**Files:**
- Modify: `lib-modules/content-editor/components/EditorChatPanel.vue`

- [ ] **Step 1: Применить parseActionsTail к видимому тексту, actions игнорировать**

В `EditorChatPanel.vue` импорт:

```ts
import { parseActionsTail, isMarkerLikely } from '~/lib-modules/assistant/helpers/actionsParser'
```

В `processStreamData` обработчике `text_chunk`:

```ts
text_chunk: () => {
  appendToChatMessage(responseUuid, parsed.dt)
  // Hide system tail in real-time
  const msg = chatMessages.value.find(m => m.id === responseUuid)
  if (msg && isMarkerLikely(msg.text)) {
    const { visibleText } = parseActionsTail(msg.text)
    msg.text = visibleText  // editor-chat хранит видимый текст напрямую (нет visibleText поля)
  }
  scrollToBottom()
},
```

> ВАЖНО: editor-чат-структура `chatMessages` использует `text` напрямую (нет `visibleText` поля как в assistant). Это значит, что обрезание влияет на сохранённый стейт, и при стриминге в `appendToChatMessage` мы каждый раз перезаписываем `text` пере-обрезанным значением. Это корректно — после `response_end` финальный `parseActionsTail(text)` оставит только visibleText, actions [] не используются.

В `response_end`:

```ts
response_end: () => {
  setChatProcessing(false)
  if (!parsed.success && !isStoppingGeneration.value) {
    appendToChatMessage(responseUuid, parsed.message || '\n**Server is busy**')
    setChatMessageError(responseUuid, true)
  }
  // Финальная очистка system-маркера
  const msg = chatMessages.value.find(m => m.id === responseUuid)
  if (msg) {
    const { visibleText } = parseActionsTail(msg.text)
    msg.text = visibleText
  }
  isStoppingGeneration.value = false
  const lastMsg = getLastMessage()
  if (lastMsg) lastMsg.processing = false
},
```

> Action-карточки в editor-чате НЕ рендерим — юзер уже в редакторе, кнопки `+ Идея` / `В редактор` бессмысленны.

### ✋ Verification gate Phase 4

> «Phase 4 готова. Проверь:
> 1. Открой существующий пост в `/app/editor?postId=<id>` — чат пустой (раньше восстанавливался).
> 2. Напиши сообщение, ассистент ответил, переключись на другой пост — чат снова пустой. Вернись к первому — тоже пустой.
> 3. Нажми кнопку `Очистить` (иконка ластика в шапке) — текущий чат сбрасывается, можно начать новый.
> 4. Если AI вдруг вернул system-маркер (попроси «дай идею для поста») — `========SYSTEM======{...}` НЕ виден в чате, текст обрезан перед маркером, кнопок-карточек нет.
> 5. URL поста чистый: `/app/editor?postId=<id>` без `&chat=...`.
> Если работает — скажи «работает».»

После «работает»:

```bash
git add lib-modules/content-editor/
git commit -m "feat(editor): switch chat to scratch mode + clear button + hide system tail"
```

---

## Self-review log

После каждой фазы автоматически:
1. Прогнать `yarn typecheck` (если есть в `package.json`) или `yarn build` — никаких новых TS-ошибок.
2. Прогнать `yarn test --run` — `actionsParser` тесты зелёные после Phase 3.
3. Проверить, что нигде не остался `console.log`-debug.

## Известные ограничения v1

Фиксируем явно — это не баги, а сознательный YAGNI:

- Память по бренду / shared knowledge base — нет.
- Слэш-команды в чате — нет.
- Регенерация ответа («Regenerate») — нет.
- Шаринг диалога между членами команды — нет.
- Server-side full-text search по диалогам — нет, клиентский фильтр.
- Recovery editor-чата при возврате к посту — нет (вечная амнезия в UI).
- Action-типы `analyze_reel`, `find_trends`, etc. — нет, переедут с бэком.
- Если бэк не примет кастомную system-инструкцию — action-блок никогда не появится; парсер готов, ждёт бэка.
- Если бэк не отдаёт сообщения существующего conversation — переключение между диалогами стартует пустым (не блокер для гейта).

## Execution

После согласования плана пользователем выбрать одно из:

1. **Subagent-Driven (recommended)** — я диспатчу отдельного агента на каждый Task, ревьюю между ними.
2. **Inline** — выполняем по фазам в этой сессии с verification gate между ними.

Какой подход?
