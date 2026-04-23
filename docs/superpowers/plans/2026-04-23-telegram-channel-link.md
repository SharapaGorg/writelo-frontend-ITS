# Telegram channel linking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить заглушку в TG-диалоге `/app/connect-account` на реальный flow привязки канала через `/workspaces/{id}/telegram/link/start` + поллинг `/link/status/{code}`.

**Architecture:** Новый компонент `TelegramLinkFlow.vue` инкапсулирует весь flow (start → poll → terminal). `ContentCalendarApiController` получает два метода (`startTelegramLink`, `getTelegramLinkStatus`). `ConnectAccountPage.vue` в TG-ветке диалога рендерит `TelegramLinkFlow` вместо `TelegramLoginButton`.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Tailwind, shadcn-vue (`components/ui/button`, `dialog`), `vue-sonner` (через `getToasterPosition()`), `lucide-vue-next` (иконки).

**Testing convention:** В репо нет юнит-тестов для компонентов календаря и API-контроллеров — полагаемся на ручную верификацию после каждой задачи (как уже делается в остальных задачах календаря). `yarn build` используется для type-check, `yarn devo` — для прогонки flow против дев-бекенда.

> **Важно:** пользователь держит `yarn dev` на `:3000` сам; не поднимать дубликат — для ручной проверки использовать уже открытый у пользователя браузер или обращаться к `http://localhost:3000` напрямую.

---

## Files

| Путь | Действие | Ответственность |
|------|----------|-----------------|
| `scripts/shared/types/index.ts` | modify | Добавить 2 значения в `ApiAliases` |
| `lib-modules/content-calendar/types/index.ts` | modify | Добавить `TelegramLinkStatus`, `TelegramLinkStartResponse`, `TelegramLinkStatusResponse` |
| `lib-modules/content-calendar/helpers/api.ts` | modify | Методы `startTelegramLink`, `getTelegramLinkStatus` в `ContentCalendarApiController` |
| `lib-modules/content-calendar/index.ts` | modify | Реэкспорт `TelegramLinkFlow` (если модуль его экспортит — иначе использует только внутри) |
| `lib-modules/content-calendar/components/TelegramLinkFlow.vue` | create | Компонент flow-а: start → показ deep link + кода → poll → terminal состояния |
| `lib-modules/workspaces/components/ConnectAccountPage.vue` | modify | В TG-ветке диалога заменить `TelegramLoginButton` на `TelegramLinkFlow` |

---

## Task 1: API aliases + DTO-типы

**Files:**
- Modify: `scripts/shared/types/index.ts`
- Modify: `lib-modules/content-calendar/types/index.ts`

- [ ] **Step 1:** В `scripts/shared/types/index.ts`, после строки `workspaceSocialAccount = 'workspaces/{workspaceId}/social-accounts/{socialAccountId}',` вставить:

```ts
    // Telegram channel linking
    workspaceTelegramLinkStart  = 'workspaces/{workspaceId}/telegram/link/start',
    workspaceTelegramLinkStatus = 'workspaces/{workspaceId}/telegram/link/status/{code}',
```

- [ ] **Step 2:** В `lib-modules/content-calendar/types/index.ts`, сразу после блока `SocialAccountDto/UpsertSocialAccountRequest` (до `ContentTag`), добавить:

```ts
// ---- Telegram channel linking (API 23.04) ----

export type TelegramLinkStatus =
  | 'pending'
  | 'user_started'
  | 'completed'
  | 'failed'
  | 'expired'

export interface TelegramLinkStartResponse {
  deepLink: string
  verificationCode: string
  expiresAt: string // ISO
}

export interface TelegramLinkStatusResponse {
  status: TelegramLinkStatus
  failureReason?: string | null
  socialAccountId?: string | null
}
```

- [ ] **Step 3:** Type-check: запустить в отдельном окне

```bash
yarn build
```

Expected: сборка проходит без ошибок. Если не проходит — перед следующим шагом починить.

- [ ] **Step 4:** Коммит:

```bash
git add scripts/shared/types/index.ts lib-modules/content-calendar/types/index.ts
git commit -m "feat(calendar): add Telegram channel link aliases + DTOs"
```

---

## Task 2: Методы API-контроллера

**Files:**
- Modify: `lib-modules/content-calendar/helpers/api.ts`

- [ ] **Step 1:** В импорте типов из `'../types'` добавить `TelegramLinkStartResponse, TelegramLinkStatusResponse`.

- [ ] **Step 2:** В классе `ContentCalendarApiController`, сразу после секции `// Social accounts` (после метода `deleteSocialAccount`), вставить:

```ts
  // Telegram channel linking
  startTelegramLink(workspaceId: string): Promise<TelegramLinkStartResponse> {
    const url = buildUrl(ApiAliases.workspaceTelegramLinkStart, { workspaceId })
    return this.api.request(url, RequestMethod.POST) as Promise<TelegramLinkStartResponse>
  }

  getTelegramLinkStatus(
    workspaceId: string,
    code: string,
  ): Promise<TelegramLinkStatusResponse> {
    const url = buildUrl(ApiAliases.workspaceTelegramLinkStatus, { workspaceId, code })
    return this.api.request(url, RequestMethod.GET) as Promise<TelegramLinkStatusResponse>
  }
```

