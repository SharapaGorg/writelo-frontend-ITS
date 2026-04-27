# Командная версия — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-27-team-version-design.md`

**Goal:** Поднять признак «командного» тарифа (`isBusinessPlan`) и весь UI вокруг — Members/Invites управление и Activity Log — за этим флагом.

**Architecture:** Три фазы. Phase 1 — флаг + индикатор + сайдбар-пункты + middleware-гейт + плейсхолдер-страницы. Phase 2 — новый модуль `lib-modules/team` с двумя API-контроллерами, страницей `/app/team` и публичной `/invite/[token]`. Phase 3 — новый модуль `lib-modules/activity-log` со страницей `/app/activity`. Каждая фаза независимо проверяется в браузере.

**Tech Stack:** Nuxt 3 (file-based routing), Vue 3 + `<script setup>`, TypeScript, Tailwind, shadcn-vue, vue-sonner для тостов, vitest+happy-dom для unit-тестов чистой логики, `lucide-vue-next` для иконок.

**Конвенции (важно перед стартом):**
- API-контроллеры — **композиция** (`private api: ApiController`), не наследование. См. `lib-modules/workspaces/helpers/api.ts:11-19`. Это намеренно — extends ломает порядок eval'а модулей.
- Singleton-фабрика: `useFooApi()` хранит в `let instance: FooApiController | null = null`. См. `lib-modules/workspaces/helpers/api.ts:46-53`.
- Pure-логика → vitest (`tests/<name>.test.ts`, `yarn test:run`). UI/composables/API → проверка только в браузере на гейте фазы.
- Коммиты — **только на verification gate в конце фазы**, после фразы пользователя «работает». Внутри фазы — никаких `git commit`.
- Workspace-scoped GET'ы бить с `?_t=${Date.now()}` (memory: они не cache-controlled).
- Destructive-мутации — `silent: true` в `request()` + verify-by-refetch (memory: 4xx может прийти при успешной мутации).
- AlertDialog — два ref'а: `v-model:open` boolean + отдельный target ref (memory: derived `:open` гасит handler'ы).

**Уже в репо (не дублировать):**
- `WorkspaceRole`, `WorkspaceInviteRole`, `PagedResponse<T>`, `UserSummaryDto` — в `scripts/shared/types/workspace.ts`.
- `ApiAliases.workspaceMembers`, `workspaceMember`, `workspaceInvites`, `workspaceInvite`, `workspaceActivityLog` — в `scripts/shared/types/index.ts`.
- `useWorkspaceContext().requireWorkspaceId()` — `lib-modules/workspaces/composables/useWorkspaceContext.ts`.
- `usePlans()` — `lib-modules/plans/composables/usePlans.ts`.
- `ApiController.request(url, method, data, streaming, silent)` — 5-й аргумент `silent: true` заглушает controller-level тосты.
- Dev-only: `ApiController.grantDevSubscription(userId)` — даёт business-подписку на staging для тестов.

---

## Files map

### Создаются

| Файл | Ответственность |
|---|---|
| `middleware/business-plan.ts` | Глобальный middleware: редирект на `/app/plans` при `!isBusinessPlan`. |
| `pages/app/team.vue` | Wrapper `<TeamPage />` + `definePageMeta({ layout: 'app', middleware: 'business-plan' })`. |
| `pages/app/activity.vue` | Wrapper `<ActivityLogPage />` + meta. |
| `pages/invite/[token].vue` | Wrapper `<InviteAcceptPage />`, без `app` layout. |
| `lib-modules/team/types/index.ts` | DTO + локальные типы. |
| `lib-modules/team/helpers/api.ts` | `WorkspaceMembersApiController`, `WorkspaceInvitesApiController`, `useTeamApi*()` фабрики. |
| `lib-modules/team/helpers/toasts.ts` | Команд-специфичные тосты. |
| `lib-modules/team/composables/useTeam.ts` | Оркестратор members + invites. |
| `lib-modules/team/components/sections/MembersSection.vue` | Список участников + действия. |
| `lib-modules/team/components/sections/InvitesSection.vue` | Список pending invites + revoke. |
| `lib-modules/team/components/dialogs/InviteMemberDialog.vue` | Форма создания приглашения. |
| `lib-modules/team/components/dialogs/TransferOwnershipDialog.vue` | Подтверждение передачи владения вводом email. |
| `lib-modules/team/components/TeamPage.vue` | Хедер + workspace-context check + секции. |
| `lib-modules/team/components/InviteAcceptPage.vue` | Preview + accept/decline для public-страницы. |
| `lib-modules/team/index.ts` | Public API модуля. |
| `lib-modules/activity-log/types/index.ts` | `ActivityLogItemDto` + локальные типы. |
| `lib-modules/activity-log/helpers/api.ts` | `WorkspaceActivityLogApiController` + фабрика. |
| `lib-modules/activity-log/helpers/formatting.ts` | `mapAction()` + day-grouping helper. |
| `lib-modules/activity-log/composables/useActivityLog.ts` | Подгрузка + фильтры + infinite scroll state. |
| `lib-modules/activity-log/components/ActivityLogFilters.vue` | User select + date range + reset. |
| `lib-modules/activity-log/components/ActivityLogItem.vue` | Одна строка лога. |
| `lib-modules/activity-log/components/ActivityLogPage.vue` | Хедер + фильтры + сгруппированный список + infinite scroll. |
| `lib-modules/activity-log/index.ts` | Public API модуля. |
| `tests/is-business-plan.test.ts` | Unit-тесты pattern matching. |
| `tests/map-action.test.ts` | Unit-тесты fallback formatter'а. |

### Правки

| Файл | Что меняется |
|---|---|
| `lib-modules/plans/composables/usePlans.ts` | + `isBusinessPlan` computed. |
| `lib-modules/app-layout/types/index.ts` | + `'team' \| 'activity'` в `SidebarSection`; + `requiresBusinessPlan?: boolean` в `SidebarItem`. |
| `lib-modules/app-layout/composables/useAppLayout.ts` | + два пункта (team/activity) с `requiresBusinessPlan: true`; фильтр `sidebarItems` по `isBusinessPlan` через `usePlans()`. |
| `lib-modules/app-layout/components/AppSidebar.vue` | + `Users`, `History` в `iconComponents`; + строка «Командная версия» в чипе подписки; + import `usePlans`. |
| `scripts/shared/types/workspace.ts` | + `WorkspaceMemberDto`, `WorkspaceInviteDto`, `WorkspaceInvitePreviewDto`, `WorkspaceInviteStatus`, `ActivityLogItemDto`, `CreateWorkspaceInviteRequest`, `UpdateWorkspaceMemberRequest`. |
| `scripts/shared/types/index.ts` | + `workspaceInviteRevoke`, `workspaceInvitePreview`, `workspaceInviteAccept`, `workspaceInviteDecline` в `ApiAliases`. |

---

# Phase 1 — Plan gate + индикатор

## Task 1.1: `isBusinessPlan` в `usePlans()` + unit-тесты

**Files:**
- Modify: `lib-modules/plans/composables/usePlans.ts`
- Create: `tests/is-business-plan.test.ts`

- [ ] **Step 1:** Создать тест-файл.

