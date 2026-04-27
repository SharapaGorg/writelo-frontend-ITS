# Telegram Link — миграция на v1-26.04 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести существующий TG-канал-линк flow с удалённых эндпоинтов `/telegram/link/*` на новый generic `/social-accounts/link` с polling списка `/social-accounts` вместо polling статуса по коду.

**Architecture:** Точечный refactor 4-х файлов. API-слой меняет ApiAlias, типы и сигнатуру одного метода контроллера. `TelegramLinkFlow.vue` переписывается под snapshot-diff polling списка соц. аккаунтов и упрощённую state-машину. Публичный контракт компонента (`:workspace-id` / `@linked`) сохраняется, поэтому `ConnectAccountPage.vue` не трогается. После Task 1 build временно ломается до завершения Task 2.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Tailwind, TypeScript, кастомный `ApiController` (`scripts/shared/api/controller.ts`), shadcn-vue (`@/components/ui/button`, `@/components/ui/dialog`), `vue-sonner`, `lucide-vue-next`.

**Spec:** `docs/superpowers/specs/2026-04-27-telegram-link-migration-design.md`

**Verification gate:** ручной smoke-тест в браузере на `/app/connect-account` (один экран). Никаких unit-тестов под этот компонент в кодовой базе нет — добавлять не будем (см. CLAUDE.md «не тащить лишних абстракций»).

---

## Task 1: API-слой — ApiAlias, типы, метод контроллера

**Files:**
- Modify: `scripts/shared/types/index.ts` (enum `ApiAliases`)
- Modify: `lib-modules/content-calendar/types/index.ts`
- Modify: `lib-modules/content-calendar/helpers/api.ts`

> ⚠️ После этого таска `TelegramLinkFlow.vue` перестанет компилироваться (импортирует удалённые типы и зовёт удалённый метод). Это ожидаемо — Task 2 это чинит. Не коммитить между Task 1 и Task 2.

- [ ] **Step 1.1:** В `scripts/shared/types/index.ts` удалить старые TG-link алиасы и добавить новый generic.

Найти блок:
```ts
    // Telegram channel linking
    workspaceTelegramLinkStart  = 'workspaces/{workspaceId}/telegram/link/start',
    workspaceTelegramLinkStatus = 'workspaces/{workspaceId}/telegram/link/status/{code}',
```

Удалить эти две строки и комментарий `// Telegram channel linking`.

В блоке `// Social accounts` (выше по файлу) после строк
```ts
    workspaceSocialAccounts = 'workspaces/{workspaceId}/social-accounts',
    workspaceSocialAccount = 'workspaces/{workspaceId}/social-accounts/{socialAccountId}',
```
дополнить третьей:
```ts
    workspaceSocialAccountsLink = 'workspaces/{workspaceId}/social-accounts/link',
```

- [ ] **Step 1.2:** В `lib-modules/content-calendar/types/index.ts` удалить блок старых TG-типов.

Удалить строки 52–71 (комментарий + три определения):
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

На их место (там же, после `UpsertSocialAccountRequest`) вставить:
```ts
// ---- Social account linking (API 26.04) ----

export interface StartSocialAccountLinkRequest {
  platform: SocialNetwork
}

export interface SocialAccountLinkStartResponse {
  url: string
}
```

- [ ] **Step 1.3:** В `lib-modules/content-calendar/helpers/api.ts` обновить импорт типов.

Найти в импорте из `'../types'`:
```ts
  TelegramLinkStartResponse,
  TelegramLinkStatusResponse,
```
Заменить на:
```ts
  SocialAccountLinkStartResponse,
  StartSocialAccountLinkRequest,
```

- [ ] **Step 1.4:** В `ContentCalendarApiController` заменить TG-link методы.

Найти блок:
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

Заменить на:
```ts
  // Telegram channel linking — generic /social-accounts/link, platform pinned to 'telegram'
  startTelegramLink(workspaceId: string): Promise<SocialAccountLinkStartResponse> {
    const url = buildUrl(ApiAliases.workspaceSocialAccountsLink, { workspaceId })
    const body: StartSocialAccountLinkRequest = { platform: 'telegram' }
    return this.api.request(url, RequestMethod.POST, body) as Promise<SocialAccountLinkStartResponse>
  }
```