- [ ] **Step 3:** Type-check: `yarn build`. Expected: passes.

- [ ] **Step 4:** Коммит:

```bash
git add lib-modules/content-calendar/helpers/api.ts
git commit -m "feat(calendar): add Telegram link start/status API methods"
```

---

## Task 3: Компонент `TelegramLinkFlow.vue`

**Files:**
- Create: `lib-modules/content-calendar/components/TelegramLinkFlow.vue`

- [ ] **Step 1:** Создать файл со следующим содержимым:

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2, Copy, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useContentCalendarApi } from '../helpers/api'
import type { TelegramLinkStartResponse, TelegramLinkStatus } from '../types'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const props = defineProps<{ workspaceId: string }>()
const emit = defineEmits<{
  linked: [socialAccountId: string]
  cancel: []
}>()

const api = useContentCalendarApi()

const POLL_INTERVAL_MS = 2000

const starting = ref(false)
const session = ref<TelegramLinkStartResponse | null>(null)
const status = ref<TelegramLinkStatus>('pending')
const failureReason = ref<string | null>(null)
const errorText = ref<string | null>(null)

let pollTimer: ReturnType<typeof setInterval> | null = null

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function start() {
  stopPolling()
  starting.value = true
  status.value = 'pending'
  failureReason.value = null
  errorText.value = null
  session.value = null
  try {
    session.value = await api.startTelegramLink(props.workspaceId)
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
  } catch (e) {
    console.error('[TelegramLinkFlow] start failed:', e)
    errorText.value = 'Не удалось начать привязку. Попробуй ещё раз.'
  } finally {
    starting.value = false
  }
}

async function poll() {
  if (!session.value) return
  try {
    const res = await api.getTelegramLinkStatus(
      props.workspaceId,
      session.value.verificationCode,
    )
    status.value = res.status
    failureReason.value = res.failureReason ?? null

    if (res.status === 'completed') {
      stopPolling()
      if (res.socialAccountId) emit('linked', res.socialAccountId)
    } else if (res.status === 'failed' || res.status === 'expired') {
      stopPolling()
    }
  } catch (e) {
    console.error('[TelegramLinkFlow] poll failed:', e)
    stopPolling()
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  }
}

async function copyCode() {
  if (!session.value) return
  try {
    await navigator.clipboard.writeText(session.value.verificationCode)
    toast.success('Код скопирован', { position: getToasterPosition() })
  } catch {
    /* clipboard can fail in non-secure contexts — silently ignore */
  }
}

onMounted(start)
onBeforeUnmount(stopPolling)
</script>

<template>
  <div class="py-2 space-y-4">
    <div v-if="starting || !session" class="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" />
      Готовим ссылку…
    </div>

    <template v-else-if="status === 'pending' || status === 'user_started'">
      <a
        :href="session.deepLink"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 transition"
      >
        <ExternalLink class="h-4 w-4" />
        Открыть бота в Telegram
      </a>

      <div class="space-y-1.5">
        <div class="text-xs text-muted-foreground">Код верификации</div>
        <div class="flex items-center gap-2">
          <code class="flex-1 font-mono text-sm bg-muted rounded px-3 py-2 select-all">
            {{ session.verificationCode }}
          </code>
          <Button type="button" variant="outline" size="icon" @click="copyCode" aria-label="Скопировать код">
            <Copy class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span v-if="status === 'user_started'">Пользователь открыл бота, ждём подтверждения…</span>
        <span v-else>Откройте бота и нажмите Start — мы сами дождёмся подтверждения.</span>
      </div>
    </template>

    <template v-else-if="status === 'failed' || status === 'expired'">
      <div class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-medium">
            {{ status === 'expired' ? 'Код истёк' : 'Не получилось привязать канал' }}
          </div>
          <div v-if="failureReason" class="text-xs text-muted-foreground mt-1">
            {{ failureReason }}
          </div>
        </div>
      </div>
      <Button type="button" class="w-full" @click="start">Начать заново</Button>
    </template>

    <div v-if="errorText" class="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
      <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div class="flex-1">
        <div>{{ errorText }}</div>
        <Button type="button" variant="outline" size="sm" class="mt-2" @click="start">
          Попробовать снова
        </Button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2:** Type-check: `yarn build`. Expected: passes.

- [ ] **Step 3:** Коммит:

```bash
git add lib-modules/content-calendar/components/TelegramLinkFlow.vue
git commit -m "feat(calendar): add TelegramLinkFlow component"
```

---

## Task 4: Интеграция в `ConnectAccountPage.vue`

**Files:**
- Modify: `lib-modules/workspaces/components/ConnectAccountPage.vue`

- [ ] **Step 1:** В импортах заменить строку

```ts
import TelegramLoginButton from '~/lib-modules/web-auth/components/TelegramLoginButton.vue'
```

на

```ts
import TelegramLinkFlow from '~/lib-modules/content-calendar/components/TelegramLinkFlow.vue'
import { toast } from 'vue-sonner'
import { getToasterPosition } from '~/scripts/features/utils/toater'
```