```ts
// tests/is-business-plan.test.ts
import { describe, it, expect } from 'vitest'

// Чистая хелпер-функция: вынесем её из usePlans, чтобы тестировать без mount/Vue.
import { matchesBusinessPlan } from '~/lib-modules/plans/composables/usePlans'

describe('matchesBusinessPlan', () => {
  it('matches "Business" — case insensitive', () => {
    expect(matchesBusinessPlan('Business')).toBe(true)
    expect(matchesBusinessPlan('BUSINESS')).toBe(true)
    expect(matchesBusinessPlan('business plan')).toBe(true)
  })

  it('matches "Team" / "Команда" / "Агентство" и опечатку "Агенство"', () => {
    expect(matchesBusinessPlan('Team')).toBe(true)
    expect(matchesBusinessPlan('Команда')).toBe(true)
    expect(matchesBusinessPlan('Командный')).toBe(true)
    expect(matchesBusinessPlan('Агентство')).toBe(true)
    expect(matchesBusinessPlan('Агенство')).toBe(true)  // типичная опечатка
    expect(matchesBusinessPlan('Агентский тариф')).toBe(true)
  })

  it('does NOT match Pro / Free / прочие', () => {
    expect(matchesBusinessPlan('Pro')).toBe(false)
    expect(matchesBusinessPlan('Free')).toBe(false)
    expect(matchesBusinessPlan('Бесплатный')).toBe(false)
    expect(matchesBusinessPlan('Demo')).toBe(false)
    expect(matchesBusinessPlan('')).toBe(false)
  })

  it('handles null / undefined', () => {
    expect(matchesBusinessPlan(null)).toBe(false)
    expect(matchesBusinessPlan(undefined)).toBe(false)
  })
})
```

- [ ] **Step 2:** Запустить, убедиться что фейлится из-за отсутствия экспорта.

```bash
yarn test:run tests/is-business-plan.test.ts
```

Expected: FAIL — `matchesBusinessPlan is not exported`.

- [ ] **Step 3:** Реализовать в `usePlans.ts`.

```ts
// lib-modules/plans/composables/usePlans.ts
import { computed } from 'vue'
import type { SubscriptionType } from '~/scripts/shared/types/common'

const BUSINESS_TITLE_PATTERNS = ['business', 'team', 'команд', 'аген'] as const

export function matchesBusinessPlan(title: string | null | undefined): boolean {
  if (!title) return false
  const lower = title.toLowerCase()
  return BUSINESS_TITLE_PATTERNS.some(p => lower.includes(p))
}

export function usePlans() {
  const $settings = useSettings()

  const plans = computed<SubscriptionType[]>(() => $settings.getConfig()?.subscriptions ?? [])
  const currentPlanId = computed<number | null>(() => $settings.getSubscription()?.id ?? null)
  const loaded = computed(() => $settings.loaded.value)

  const popularPlanId = computed<number | null>(() => {
    const sorted = [...plans.value].sort((a, b) => a.price - b.price)
    if (sorted.length < 3) return null
    return sorted[Math.floor(sorted.length / 2)].id
  })

  const isBusinessPlan = computed(() => matchesBusinessPlan($settings.getSubscription()?.title))

  const isCurrentPlan = (id: number) => currentPlanId.value === id
  const isPopularPlan = (id: number) => popularPlanId.value === id

  return {
    plans,
    currentPlanId,
    popularPlanId,
    loaded,
    isBusinessPlan,
    isCurrentPlan,
    isPopularPlan,
  }
}
```

- [ ] **Step 4:** Запустить тест, убедиться что зелёный.

```bash
yarn test:run tests/is-business-plan.test.ts
```

Expected: 4 passing.

---

## Task 1.2: Расширить `SidebarItem` + добавить пункты в `useAppLayout`

**Files:**
- Modify: `lib-modules/app-layout/types/index.ts`
- Modify: `lib-modules/app-layout/composables/useAppLayout.ts`

- [ ] **Step 1:** Расширить тип.

```ts
// lib-modules/app-layout/types/index.ts
export type SidebarSection =
  | 'calendar'
  | 'editor'
  | 'reels-script'
  | 'trends'
  | 'workspaces'
  | 'team'
  | 'activity'
  | 'profile'
  | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
  requiresBusinessPlan?: boolean
}
```

- [ ] **Step 2:** Гейтить пункты в `useAppLayout()`.

```ts
// lib-modules/app-layout/composables/useAppLayout.ts
import { ref, computed } from 'vue'
import { usePlans } from '~/lib-modules/plans'
import type { SidebarSection, SidebarItem } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const { isBusinessPlan } = usePlans()

  const allItems: SidebarItem[] = [
    { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
    { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
    // { id: 'reels-script', icon: 'film', label: 'Сценарий Рилс', route: '/app/reels-script' },
    { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
    { id: 'workspaces', icon: 'briefcase', label: 'Бренды', route: '/app/workspaces' },
    { id: 'team', icon: 'users', label: 'Команда', route: '/app/team', requiresBusinessPlan: true },
    { id: 'activity', icon: 'history', label: 'Журнал', route: '/app/activity', requiresBusinessPlan: true },
  ]

  const sidebarItems = computed<SidebarItem[]>(() =>
    allItems.filter(i => !i.requiresBusinessPlan || isBusinessPlan.value),
  )

  const bottomItems: SidebarItem[] = [
    { id: 'profile', icon: 'user', label: 'Профиль', route: '/app/profile' },
    { id: 'settings', icon: 'settings', label: 'Настройки', route: '/app/settings' },
  ]

  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }

  function setActiveSection(section: SidebarSection) {
    activeSection.value = section
  }

  return {
    isCollapsed: computed(() => isCollapsed.value),
    activeSection: computed(() => activeSection.value),
    sidebarItems,
    bottomItems,
    toggleSidebar,
    setActiveSection,
  }
}
```

> ⚠️ `sidebarItems` теперь computed (был массив). Проверить, что `AppSidebar.vue:99` (`v-for="item in sidebarItems"`) корректно реактивно работает — Vue разворачивает computed автоматически в template.

---

## Task 1.3: Иконки + индикатор в `AppSidebar.vue`

**Files:**
- Modify: `lib-modules/app-layout/components/AppSidebar.vue`

- [ ] **Step 1:** Добавить иконки и индикатор.

В `<script setup>` — расширить импорт из `lucide-vue-next`:

```ts
import {
  Calendar,
  PenSquare,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Film,
  LogIn,
  User,
  Briefcase,
  Sparkles,
  Crown,
  Users,    // NEW
  History,  // NEW
} from 'lucide-vue-next'
```

Добавить импорт `usePlans` рядом с существующими:

```ts
import { usePlans } from '~/lib-modules/plans'
```

И достать флаг (рядом с `subscription`/`isFreePlan`):

```ts
const { isBusinessPlan } = usePlans()
```

Расширить `iconComponents`:

```ts
const iconComponents: Record<string, typeof Calendar> = {
  'calendar': Calendar,
  'pen-square': PenSquare,
  'film': Film,
  'trending-up': TrendingUp,
  'briefcase': Briefcase,
  'user': User,
  'settings': Settings,
  'users': Users,       // NEW
  'history': History,   // NEW
}
```

В template, в чипе подписки сразу после `<div class="text-xs font-medium ...">{{ ... }}</div>` (после строки 176, до закрытия родительского `<div>` на 180), добавить:

```html
<div
  v-if="isBusinessPlan"
  class="text-[11px] text-muted-foreground truncate whitespace-nowrap"
>
  Командная версия
</div>
```

Существующая ветка `<div v-if="isFreePlan" ...>Открыть тарифы →</div>` остаётся как есть. Эти два блока mutually exclusive: business план не может быть free.

- [ ] **Step 2:** Сохранить файл.

(Браузер-проверка — на гейте фазы.)

---

## Task 1.4: Middleware `business-plan`

**Files:**
- Create: `middleware/business-plan.ts`

- [ ] **Step 1:** Написать middleware.

```ts
// middleware/business-plan.ts
import { usePlans } from '~/lib-modules/plans'

export default defineNuxtRouteMiddleware(() => {
  const { isBusinessPlan, loaded } = usePlans()

  // Если конфиг ещё не подгрузился — пропускаем; флаг вычислится после init().
  // Cтраницы сами должны учитывать loaded-state. Альтернатива — ждать, но это
  // блокирует роут; в продакшене settings.init() стоит на app boot, поэтому
  // к моменту навигации loaded === true.
  if (!loaded.value) return

  if (!isBusinessPlan.value) {
    return navigateTo('/app/plans')
  }
})
```