- [ ] **Step 1.5:** Прогнать TypeScript-проверку, убедиться, что ошибки только в `TelegramLinkFlow.vue`.

```bash
yarn vue-tsc --noEmit
```

Ожидаемо: ошибки в `lib-modules/content-calendar/components/TelegramLinkFlow.vue` (импорт `TelegramLinkStartResponse`/`TelegramLinkStatus`, обращение к `verificationCode`, вызов `getTelegramLinkStatus`). Других ошибок быть не должно.

Если есть ошибки в других файлах — это значит что-то ещё ссылается на удалённые символы; найти грепом и поправить (или вернуться и пересмотреть).

```bash
# Проверка, что больше никто не использует старые символы
```
Использовать tool `Grep` на:
- `TelegramLinkStartResponse|TelegramLinkStatusResponse|TelegramLinkStatus[^A-Za-z]`
- `workspaceTelegramLinkStart|workspaceTelegramLinkStatus`
- `getTelegramLinkStatus`

Ожидаемо: упоминания только в `TelegramLinkFlow.vue` + старых `docs/`.

---

## Task 2: Переписать `TelegramLinkFlow.vue`

**Files:**
- Modify: `lib-modules/content-calendar/components/TelegramLinkFlow.vue` (полный rewrite)

- [ ] **Step 2.1:** Заменить `<script setup>` целиком.

Открыть файл и заменить всё содержимое блока `<script setup lang="ts">…</script>` на:

```ts
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useContentCalendarApi } from '../helpers/api'

const props = defineProps<{ workspaceId: string }>()
const emit = defineEmits<{
  linked: [socialAccountId: string]
}>()

const api = useContentCalendarApi()

const POLL_INTERVAL_MS = 3000
const TIMEOUT_SEC = 120

type FlowState = 'starting' | 'waiting' | 'timed_out' | 'error'

const state = ref<FlowState>('starting')
const linkUrl = ref<string | null>(null)
const errorText = ref<string | null>(null)
const remainingSec = ref(TIMEOUT_SEC)
const manualCheckPending = ref(false)
const manualCheckEmpty = ref(false)

let existingTgIds = new Set<string>()
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const remainingLabel = computed(() => {
  const s = Math.max(0, remainingSec.value)
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${ss.toString().padStart(2, '0')}`
})