- [ ] **Step 2:** В `<script setup>`, перед `onMounted`, добавить обработчик:

```ts
function onChannelLinked(_socialAccountId: string) {
  toast.success('Канал привязан', { position: getToasterPosition() })
  dialogOpen.value = false
  navigateTo('/app/calendar')
}
```

- [ ] **Step 3:** В `<template>`, внутри `<DialogContent>`, заменить блок

```vue
        <div v-if="selectedPlatform?.id === 'telegram'" class="py-2 space-y-3">
          <TelegramLoginButton mode="link" />
          <p class="text-xs text-muted-foreground text-center">
            Привязка канала к бренду в разработке — пока кнопка только подтверждает Telegram-аккаунт пользователя.
          </p>
        </div>
```

на

```vue
        <TelegramLinkFlow
          v-if="selectedPlatform?.id === 'telegram' && workspaceId"
          :workspace-id="workspaceId"
          @linked="onChannelLinked"
        />
```

- [ ] **Step 4:** Обновить `DialogDescription` для telegram — текущий текст «Авторизуйтесь через Telegram, чтобы связать канал с брендом.» оставить (подходит под новый flow).

- [ ] **Step 5:** Type-check: `yarn build`. Expected: passes.

- [ ] **Step 6:** Коммит:

```bash
git add lib-modules/workspaces/components/ConnectAccountPage.vue
git commit -m "feat(connect-account): wire TelegramLinkFlow into TG tile"
```

---

## Task 5: Ручная верификация

- [ ] **Step 1:** Убедиться, что у пользователя уже запущен `yarn devo` (или `yarn dev` против дев-бека) на `:3000`. Если процесс не держится — **НЕ поднимать свой** (пользователь управляет им сам), только попросить запустить/проверить доступность `curl -sI http://localhost:3000/`.

- [ ] **Step 2:** В браузере: `/app/workspaces` → выбрать бренд → перейти в `Добавить соц. сети` → кликнуть плитку **Telegram**.

Expected: диалог открывается, показывается «Готовим ссылку…», затем появляется кнопка **«Открыть бота в Telegram»** + моноширинный код верификации + надпись «Откройте бота и нажмите Start…». Сетевой таб: `POST /workspaces/{id}/telegram/link/start` → 200.

- [ ] **Step 3:** Проверить поллинг: в сетевом табе каждые ~2 сек должен лететь `GET /workspaces/{id}/telegram/link/status/{code}` → 200 со `status: pending`.

- [ ] **Step 4:** Кликнуть **«Открыть бота в Telegram»**, в боте нажать Start.

Expected: статус в UI меняется — либо сразу «Пользователь открыл бота, ждём подтверждения…» (`user_started`), либо сразу `completed`. На `completed`: тост «Канал привязан», диалог закрывается, редирект на `/app/calendar`, новый TG-аккаунт виден в левом сайдбаре аккаунтов.

- [ ] **Step 5:** Проверить expired: повторить Step 2, дождаться истечения `expiresAt` не открывая бота (если `expiresAt` длинный — можно вручную подделать ответ в devtools, либо прогнать позже). Expected: UI показывает «Код истёк» + кнопку «Начать заново», которая перезапускает flow.

- [ ] **Step 6:** Проверить закрытие диалога до завершения: открыть диалог, не нажимать ничего, закрыть диалог. Expected: в сетевом табе GET `/link/status/…` перестаёт уходить (поллинг остановлен).

- [ ] **Step 7:** Если все предыдущие шаги прошли — итоговый коммит дизайна и плана:

```bash
git add docs/superpowers/specs/2026-04-23-telegram-channel-link-dev-design.md docs/superpowers/plans/2026-04-23-telegram-channel-link.md
git commit -m "docs: Telegram channel linking spec + plan"
```

---

## Self-review

**Spec coverage:**
- API endpoints (start/status) → Task 1 (aliases) + Task 2 (методы). ✅
- UI flow (deep link, verification code, poll, terminal) → Task 3. ✅
- Замена заглушки в ConnectAccountPage → Task 4. ✅
- `useTelegramOAuth` не трогается → ни одна задача его не касается. ✅
- `DELETE /telegram/{socialAccountId}` — явно вне скоупа (указано в спеке). ✅

**Placeholders:** TODO/TBD нет, все code-блоки заполнены.

**Type consistency:** `TelegramLinkStartResponse` / `TelegramLinkStatusResponse` используются в Task 2 с теми же именами, что объявлены в Task 1. `ContentCalendarApiController` имеет `startTelegramLink` / `getTelegramLinkStatus` в Task 2, и они же дёргаются из Task 3. `emit('linked', id)` в Task 3 → `@linked="onChannelLinked"` в Task 4 с совпадающей сигнатурой.

**Edge cases:**
- Clipboard в non-secure context — молча проглатывается (`try/catch`).
- Закрытие диалога во время поллинга — `onBeforeUnmount` остановит интервал.
- Ошибка start/poll — `errorText` + кнопка «Попробовать снова».