> Middleware называется по имени файла — `business-plan` соответствует `middleware: 'business-plan'` в page meta.

---

## Task 1.5: Page shells `/app/team` и `/app/activity`

**Files:**
- Create: `pages/app/team.vue`
- Create: `pages/app/activity.vue`

- [ ] **Step 1:** `pages/app/team.vue` — placeholder.

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'business-plan',
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold">Команда</h1>
    <p class="mt-2 text-sm text-muted-foreground">
      Управление участниками воркспейса появится здесь в следующей фазе.
    </p>
  </div>
</template>
```

- [ ] **Step 2:** `pages/app/activity.vue` — placeholder.

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'business-plan',
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold">Журнал</h1>
    <p class="mt-2 text-sm text-muted-foreground">
      История действий в воркспейсе появится здесь в следующей фазе.
    </p>
  </div>
</template>
```

---

## Task 1.6: Verification gate Phase 1 + commit

- [ ] **Step 1:** Юзер делает manual browser check:

  - На бесплатном тарифе пунктов «Команда» и «Журнал» в сайдбаре **нет**.
  - Прямой ввод `/app/team` редиректит на `/app/plans`.
  - Прямой ввод `/app/activity` редиректит на `/app/plans`.
  - На бизнес-тарифе (можно дать через `apiController.grantDevSubscription(userId)` на staging — см. `scripts/shared/api/controller.ts:824`) пункты появляются.
  - В чипе подписки сайдбара под названием тарифа виден текст «Командная версия».
  - `/app/team` и `/app/activity` открываются и рендерят placeholder.

- [ ] **Step 2:** После «работает» от юзера — закоммитить.

```bash
git add \
  lib-modules/plans/composables/usePlans.ts \
  lib-modules/app-layout/types/index.ts \
  lib-modules/app-layout/composables/useAppLayout.ts \
  lib-modules/app-layout/components/AppSidebar.vue \
  middleware/business-plan.ts \
  pages/app/team.vue \
  pages/app/activity.vue \
  tests/is-business-plan.test.ts

git commit -m "$(cat <<'EOF'
feat(team): plan-gate flag + sidebar indicator + page shells

Phase 1 of team-version subsystem: isBusinessPlan flag in usePlans (+unit
tests), Командная-версия sub-label in sidebar subscription chip, gated
Team/Activity sidebar items, business-plan middleware, placeholder pages.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

# Phase 2 — Team management

## Task 2.1: Новые `ApiAliases`

**Files:**
- Modify: `scripts/shared/types/index.ts`

- [ ] **Step 1:** Добавить 4 новых записи в enum (после существующего блока `// Members & Invites` около строки 96).

```ts
    // Members & Invites
    workspaceMembers = 'workspaces/{workspaceId}/members',
    workspaceMember = 'workspaces/{workspaceId}/members/{userId}',
    workspaceInvites = 'workspaces/{workspaceId}/invites',
    workspaceInvite = 'workspaces/{workspaceId}/invites/{inviteId}',
    workspaceInviteRevoke = 'workspaces/{workspaceId}/invites/{inviteId}/revoke',
    // Token-based (publicly previewable; accept/decline require auth):
    workspaceInvitePreview = 'workspace-invites/{token}',
    workspaceInviteAccept = 'workspace-invites/{token}/accept',
    workspaceInviteDecline = 'workspace-invites/{token}/decline',
```

---

## Task 2.2: Новые DTO

**Files:**
- Modify: `scripts/shared/types/workspace.ts`

- [ ] **Step 1:** Добавить типы в конец файла (после `UserSummaryDto`).

```ts
// === Members & Invites & Activity Log ===

export type WorkspaceInviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface WorkspaceMemberDto {
  userId: string
  name: string
  email: string | null
  role: WorkspaceRole
  joinedAt: string
}

export interface WorkspaceInviteDto {
  id: string
  email: string
  role: WorkspaceInviteRole
  status: WorkspaceInviteStatus
  expiresAt: string
  createdAt: string
  invitedBy: UserSummaryDto | null
}

export interface WorkspaceInvitePreviewDto {
  id: string
  workspaceId: string
  workspaceName: string
  role: WorkspaceInviteRole
  status: WorkspaceInviteStatus
  expiresAt: string
  invitedBy: UserSummaryDto
}

export interface CreateWorkspaceInviteRequest {
  email: string
  role: WorkspaceInviteRole
}

export interface UpdateWorkspaceMemberRequest {
  role: WorkspaceRole
}

export interface ActivityLogItemDto {
  id: string
  userId: string | null
  actor: UserSummaryDto | null
  entityType: string
  entityId: string
  action: string
  payload: unknown | null
  createdAt: string
}
```

---

## Task 2.3: Скелет модуля `lib-modules/team` + типы

**Files:**
- Create: `lib-modules/team/types/index.ts`

- [ ] **Step 1:** Реэкспорт DTO + локальные типы.

```ts
// lib-modules/team/types/index.ts
export type {
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInvitePreviewDto,
  WorkspaceInviteStatus,
  CreateWorkspaceInviteRequest,
  UpdateWorkspaceMemberRequest,
  WorkspaceRole,
  WorkspaceInviteRole,
} from '~/scripts/shared/types/workspace'
```

---

## Task 2.4: API-контроллеры

**Files:**
- Create: `lib-modules/team/helpers/api.ts`

- [ ] **Step 1:** Написать оба контроллера + фабрики.

```ts
// lib-modules/team/helpers/api.ts
import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  PagedResponse,
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInvitePreviewDto,
  WorkspaceInviteStatus,
  CreateWorkspaceInviteRequest,
  UpdateWorkspaceMemberRequest,
  WorkspaceRole,
} from '~/scripts/shared/types/workspace'

/**
 * Members API. Composition over inheritance — см. WorkspacesApiController.
 */
export class WorkspaceMembersApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getMembers(workspaceId: string, q?: string, offset = 0, limit = 50): Promise<PagedResponse<WorkspaceMemberDto>> {
    const url = buildUrl(ApiAliases.workspaceMembers, { workspaceId })
    return this.api.request(url, RequestMethod.GET, { q, offset, limit, _t: Date.now() })
  }

  /** Silent — verify-by-refetch на caller'е. */
  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceMember, { workspaceId, userId })
    const body: UpdateWorkspaceMemberRequest = { role }
    return this.api.request(url, RequestMethod.PATCH, body, false, true)
  }

  /** Silent — verify-by-refetch на caller'е. */
  removeMember(workspaceId: string, userId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceMember, { workspaceId, userId })
    return this.api.request(url, RequestMethod.DELETE, {}, false, true)
  }
}

/**
 * Invites API — workspace-scoped + token-based (анонимный preview).
 */
export class WorkspaceInvitesApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getInvites(
    workspaceId: string,
    opts: { status?: WorkspaceInviteStatus; q?: string; offset?: number; limit?: number } = {},
  ): Promise<PagedResponse<WorkspaceInviteDto>> {
    const url = buildUrl(ApiAliases.workspaceInvites, { workspaceId })
    const { status, q, offset = 0, limit = 50 } = opts
    return this.api.request(url, RequestMethod.GET, { status, q, offset, limit, _t: Date.now() })
  }

  createInvite(
    workspaceId: string,
    payload: CreateWorkspaceInviteRequest,
  ): Promise<WorkspaceInviteDto> {
    const url = buildUrl(ApiAliases.workspaceInvites, { workspaceId })
    // Не silent: ошибки валидации/409 должны звучать через стандартный канал;
    // дублируем доменно-точный тост на caller'е (createInvite выкидывает throw'ом).
    return this.api.request(url, RequestMethod.POST, payload)
  }

  /** Silent — verify-by-refetch. */
  revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteRevoke, { workspaceId, inviteId })
    return this.api.request(url, RequestMethod.POST, {}, false, true)
  }

  // === Token-based (public preview / accept-decline) ===

  getInvitePreview(token: string): Promise<WorkspaceInvitePreviewDto> {
    const url = buildUrl(ApiAliases.workspaceInvitePreview, { token })
    return this.api.request(url, RequestMethod.GET)
  }

  acceptInvite(token: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteAccept, { token })
    return this.api.request(url, RequestMethod.POST)
  }

  declineInvite(token: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteDecline, { token })
    return this.api.request(url, RequestMethod.POST)
  }
}

let membersInstance: WorkspaceMembersApiController | null = null
let invitesInstance: WorkspaceInvitesApiController | null = null

export function useWorkspaceMembersApi(): WorkspaceMembersApiController {
  if (!membersInstance) membersInstance = new WorkspaceMembersApiController()
  return membersInstance
}

export function useWorkspaceInvitesApi(): WorkspaceInvitesApiController {
  if (!invitesInstance) invitesInstance = new WorkspaceInvitesApiController()
  return invitesInstance
}
```