function stopTimers() {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function findNewTgId(accounts: { id: string; network: string }[]): string | null {
  for (const a of accounts) {
    if (a.network === 'telegram' && !existingTgIds.has(a.id)) {
      return a.id
    }
  }
  return null
}

function tickCountdown() {
  remainingSec.value -= 1
  if (remainingSec.value <= 0) {
    stopTimers()
    state.value = 'timed_out'
  }
}

async function poll() {
  try {
    const accounts = await api.getSocialAccounts(props.workspaceId)
    const newId = findNewTgId(accounts)
    if (newId) {
      stopTimers()
      emit('linked', newId)
    }
  } catch (e) {
    console.error('[TelegramLinkFlow] poll failed:', e)
    stopTimers()
    state.value = 'error'
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  }
}

async function start() {
  stopTimers()
  state.value = 'starting'
  errorText.value = null
  linkUrl.value = null
  remainingSec.value = TIMEOUT_SEC
  manualCheckEmpty.value = false
  manualCheckPending.value = false

  try {
    const accountsBefore = await api.getSocialAccounts(props.workspaceId)
    existingTgIds = new Set(
      accountsBefore.filter((a) => a.network === 'telegram').map((a) => a.id),
    )

    const res = await api.startTelegramLink(props.workspaceId)
    linkUrl.value = res.url
    state.value = 'waiting'
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
    countdownTimer = setInterval(tickCountdown, 1000)
  } catch (e) {
    console.error('[TelegramLinkFlow] start failed:', e)
    state.value = 'error'
    errorText.value = 'Не удалось начать привязку. Попробуй ещё раз.'
  }
}

async function manualCheck() {
  manualCheckPending.value = true
  manualCheckEmpty.value = false
  try {
    const accounts = await api.getSocialAccounts(props.workspaceId)
    const newId = findNewTgId(accounts)
    if (newId) {
      emit('linked', newId)
    } else {
      manualCheckEmpty.value = true
    }
  } catch (e) {
    console.error('[TelegramLinkFlow] manual check failed:', e)
    state.value = 'error'
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  } finally {
    manualCheckPending.value = false
  }
}

onMounted(start)
onBeforeUnmount(stopTimers)
</script>
```

- [ ] **Step 2.2:** Заменить `<template>` целиком.

Заменить блок `<template>…</template>` на:

```vue
<template>
  <div class="py-2 space-y-4">
    <div
      v-if="state === 'starting'"
      class="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2 class="h-4 w-4 animate-spin" />
      Готовим ссылку…
    </div>

    <template v-else-if="state === 'waiting' && linkUrl">
      <a
        :href="linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 transition"
      >
        <ExternalLink class="h-4 w-4" />
        Открыть бота в Telegram
      </a>

      <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span>Откройте бота и нажмите Start.</span>
        <span class="font-mono tabular-nums">{{ remainingLabel }}</span>
      </div>
    </template>

    <template v-else-if="state === 'timed_out'">
      <div class="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-medium text-foreground">Не дождались привязки</div>
          <div class="text-xs mt-1">
            Если уже подтвердил в Telegram — нажми «Проверить». Иначе можно начать заново.
          </div>
          <div v-if="manualCheckEmpty" class="text-xs mt-2 text-red-600 dark:text-red-400">
            Канал ещё не появился. Подожди немного и попробуй снова.
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <Button
          type="button"
          variant="default"
          class="flex-1"
          :disabled="manualCheckPending"
          @click="manualCheck"
        >
          <Loader2 v-if="manualCheckPending" class="h-4 w-4 animate-spin mr-2" />
          Проверить
        </Button>
        <Button type="button" variant="outline" class="flex-1" @click="start">
          Начать заново
        </Button>
      </div>
    </template>

    <template v-else-if="state === 'error'">
      <div class="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <div>{{ errorText }}</div>
          <Button type="button" variant="outline" size="sm" class="mt-2" @click="start">
            Попробовать снова
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2.3:** Прогнать TypeScript-проверку.

```bash
yarn vue-tsc --noEmit
```

Ожидаемо: 0 ошибок. Если есть — поправить inline.

- [ ] **Step 2.4:** Прогнать линтер на изменённые файлы (если в проекте настроен ESLint).

Проверить: есть ли `yarn lint` в `package.json`. Если есть — запустить и убедиться, что нет новых warning-ов в изменённых файлах.

---

## Task 3: Smoke-тест в браузере

> Юзер уже держит `yarn dev` на `:3000` (см. memory). Свой dev-сервер не поднимать. Все проверки — через тот, что у юзера.

- [ ] **Step 3.1:** Перейти на `/app/connect-account?workspaceId=<любой_активный>`.

Сказать юзеру: «Открой `/app/connect-account` для активного воркспейса и кликни плитку Telegram, потом скажи что в Network».

Что ожидаем в Network:
- `GET /workspaces/{id}/social-accounts` (snapshot до старта).
- `POST /workspaces/{id}/social-accounts/link` с body `{"platform":"telegram"}`. Status 200, response `{"url":"…"}`.
- `GET /workspaces/{id}/social-accounts` каждые 3 секунды (poll).

Что ожидаем в UI:
- Сначала «Готовим ссылку…» со спиннером.
- Затем синяя кнопка «Открыть бота в Telegram» (`href = url из ответа`).
- Под ней спиннер + «Откройте бота и нажмите Start.» + `mm:ss` отсчёт от `2:00`.
- **Нет** блока с кодом верификации.
- **Нет** копи-кнопки.

- [ ] **Step 3.2:** Тест happy-path (если бэк-сторона бота уже работает): открыть бота по ссылке, нажать Start, дождаться, что бэк создал TG-`SocialAccount`.

Что ожидаем:
- Очередной `GET /social-accounts` вернёт новый TG-аккаунт.
- Тост «Канал привязан».
- Диалог закрывается.
- Происходит `navigateTo('/app/calendar')`.

Если бэкенд ещё не готов или нет тестового бота — пропустить этот шаг и описать юзеру, что происходит на UI стороне (это уже проверено в шаге 3.1).

- [ ] **Step 3.3:** Тест timeout-ветки.

Открыть диалог, **не открывать** бота. Подождать 2 минуты. Что ожидаем:
- Поллинг `GET /social-accounts` каждые 3s останавливается через 120s.
- UI меняется на состояние «Не дождались привязки» с двумя кнопками.

- [ ] **Step 3.4:** Тест manual-check ветки.

В состоянии timeout нажать «Проверить» (без реального завершения линка):
- Один `GET /social-accounts`.
- Поскольку нового TG нет — появляется красная строка «Канал ещё не появился. Подожди немного и попробуй снова.»

Нажать «Начать заново»:
- Делается новый `POST /social-accounts/link`.
- UI возвращается в `waiting`-стейт с новой ссылкой и сброшенным countdown.

- [ ] **Step 3.5:** Тест error-ветки (опционально).

Если есть возможность временно отключить интернет / заблокировать `/social-accounts/link` в DevTools (Network → Block request URL) — проверить, что отображается красное «Не удалось начать привязку. Попробуй ещё раз.» с кнопкой ретрая.

- [ ] **Step 3.6:** Сообщить пользователю результат и ждать команды на коммит.

> Per memory: «Don't auto-commit until user confirms — user tests in browser first; don't `git commit` after a task until they say 'работает'»

Не коммитить автоматически. Дождаться явного сигнала.

---

## Task 4: Коммит

- [ ] **Step 4.1:** После подтверждения пользователя — закоммитить.

```bash
git add scripts/shared/types/index.ts lib-modules/content-calendar/types/index.ts lib-modules/content-calendar/helpers/api.ts lib-modules/content-calendar/components/TelegramLinkFlow.vue docs/superpowers/specs/2026-04-27-telegram-link-migration-design.md docs/superpowers/plans/2026-04-27-telegram-link-migration.md
git commit -m "$(cat <<'EOF'
refactor(content-calendar): migrate TG channel link to /social-accounts/link

API v1-26.04 removed /workspaces/{id}/telegram/link/{start,status} in favor
of generic /workspaces/{id}/social-accounts/link with { platform } body.
Replace status polling by code with snapshot-diff polling on /social-accounts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review

**Spec coverage:**
- Decisions table → Task 1.1–1.4 (alias, types, controller), Task 2 (component rewrite, polling params, timeout-fallback). ✓
- «Поведение» 1–7 → Task 2.1 (script: `start`, `poll`, `tickCountdown`, `manualCheck`), Task 2.2 (template states). ✓
- «Изменения / `ApiAliases`» → Step 1.1. ✓
- «Изменения / types» → Step 1.2. ✓
- «Изменения / api.ts» → Steps 1.3 + 1.4. ✓
- «Изменения / TelegramLinkFlow.vue» → Task 2 целиком. ✓
- «Изменения / ConnectAccountPage.vue» (не меняется) → проверено: контракт `:workspace-id` + `@linked` сохранён, `onChannelLinked` уже принимает `socialAccountId: string` и делает toast+close+navigate. ✓
- «Что НЕ делаем» → не упоминается в задачах. ✓

**Type/имя consistency:**
- `SocialAccountLinkStartResponse.url` (Step 1.2) → используется как `res.url` в Step 2.1 (`linkUrl.value = res.url`). ✓
- `StartSocialAccountLinkRequest.platform: SocialNetwork` (Step 1.2) → `body: StartSocialAccountLinkRequest = { platform: 'telegram' }` (Step 1.4) — `'telegram'` — валидный литерал `SocialNetwork`. ✓
- `getSocialAccounts(workspaceId)` возвращает `SocialAccount[]` (с полем `network`) — `findNewTgId` принимает `{ id, network }[]`. ✓
- `state` enum `'starting' | 'waiting' | 'timed_out' | 'error'` — все 4 ветки покрыты в template (Step 2.2). ✓
- `emit('linked', socialAccountId)` (Step 2.1) → `onChannelLinked(_socialAccountId: string)` в `ConnectAccountPage.vue` (не меняется). ✓

**Risks not addressed by tasks:**
- Параллельный TG-линк в другой вкладке — спека помечает как «маловероятный кейс, не закладываемся». ✓
- 401 в polling — `ApiController` имеет глобальный хендлер (см. CLAUDE.md), локальный `try/catch` ловит и переходит в `error`. ✓

**Placeholders:** проверено — ни «TBD», ни «similar to», ни «add error handling» нет. Каждый шаг с кодом содержит полный код.