---

## Task 2.5: Тосты

**Files:**
- Create: `lib-modules/team/helpers/toasts.ts`

- [ ] **Step 1:** Тонкие обёртки над `vue-sonner` (ровно как в существующем `toater.ts`, но локально для домена).

```ts
// lib-modules/team/helpers/toasts.ts
import { toast } from 'vue-sonner'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const opts = () => ({ position: getToasterPosition() } as const)

export const toastInviteSent = (email: string) =>
  toast(`Приглашение отправлено: ${email}`, { type: 'success', ...opts() })

export const toastInviteRevoked = () =>
  toast('Приглашение отозвано', { type: 'success', ...opts() })

export const toastMemberRemoved = () =>
  toast('Участник удалён', { type: 'success', ...opts() })

export const toastRoleChanged = () =>
  toast('Роль обновлена', { type: 'success', ...opts() })

export const toastOwnershipTransferred = () =>
  toast('Владение передано', { type: 'success', ...opts() })

export const toastInviteDuplicate = () =>
  toast('Этот email уже приглашён или участник', { type: 'error', ...opts() })

export const toastInviteAccepted = () =>
  toast('Приглашение принято', { type: 'success', ...opts() })

export const toastInviteDeclined = () =>
  toast('Приглашение отклонено', { ...opts() })

export const toastForbiddenLocal = () =>
  toast('Недостаточно прав', { type: 'error', ...opts() })
```

---

## Task 2.6: `useTeam` композабл

**Files:**
- Create: `lib-modules/team/composables/useTeam.ts`

- [ ] **Step 1:** Композабл-оркестратор.

```ts
// lib-modules/team/composables/useTeam.ts
import { ref, computed } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useWorkspaceMembersApi, useWorkspaceInvitesApi } from '../helpers/api'
import {
  toastInviteSent,
  toastInviteRevoked,
  toastMemberRemoved,
  toastRoleChanged,
  toastOwnershipTransferred,
  toastInviteDuplicate,
  toastForbiddenLocal,
} from '../helpers/toasts'
import type {
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInviteRole,
  WorkspaceRole,
} from '../types'

export function useTeam() {
  const ctx = useWorkspaceContext()
  const membersApi = useWorkspaceMembersApi()
  const invitesApi = useWorkspaceInvitesApi()

  const members = ref<WorkspaceMemberDto[]>([])
  const invites = ref<WorkspaceInviteDto[]>([])
  const loading = ref(false)

  const currentRole = computed<WorkspaceRole | null>(
    () => ctx.currentWorkspace.value?.role ?? null,
  )
  const canManageMembers = computed(() => currentRole.value === 'owner')
  const canManageInvites = computed(
    () => currentRole.value === 'owner' || currentRole.value === 'admin',
  )

  async function loadAll() {
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      members.value = []
      invites.value = []
      return
    }

    loading.value = true
    try {
      const [m, i] = await Promise.all([
        membersApi.getMembers(workspaceId),
        invitesApi.getInvites(workspaceId, { status: 'pending' }),
      ])
      members.value = m.items ?? []
      invites.value = i.items ?? []
    } finally {
      loading.value = false
    }
  }

  async function inviteMember(email: string, role: WorkspaceInviteRole): Promise<boolean> {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await invitesApi.createInvite(workspaceId, { email, role })
      toastInviteSent(email)
      await refetchInvites(workspaceId)
      return true
    } catch (e: any) {
      if (e?.status === 409 || e?.statusCode === 409) {
        toastInviteDuplicate()
      }
      // 400 / 401 / 5xx тосты делает controller-уровень (не silent).
      return false
    }
  }

  async function revokeInvite(inviteId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await invitesApi.revokeInvite(workspaceId, inviteId)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = invites.value.find(i => i.id === inviteId)
      await refetchInvites(workspaceId)
      const after = invites.value.find(i => i.id === inviteId)
      if (before && !after) toastInviteRevoked()
    }
  }

  async function updateMemberRole(userId: string, role: WorkspaceRole) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.updateMemberRole(workspaceId, userId, role)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = members.value.find(m => m.userId === userId)?.role
      await refetchMembers(workspaceId)
      const after = members.value.find(m => m.userId === userId)?.role
      if (before !== after && after === role) toastRoleChanged()
    }
  }

  async function removeMember(userId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.removeMember(workspaceId, userId)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = members.value.find(m => m.userId === userId)
      await refetchMembers(workspaceId)
      const after = members.value.find(m => m.userId === userId)
      if (before && !after) toastMemberRemoved()
    }
  }

  async function transferOwnership(userId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.updateMemberRole(workspaceId, userId, 'owner')
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      await refetchMembers(workspaceId)
      const newOwner = members.value.find(m => m.userId === userId)
      if (newOwner?.role === 'owner') toastOwnershipTransferred()
    }
  }

  async function refetchMembers(workspaceId: string) {
    const r = await membersApi.getMembers(workspaceId)
    members.value = r.items ?? []
  }

  async function refetchInvites(workspaceId: string) {
    const r = await invitesApi.getInvites(workspaceId, { status: 'pending' })
    invites.value = r.items ?? []
  }

  return {
    members,
    invites,
    loading,
    currentRole,
    canManageMembers,
    canManageInvites,
    loadAll,
    inviteMember,
    revokeInvite,
    updateMemberRole,
    removeMember,
    transferOwnership,
  }
}
```

---

## Task 2.7: `MembersSection.vue`

**Files:**
- Create: `lib-modules/team/components/sections/MembersSection.vue`

- [ ] **Step 1:** Список + dropdown actions.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, ChevronDown, UserCog, ArrowRightLeft } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { useSettings } from '~/composables/settings'
import type { WorkspaceMemberDto, WorkspaceRole } from '../../types'
import TransferOwnershipDialog from '../dialogs/TransferOwnershipDialog.vue'

const props = defineProps<{
  members: WorkspaceMemberDto[]
  canManageMembers: boolean
}>()

const emit = defineEmits<{
  (e: 'updateRole', userId: string, role: WorkspaceRole): void
  (e: 'remove', userId: string): void
  (e: 'transfer', userId: string): void
}>()

const $settings = useSettings()
const meId = $settings.getUser()?.id ?? null  // composables/user.ts не отдаёт userId-геттера; берём из settings

const removeOpen = ref(false)
const removeTarget = ref<WorkspaceMemberDto | null>(null)
function askRemove(m: WorkspaceMemberDto) {
  removeTarget.value = m
  removeOpen.value = true
}
function confirmRemove() {
  if (removeTarget.value) emit('remove', removeTarget.value.userId)
  removeOpen.value = false
  removeTarget.value = null
}

const transferOpen = ref(false)
const transferTarget = ref<WorkspaceMemberDto | null>(null)
function askTransfer(m: WorkspaceMemberDto) {
  transferTarget.value = m
  transferOpen.value = true
}
function confirmTransfer() {
  if (transferTarget.value) emit('transfer', transferTarget.value.userId)
  transferOpen.value = false
  transferTarget.value = null
}

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Зритель',
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-medium text-muted-foreground">Участники</h2>
    <div class="rounded-md border bg-card divide-y">
      <div
        v-for="m in members"
        :key="m.userId"
        class="flex items-center gap-3 px-4 py-3"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {{ initials(m.name) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium truncate">{{ m.name }}</div>
          <div class="text-xs text-muted-foreground truncate">{{ m.email ?? '—' }}</div>
        </div>
        <span
          class="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground whitespace-nowrap"
        >
          {{ ROLE_LABEL[m.role] }}
        </span>

        <DropdownMenu
          v-if="canManageMembers && m.userId !== meId && m.role !== 'owner'"
        >
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <ChevronDown class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserCog class="mr-2 h-4 w-4" />
                <span>Сменить роль</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  v-for="r in (['admin', 'editor', 'viewer'] as WorkspaceRole[])"
                  :key="r"
                  :disabled="r === m.role"
                  @select="emit('updateRole', m.userId, r)"
                >
                  {{ ROLE_LABEL[r] }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem @select="askTransfer(m)">
              <ArrowRightLeft class="mr-2 h-4 w-4" />
              Передать владение…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @select="askRemove(m)">
              <Trash2 class="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <AlertDialog v-model:open="removeOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
          <AlertDialogDescription>
            «{{ removeTarget?.name }}» потеряет доступ к воркспейсу.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground" @click="confirmRemove">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <TransferOwnershipDialog
      v-model:open="transferOpen"
      :target="transferTarget"
      @confirm="confirmTransfer"
    />
  </section>
</template>
```

> Note: `meId` достаётся из `useSettings().getUser()?.id` — в `composables/user.ts` нет userId-геттера. Используется только чтобы не показывать dropdown action'ов на самом себе.

---

## Task 2.8: `InvitesSection.vue`

**Files:**
- Create: `lib-modules/team/components/sections/InvitesSection.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import type { WorkspaceInviteDto, WorkspaceInviteRole } from '../../types'

const props = defineProps<{
  invites: WorkspaceInviteDto[]
  canManageInvites: boolean
}>()

const emit = defineEmits<{
  (e: 'revoke', inviteId: string): void
}>()

const revokeOpen = ref(false)
const revokeTarget = ref<WorkspaceInviteDto | null>(null)
function askRevoke(i: WorkspaceInviteDto) {
  revokeTarget.value = i
  revokeOpen.value = true
}
function confirmRevoke() {
  if (revokeTarget.value) emit('revoke', revokeTarget.value.id)
  revokeOpen.value = false
  revokeTarget.value = null
}

const ROLE_LABEL: Record<WorkspaceInviteRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Зритель',
}

function expiresIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'истёк'
  const days = Math.ceil(ms / 86400000)
  return `истекает через ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`
}
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-medium text-muted-foreground">Приглашения</h2>
    <div v-if="!invites.length" class="rounded-md border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
      Активных приглашений нет
    </div>
    <div v-else class="rounded-md border bg-card divide-y">
      <div v-for="i in invites" :key="i.id" class="flex items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium truncate">{{ i.email }}</div>
          <div class="text-xs text-muted-foreground">{{ expiresIn(i.expiresAt) }}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground whitespace-nowrap">
          {{ ROLE_LABEL[i.role] }}
        </span>
        <Button
          v-if="canManageInvites"
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click="askRevoke(i)"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <AlertDialog v-model:open="revokeOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отозвать приглашение?</AlertDialogTitle>
          <AlertDialogDescription>
            «{{ revokeTarget?.email }}» больше не сможет принять это приглашение.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground" @click="confirmRevoke">
            Отозвать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
```

---

## Task 2.9: `InviteMemberDialog.vue`

**Files:**
- Create: `lib-modules/team/components/dialogs/InviteMemberDialog.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import type { WorkspaceInviteRole } from '../../types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'submit', payload: { email: string; role: WorkspaceInviteRole }): Promise<boolean> | boolean
}>()

const email = ref('')
const role = ref<WorkspaceInviteRole>('editor')
const submitting = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  v => {
    if (v) {
      email.value = ''
      role.value = 'editor'
      errorMsg.value = ''
    }
  },
)

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

async function onSubmit() {
  errorMsg.value = ''
  if (!isEmail(email.value)) {
    errorMsg.value = 'Некорректный email'
    return
  }
  submitting.value = true
  emit('submit', { email: email.value, role: role.value })
  submitting.value = false
  // Закрытие диалога — задача родителя: TeamPage сам закрывает через v-model:open
  // когда useTeam.inviteMember вернул true.
}
</script>

<template>
  <Dialog :open="open" @update:open="v => emit('update:open', v)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Пригласить участника</DialogTitle>
        <DialogDescription>
          Отправим письмо со ссылкой-приглашением. Срок действия — 14 дней.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="invite-email">Email</Label>
          <Input
            id="invite-email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            autocomplete="off"
          />
          <p v-if="errorMsg" class="text-xs text-destructive">{{ errorMsg }}</p>
        </div>
        <div class="space-y-2">
          <Label>Роль</Label>
          <Select v-model="role">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="editor">Редактор</SelectItem>
              <SelectItem value="viewer">Зритель</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Отмена</Button>
        <Button :disabled="submitting" @click="onSubmit">Отправить</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

---

## Task 2.10: `TransferOwnershipDialog.vue`

**Files:**
- Create: `lib-modules/team/components/dialogs/TransferOwnershipDialog.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import type { WorkspaceMemberDto } from '../../types'

const props = defineProps<{ open: boolean; target: WorkspaceMemberDto | null }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
}>()

const typed = ref('')

watch(
  () => props.open,
  v => {
    if (v) typed.value = ''
  },
)

const matches = computed(
  () => !!props.target?.email && typed.value.trim().toLowerCase() === props.target.email.toLowerCase(),
)
</script>

<template>
  <AlertDialog :open="open" @update:open="v => emit('update:open', v)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Передать владение?</AlertDialogTitle>
        <AlertDialogDescription>
          «{{ target?.name }}» станет владельцем воркспейса. Вы потеряете права владельца —
          вероятнее всего, останетесь администратором (точное поведение определяется бэком).
          Действие необратимо без обратной передачи нового владельца.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="space-y-2">
        <Label for="confirm-email">Введите email нового владельца, чтобы подтвердить</Label>
        <Input
          id="confirm-email"
          v-model="typed"
          type="email"
          :placeholder="target?.email ?? ''"
          autocomplete="off"
        />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction
          :disabled="!matches"
          class="bg-destructive text-destructive-foreground disabled:opacity-50"
          @click="emit('confirm')"
        >
          Передать владение
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

---

## Task 2.11: `TeamPage.vue`

**Files:**
- Create: `lib-modules/team/components/TeamPage.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import MembersSection from './sections/MembersSection.vue'
import InvitesSection from './sections/InvitesSection.vue'
import InviteMemberDialog from './dialogs/InviteMemberDialog.vue'
import { useTeam } from '../composables/useTeam'

const ctx = useWorkspaceContext()
const team = useTeam()

const inviteOpen = ref(false)

const workspaceMissing = computed(() => !ctx.currentWorkspaceId.value)
const workspaceName = computed(() => ctx.currentWorkspace.value?.name ?? '')

onMounted(() => {
  if (!workspaceMissing.value) team.loadAll()
})

async function onInvite(payload: { email: string; role: 'admin' | 'editor' | 'viewer' }) {
  const ok = await team.inviteMember(payload.email, payload.role)
  if (ok) inviteOpen.value = false
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">{{ workspaceName }} · Команда</h1>
      </div>
      <Button v-if="!workspaceMissing && team.canManageInvites.value" @click="inviteOpen = true">
        <Plus class="h-4 w-4 mr-2" /> Пригласить
      </Button>
    </header>

    <div v-if="workspaceMissing" class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
      Выберите воркспейс
      <NuxtLink to="/app/workspaces" class="ml-2 text-primary underline">
        Перейти к списку
      </NuxtLink>
    </div>

    <template v-else>
      <MembersSection
        :members="team.members.value"
        :can-manage-members="team.canManageMembers.value"
        @update-role="(uid, r) => team.updateMemberRole(uid, r)"
        @remove="uid => team.removeMember(uid)"
        @transfer="uid => team.transferOwnership(uid)"
      />
      <InvitesSection
        v-if="team.invites.value.length || team.canManageInvites.value"
        :invites="team.invites.value"
        :can-manage-invites="team.canManageInvites.value"
        @revoke="id => team.revokeInvite(id)"
      />
    </template>

    <InviteMemberDialog v-model:open="inviteOpen" @submit="onInvite" />
  </div>
</template>
```

> ⚠️ `team.members.value` — обращение к `.value` нужно потому, что мы возвращаем `ref` напрямую из `useTeam()`. Если хочешь, передавай в секции через computed-свойства; здесь упрощено.

---

## Task 2.12: `lib-modules/team/index.ts` + page wiring

**Files:**
- Create: `lib-modules/team/index.ts`
- Modify: `pages/app/team.vue`

- [ ] **Step 1:** Public API.

```ts
// lib-modules/team/index.ts
export { default as TeamPage } from './components/TeamPage.vue'
export { default as InviteAcceptPage } from './components/InviteAcceptPage.vue'
export { useTeam } from './composables/useTeam'
export { useWorkspaceMembersApi, useWorkspaceInvitesApi } from './helpers/api'
export * from './types'
```

- [ ] **Step 2:** Поправить `pages/app/team.vue`.

```vue
<script setup lang="ts">
import { TeamPage } from '~/lib-modules/team'
definePageMeta({ layout: 'app', middleware: 'business-plan' })
</script>

<template><TeamPage /></template>
```

---

## Task 2.13: `InviteAcceptPage.vue`

**Files:**
- Create: `lib-modules/team/components/InviteAcceptPage.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useUserController } from '~/composables/user'
import { useWorkspaceInvitesApi } from '../helpers/api'
import { toastInviteAccepted, toastInviteDeclined } from '../helpers/toasts'
import type { WorkspaceInvitePreviewDto, WorkspaceInviteRole, WorkspaceInviteStatus } from '../types'

const props = defineProps<{ token: string }>()

const router = useRouter()
const userController = useUserController()
const api = useWorkspaceInvitesApi()

const loading = ref(true)
const error = ref(false)
const preview = ref<WorkspaceInvitePreviewDto | null>(null)
const acting = ref(false)

const ROLE_LABEL: Record<WorkspaceInviteRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Зритель',
}

const STATUS_TEXT: Record<WorkspaceInviteStatus, string> = {
  pending: '',
  accepted: 'Вы уже приняли это приглашение.',
  expired: 'Срок действия приглашения истёк.',
  revoked: 'Приглашение было отозвано.',
}

onMounted(async () => {
  try {
    preview.value = await api.getInvitePreview(props.token)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

function returnUrl() {
  return `/invite/${encodeURIComponent(props.token)}`
}

async function onAccept() {
  if (!userController.isAuthenticated()) {
    router.push(`/auth?return=${encodeURIComponent(returnUrl())}`)
    return
  }
  acting.value = true
  try {
    await api.acceptInvite(props.token)
    toastInviteAccepted()
    router.push('/app/workspaces')
  } finally {
    acting.value = false
  }
}

async function onDecline() {
  if (!userController.isAuthenticated()) {
    router.push(`/auth?return=${encodeURIComponent(returnUrl())}`)
    return
  }
  acting.value = true
  try {
    await api.declineInvite(props.token)
    toastInviteDeclined()
    router.push('/')
  } finally {
    acting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <template v-if="loading">
        <CardContent class="py-12 text-center text-muted-foreground">Загрузка…</CardContent>
      </template>

      <template v-else-if="error || !preview">
        <CardHeader>
          <CardTitle>Приглашение не найдено</CardTitle>
          <CardDescription>Ссылка устарела или повреждена.</CardDescription>
        </CardHeader>
        <CardFooter><Button as-child variant="outline"><NuxtLink to="/">На главную</NuxtLink></Button></CardFooter>
      </template>

      <template v-else-if="preview.status !== 'pending'">
        <CardHeader>
          <CardTitle>{{ preview.workspaceName }}</CardTitle>
          <CardDescription>{{ STATUS_TEXT[preview.status] }}</CardDescription>
        </CardHeader>
        <CardFooter><Button as-child variant="outline"><NuxtLink to="/app">В приложение</NuxtLink></Button></CardFooter>
      </template>

      <template v-else>
        <CardHeader>
          <CardTitle>Приглашение в «{{ preview.workspaceName }}»</CardTitle>
          <CardDescription>
            {{ preview.invitedBy.name }} приглашает вас как
            <strong>{{ ROLE_LABEL[preview.role] }}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-xs text-muted-foreground">
          Срок действия: {{ new Date(preview.expiresAt).toLocaleDateString() }}
        </CardContent>
        <CardFooter class="flex gap-2 justify-end">
          <Button variant="outline" :disabled="acting" @click="onDecline">Отклонить</Button>
          <Button :disabled="acting" @click="onAccept">Принять</Button>
        </CardFooter>
      </template>
    </Card>
  </div>
</template>
```

---

## Task 2.14: `pages/invite/[token].vue`

**Files:**
- Create: `pages/invite/[token].vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { InviteAcceptPage } from '~/lib-modules/team'

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))

definePageMeta({
  // No 'app' layout — public page accessible без логина.
})
</script>

<template>
  <InviteAcceptPage :token="token" />
</template>
```

---

## Task 2.15: Verification gate Phase 2 + commit

- [ ] **Step 1:** Manual browser checks (на бизнес-тарифе со staging-бэком):

  - В пустом ws (только owner): хедер видно, owner-row видна без dropdown'а на самого себя, секция Invites показывает «Активных приглашений нет», кнопка «Пригласить» видна.
  - Пригласить test-email → строка появляется в Pending; toast «Приглашение отправлено».
  - Отозвать → строка исчезает; toast «Приглашение отозвано».
  - На свежем юзере открыть `/invite/{token}` в incognito (без логина) — preview рендерится: name + invitedBy + ROLE.
  - Клик «Принять» без логина → редирект на `/auth?return=/invite/...`. Логиниться → возврат на ту же страницу → клик «Принять» снова → попадаем в `/app/workspaces`, новый ws виден в списке.
  - С двумя залогиненными юзерами в одном ws: owner делает «Сменить роль editor → admin» — dropdown в строке участника отражает новое значение после refetch.
  - Owner удаляет участника: AlertDialog → подтвердить → строка исчезает; toast.
  - Owner делает «Передать владение» → подтвердить вводом email → роли меняются (owner / target ↔). Точное состояние моей роли проверить — допустимо `admin`.
  - Editor открывает `/app/team`: списки видны, кнопок нет.
  - 403 на mutation (admin пробует remove member) → toast «Недостаточно прав» + refetch выправляет UI.
  - Workspace не выбран → empty state «Выберите воркспейс».

- [ ] **Step 2:** После «работает» — закоммитить.

```bash
git add \
  scripts/shared/types/index.ts \
  scripts/shared/types/workspace.ts \
  lib-modules/team/ \
  pages/app/team.vue \
  pages/invite/

git commit -m "$(cat <<'EOF'
feat(team): members + invites management page and public invite page

Phase 2 of team-version subsystem: lib-modules/team module with two API
controllers (members, invites), useTeam composable orchestrating refetch-after-
mutation flow, /app/team page (members list + pending invites + invite/transfer
ownership/remove flows), public /invite/[token] preview + accept/decline page.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

# Phase 3 — Activity Log

## Task 3.1: `mapAction` formatter + unit-тесты

**Files:**
- Create: `lib-modules/activity-log/types/index.ts`
- Create: `lib-modules/activity-log/helpers/formatting.ts`
- Create: `tests/map-action.test.ts`

- [ ] **Step 1:** Типы.

```ts
// lib-modules/activity-log/types/index.ts
export type { ActivityLogItemDto, UserSummaryDto } from '~/scripts/shared/types/workspace'

export interface ActivityLogFilters {
  userId?: string
  entityType?: string
  action?: string
  from?: string
  to?: string
}

export interface DayGroup<T> {
  key: string  // YYYY-MM-DD
  label: string  // "Сегодня" / "Вчера" / "27 апреля 2026"
  items: T[]
}
```

- [ ] **Step 2:** Тест.

```ts
// tests/map-action.test.ts
import { describe, it, expect } from 'vitest'
import { mapAction } from '~/lib-modules/activity-log/helpers/formatting'
import type { ActivityLogItemDto } from '~/lib-modules/activity-log/types'

function item(action: string): ActivityLogItemDto {
  return {
    id: 'x', userId: null, actor: null,
    entityType: 'post', entityId: 'p',
    action, payload: null, createdAt: '2026-04-27T00:00:00Z',
  }
}

describe('mapAction', () => {
  it('falls back to raw action code when no mapping exists', () => {
    expect(mapAction(item('unknown.event'))).toBe('unknown.event')
  })
})
```

- [ ] **Step 3:** Запустить — фейлится из-за отсутствия экспорта.

```bash
yarn test:run tests/map-action.test.ts
```

- [ ] **Step 4:** Реализация.

```ts
// lib-modules/activity-log/helpers/formatting.ts
import type { ActivityLogItemDto } from '../types'
import type { DayGroup } from '../types'

const ACTION_TEXTS: Record<string, (item: ActivityLogItemDto) => string> = {
  // Реальные коды наполним по мере появления событий из бэка.
  // Пока всё уходит в fallback на сырой `item.action`.
}

export function mapAction(item: ActivityLogItemDto): string {
  return ACTION_TEXTS[item.action]?.(item) ?? item.action
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)  // YYYY-MM-DD
}

export function groupByDay<T extends { createdAt: string }>(items: T[]): DayGroup<T>[] {
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString())

  const buckets = new Map<string, T[]>()
  for (const it of items) {
    const k = dayKey(it.createdAt)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(it)
  }

  const labelFor = (k: string) => {
    if (k === today) return 'Сегодня'
    if (k === yesterday) return 'Вчера'
    return new Date(k).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: labelFor(key), items }))
}
```

- [ ] **Step 5:** Запустить — зелёный.

```bash
yarn test:run tests/map-action.test.ts
```

---

## Task 3.2: API-контроллер + фабрика

**Files:**
- Create: `lib-modules/activity-log/helpers/api.ts`

- [ ] **Step 1:**

```ts
// lib-modules/activity-log/helpers/api.ts
import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type { PagedResponse, ActivityLogItemDto } from '~/scripts/shared/types/workspace'

export interface GetLogQuery {
  userId?: string
  entityType?: string
  action?: string
  from?: string
  to?: string
  offset?: number
  limit?: number
}

export class WorkspaceActivityLogApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getLog(workspaceId: string, opts: GetLogQuery = {}): Promise<PagedResponse<ActivityLogItemDto>> {
    const url = buildUrl(ApiAliases.workspaceActivityLog, { workspaceId })
    const { offset = 0, limit = 50, ...rest } = opts
    return this.api.request(url, RequestMethod.GET, { ...rest, offset, limit, _t: Date.now() })
  }
}

let instance: WorkspaceActivityLogApiController | null = null
export function useWorkspaceActivityLogApi(): WorkspaceActivityLogApiController {
  if (!instance) instance = new WorkspaceActivityLogApiController()
  return instance
}
```

---

## Task 3.3: `useActivityLog` композабл

**Files:**
- Create: `lib-modules/activity-log/composables/useActivityLog.ts`

- [ ] **Step 1:**

```ts
// lib-modules/activity-log/composables/useActivityLog.ts
import { ref, computed } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useWorkspaceActivityLogApi } from '../helpers/api'
import type { ActivityLogItemDto } from '~/scripts/shared/types/workspace'
import type { ActivityLogFilters } from '../types'

const PAGE_SIZE = 50

export function useActivityLog() {
  const ctx = useWorkspaceContext()
  const api = useWorkspaceActivityLogApi()

  const items = ref<ActivityLogItemDto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const filters = ref<ActivityLogFilters>({})
  const forbidden = ref(false)

  const hasMore = computed(() => items.value.length < total.value)

  async function loadInitial() {
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      items.value = []
      total.value = 0
      return
    }
    loading.value = true
    forbidden.value = false
    try {
      const r = await api.getLog(workspaceId, { ...filters.value, offset: 0, limit: PAGE_SIZE })
      items.value = r.items ?? []
      total.value = r.total ?? items.value.length
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) {
        forbidden.value = true
        items.value = []
        total.value = 0
      } else {
        throw e
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      return
    }
    loading.value = true
    try {
      const r = await api.getLog(workspaceId, {
        ...filters.value,
        offset: items.value.length,
        limit: PAGE_SIZE,
      })
      items.value.push(...(r.items ?? []))
      total.value = r.total ?? items.value.length
    } finally {
      loading.value = false
    }
  }

  async function setFilters(next: Partial<ActivityLogFilters>) {
    filters.value = { ...filters.value, ...next }
    await loadInitial()
  }

  async function resetFilters() {
    filters.value = {}
    await loadInitial()
  }

  return {
    items,
    loading,
    hasMore,
    filters,
    forbidden,
    loadInitial,
    loadMore,
    setFilters,
    resetFilters,
  }
}
```

---

## Task 3.4: `ActivityLogFilters.vue`

**Files:**
- Create: `lib-modules/activity-log/components/ActivityLogFilters.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useWorkspaceMembersApi } from '~/lib-modules/team'
import type { WorkspaceMemberDto } from '~/lib-modules/team'
import type { ActivityLogFilters } from '../types'

const props = defineProps<{ filters: ActivityLogFilters }>()
const emit = defineEmits<{
  (e: 'change', f: Partial<ActivityLogFilters>): void
  (e: 'reset'): void
}>()

const ctx = useWorkspaceContext()
const membersApi = useWorkspaceMembersApi()
const members = ref<WorkspaceMemberDto[]>([])

watchEffect(async () => {
  if (!ctx.currentWorkspaceId.value) return
  try {
    const r = await membersApi.getMembers(ctx.requireWorkspaceId())
    members.value = r.items ?? []
  } catch {
    members.value = []
  }
})

const isActive = computed(() =>
  Boolean(props.filters.userId || props.filters.from || props.filters.to),
)

function onUser(v: string) {
  emit('change', { userId: v === '__all__' ? undefined : v })
}
function onFrom(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('change', { from: v ? new Date(v).toISOString() : undefined })
}
function onTo(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('change', { to: v ? new Date(`${v}T23:59:59Z`).toISOString() : undefined })
}
</script>

<template>
  <div class="flex items-end gap-3 flex-wrap">
    <div class="space-y-1 min-w-[200px]">
      <Label class="text-xs">Участник</Label>
      <Select :model-value="filters.userId ?? '__all__'" @update:model-value="onUser">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все</SelectItem>
          <SelectItem v-for="m in members" :key="m.userId" :value="m.userId">
            {{ m.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="space-y-1">
      <Label for="al-from" class="text-xs">С</Label>
      <Input id="al-from" type="date" :value="filters.from?.slice(0, 10) ?? ''" @input="onFrom" />
    </div>
    <div class="space-y-1">
      <Label for="al-to" class="text-xs">По</Label>
      <Input id="al-to" type="date" :value="filters.to?.slice(0, 10) ?? ''" @input="onTo" />
    </div>
    <Button v-if="isActive" variant="ghost" size="sm" @click="emit('reset')">
      Сбросить
    </Button>
  </div>
</template>
```

---

## Task 3.5: `ActivityLogItem.vue`

**Files:**
- Create: `lib-modules/activity-log/components/ActivityLogItem.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityLogItemDto } from '../types'
import { mapAction } from '../helpers/formatting'

const props = defineProps<{ item: ActivityLogItemDto }>()

const actorName = computed(() => props.item.actor?.name ?? 'Система')

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-3">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
      {{ initials(actorName) }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="text-sm">
        <span class="font-medium">{{ actorName }}</span>
        <span class="text-muted-foreground"> · {{ mapAction(item) }}</span>
      </div>
      <div class="text-xs text-muted-foreground">
        {{ item.entityType }} · {{ timeOf(item.createdAt) }}
      </div>
    </div>
  </div>
</template>
```

---

## Task 3.6: `ActivityLogPage.vue` + infinite scroll

**Files:**
- Create: `lib-modules/activity-log/components/ActivityLogPage.vue`

- [ ] **Step 1:**

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import ActivityLogFilters from './ActivityLogFilters.vue'
import ActivityLogItem from './ActivityLogItem.vue'
import { useActivityLog } from '../composables/useActivityLog'
import { groupByDay } from '../helpers/formatting'

const ctx = useWorkspaceContext()
const log = useActivityLog()

const workspaceMissing = computed(() => !ctx.currentWorkspaceId.value)
const workspaceName = computed(() => ctx.currentWorkspace.value?.name ?? '')

const groups = computed(() => groupByDay(log.items.value))

onMounted(() => {
  if (!workspaceMissing.value) log.loadInitial()
})

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) log.loadMore()
  })
  observer.observe(sentinelRef.value)
}

watch(sentinelRef, setupObserver)
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <header>
      <h1 class="text-xl font-semibold">{{ workspaceName }} · Журнал</h1>
    </header>

    <div v-if="workspaceMissing" class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
      Выберите воркспейс
      <NuxtLink to="/app/workspaces" class="ml-2 text-primary underline">
        Перейти к списку
      </NuxtLink>
    </div>

    <template v-else>
      <ActivityLogFilters
        :filters="log.filters.value"
        @change="f => log.setFilters(f)"
        @reset="log.resetFilters"
      />

      <div v-if="log.forbidden.value" class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
        Журнал доступен только владельцу или администратору воркспейса.
      </div>

      <div v-else-if="!log.items.value.length && !log.loading.value" class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
        Записей нет
      </div>

      <div v-else class="space-y-4">
        <section v-for="g in groups" :key="g.key" class="space-y-1">
          <h2 class="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
            {{ g.label }}
          </h2>
          <div class="rounded-md border bg-card divide-y">
            <ActivityLogItem v-for="i in g.items" :key="i.id" :item="i" />
          </div>
        </section>
        <div ref="sentinelRef" class="h-8" />
        <div v-if="log.loading.value" class="text-center text-xs text-muted-foreground">Загрузка…</div>
      </div>
    </template>
  </div>
</template>
```

---

## Task 3.7: `lib-modules/activity-log/index.ts` + page wiring

**Files:**
- Create: `lib-modules/activity-log/index.ts`
- Modify: `pages/app/activity.vue`

- [ ] **Step 1:** Public API.

```ts
// lib-modules/activity-log/index.ts
export { default as ActivityLogPage } from './components/ActivityLogPage.vue'
export { useActivityLog } from './composables/useActivityLog'
export { useWorkspaceActivityLogApi } from './helpers/api'
export * from './types'
```

- [ ] **Step 2:** Поправить `pages/app/activity.vue`.

```vue
<script setup lang="ts">
import { ActivityLogPage } from '~/lib-modules/activity-log'
definePageMeta({ layout: 'app', middleware: 'business-plan' })
</script>

<template><ActivityLogPage /></template>
```

---

## Task 3.8: Verification gate Phase 3 + commit

- [ ] **Step 1:** Manual browser checks (на бизнес-тарифе, желательно с ws, где есть события):

  - `/app/activity` открывается, рисуется первая страница записей, сгруппированная по дням («Сегодня», «Вчера», даты).
  - Фильтр по участнику → список сужается до записей выбранного.
  - Date range from/to → ограничение работает (записей вне диапазона нет).
  - Reset → возвращает изначальный список.
  - Скролл до низа → подгружается следующая пачка (увидеть 51-ю+ запись).
  - Editor / viewer открывает → видит «Журнал доступен только владельцу или администратору воркспейса».
  - Workspace не выбран → empty state «Выберите воркспейс».
  - Action-коды без маппинга показываются как `entityType.action` (raw fallback) — страница не падает.

- [ ] **Step 2:** После «работает» — закоммитить.

```bash
git add \
  lib-modules/activity-log/ \
  pages/app/activity.vue \
  tests/map-action.test.ts

git commit -m "$(cat <<'EOF'
feat(activity-log): workspace activity log page with user + date filters

Phase 3 of team-version subsystem: lib-modules/activity-log module with
WorkspaceActivityLogApiController, useActivityLog composable (initial load /
infinite scroll / filter management), /app/activity page with day-grouped
list, user select + date range filters. mapAction formatter falls back to
raw action code so unknown event types don't break the UI.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

# Self-review notes

Прошёл план по чеклисту:

- **Spec coverage:** Phase 1 / Phase 2 / Phase 3 покрывают все секции спека (`isBusinessPlan` flag → 1.1, sidebar indicator → 1.3, sidebar items → 1.2, route guard → 1.4, `/app/team` page → 2.11, MembersSection → 2.7, InvitesSection → 2.8, InviteMemberDialog → 2.9, TransferOwnershipDialog → 2.10, public `/invite/[token]` → 2.13/2.14, ActivityLog page → 3.6, filters → 3.4, mapAction fallback → 3.1, verification gates на каждой фазе).
- **Placeholder scan:** Нет `TBD`/`TODO`/«implement later». Все шаги содержат код или конкретные команды. Один внутренний caveat в Task 2.7 (геттер `getUserId`) помечен явно с инструкцией проверить и заменить — это не placeholder, а конкретный fallback на случай несоответствия API.
- **Type consistency:** `WorkspaceMemberDto`, `WorkspaceInviteDto` etc. определены в Task 2.2 и используются согласованно в 2.3-2.13. `ActivityLogItemDto` — в 2.2, используется в 3.x. `ActivityLogFilters` — определён в 3.1, потребляется в 3.3 / 3.4 / 3.6.
- **Cross-fragment naming:** `useTeam`, `useTeamApi*` (Members + Invites), `useActivityLog`, `useWorkspaceActivityLogApi` — единообразно.
- **Memory compliance:** коммиты только после verification gate (а не per-task) — соответствует `feedback_dont_auto_commit`. Cache-bust на GET'ах — `feedback_polling_needs_cache_bust`. `silent: true` + verify-by-refetch — `feedback_verify_by_refetch_for_flaky_mutations`. AlertDialog c двумя ref'ами — `feedback_alert_dialog_two_refs`. Каждая фаза = одна страница/один verification cycle — `feedback_phase_size_minimum`.
- **YAGNI:** Без entityType/action фильтров (не знаем значений), без bulk-операций, без real-time push, без локализации UI вне существующего паттерна.

Один потенциальный risk-spot, который Task должен явно проверить в браузере:
- В Task 2.7 (`MembersSection.vue`) использовано `userController.getUserId()` — если такого геттера нет, fallback: достать `useSettings().getUser()?.id`. На исполнении просто проверь и адаптируй; код заведомо не сломается тихо, тип-чекер заметит.
