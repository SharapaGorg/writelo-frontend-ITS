# Командная версия (Business plan + Members/Invites + Activity Log) — design

**Дата:** 2026-04-27
**Модули:** `lib-modules/plans` (расширение), `lib-modules/team` (новый), `lib-modules/activity-log` (новый), `lib-modules/app-layout` (правка сайдбара)
**Спека API:** `docs/v1-26.04.json` (теги `Members`, `Invites`, `Activity Log`)

## Контекст

В `v1-26.04.json` уже есть полный набор «командных» эндпоинтов:

- **Members** — `GET /workspaces/{id}/members`, `PATCH/DELETE /workspaces/{id}/members/{userId}`.
- **Invites** — `GET/POST /workspaces/{id}/invites`, `POST /workspaces/{id}/invites/{inviteId}/revoke`, `GET /workspace-invites/{token}` (анонимный preview), `POST /workspace-invites/{token}/{accept|decline}`.
- **Activity Log** — `GET /workspaces/{id}/activity-log` с фильтрами `userId`, `entityType`, `action`, `from`, `to`.

`WorkspaceRole = owner | admin | editor | viewer`. `WorkspaceInviteRole = admin | editor | viewer` (через инвайт `owner`-а не выдать; передача владения — через `PATCH /members/{userId}` с `role: 'owner'`).

**Плановой фичи в спеке нет.** «Командность» гейтится только ролью внутри воркспейса. На фронте признак «у меня командный тариф» определяется по названию текущей подписки пользователя — substring-паттерны в `SubscriptionDto.title`.

В UI ничего из этого пока нет.

## Решения

| Вопрос | Решение |
|---|---|
| Источник «командного режима» | Тариф пользователя (`UserDto.subscriptionId` → `SubscriptionDto.title`). Per-workspace тарифа в API нет. |
| Паттерны названий | Case-insensitive **substring** в `title.toLowerCase()`: `business`, `team`, `команд`, `аген`. `аген` покрывает «Агентство»/«Агенство» (типичная опечатка)/«Агентский»; `команд` — «Команда»/«Командный». |
| Где живёт флаг | Новый `computed isBusinessPlan` внутри существующего `usePlans()` (`lib-modules/plans/composables/usePlans.ts`). Никаких новых модулей/файлов на этом шаге. |
| Гейт UI «команды» | По тарифу пользователя. `isBusinessPlan === false` → пунктов в сайдбаре нет, прямой URL редиректит на `/app/plans`. Кейс «invited viewer на free» — known limitation, отдельной задачей. |
| Индикатор | В существующем чипе подписки в сайдбаре (`AppSidebar.vue:149-181`) — вторая строка `text-[11px] text-muted-foreground` с надписью «Командная версия» при `isBusinessPlan === true` (симметрично «Открыть тарифы →» для бесплатного). |
| Навигация | Топ-левел страницы `/app/team` и `/app/activity` — параллельно `calendar`/`plans`. Воркспейс берётся из `useWorkspaceContext()`, id не в URL. Публичный `/invite/[token]` — вне `/app/`. |
| Сайдбар-пункты | «Команда» (icon `Users`, route `/app/team`), «Журнал» (icon `History`, route `/app/activity`). Появляются только при `isBusinessPlan`. Реализация — фильтр в `useAppLayout()`. |
| API-структура | Два контроллера в Phase 2 (`WorkspaceMembersApiController`, `WorkspaceInvitesApiController`) — разные сущности и URL'ы. Один в Phase 3 (`WorkspaceActivityLogApiController`). |
| Cache-bust | На все workspace-scoped GET'ы — `?_t=${Date.now()}` (memory: workspace-scoped GETs не cache-controlled). |
| Verify-by-refetch | После каждой destructive-мутации — silent `request` + refetch (memory: mutations могут возвращать 4xx и при этом мутировать). |
| AlertDialog | Везде — паттерн «отдельный `v-model:open` boolean + отдельный target ref» (memory: derived `:open` от target гасит confirm-handlers). |

## Фаза 1 — Plan gate + индикатор

### `usePlans()`: новый computed

```ts
// lib-modules/plans/composables/usePlans.ts
const BUSINESS_TITLE_PATTERNS = ['business', 'team', 'команд', 'аген']

const isBusinessPlan = computed(() => {
  const title = $settings.getSubscription()?.title?.toLowerCase() ?? ''
  return BUSINESS_TITLE_PATTERNS.some(p => title.includes(p))
})

return { plans, currentPlanId, popularPlanId, loaded, isCurrentPlan, isPopularPlan, isBusinessPlan }
```

`lib-modules/plans/index.ts` — без изменений (`usePlans` уже экспортируется, `isBusinessPlan` доезжает в составе её return-объекта).

### Сайдбар — индикатор

В `AppSidebar.vue` (около строки 175, сразу после `<div class="text-xs font-medium ...">{{ planTitle }}</div>`) добавить:

```html
<div
  v-if="isBusinessPlan"
  class="text-[11px] text-muted-foreground truncate whitespace-nowrap"
>
  Командная версия
</div>
```

Источник флага — `usePlans()` импортированный в `AppSidebar.vue`. Существующая ветка для бесплатного тарифа (`v-if="isFreePlan"` со строкой «Открыть тарифы →») не трогается.

### Сайдбар — новые пункты

`useAppLayout()` (в `lib-modules/app-layout/composables/useAppLayout.ts`) уже владеет списком `sidebarItems`. Добавляем туда два новых элемента и фильтруем их по `isBusinessPlan`:

```ts
const { isBusinessPlan } = usePlans()
const allItems: SidebarItem[] = [
  // ...существующие
  { id: 'team',     label: 'Команда', icon: 'users',   route: '/app/team',     requiresBusinessPlan: true },
  { id: 'activity', label: 'Журнал',  icon: 'history', route: '/app/activity', requiresBusinessPlan: true },
]
const sidebarItems = computed(() => allItems.filter(i => !i.requiresBusinessPlan || isBusinessPlan.value))
```

В `iconComponents` в `AppSidebar.vue` добавить `users: Users`, `history: History` (`lucide-vue-next`).

Тип `SidebarItem` (`lib-modules/app-layout/types`) расширяется опциональным `requiresBusinessPlan?: boolean`.

### Route guards

Новые страницы `pages/app/team.vue` и `pages/app/activity.vue` через `definePageMeta({ middleware: 'business-plan' })` или inline-проверку в `<script setup>` (`onMounted` → `if (!isBusinessPlan.value) router.replace('/app/plans')`). Конкретный механизм выберется в плане; функционально — недоступно для free-тарифа.

Внутри страниц-обёрток в Phase 1 — заглушки-плейсхолдеры (`TeamPage` и `ActivityLogPage` ещё не реализованы); полноценные экраны въезжают в Phase 2/3.

### Verification gate (Phase 1)

- На бесплатном тарифе пунктов «Команда»/«Журнал» в сайдбаре нет.
- Прямой переход на `/app/team` и `/app/activity` редиректит на `/app/plans`.
- На бизнес-тарифе пункты появляются, под названием тарифа в чипе сайдбара виден текст «Командная версия».
- Страницы `/app/team` и `/app/activity` открываются, рендерят placeholder («Скоро» или page title без контента).

## Фаза 2 — Team management

### Структура модуля

```
lib-modules/team/
├── components/
│   ├── TeamPage.vue                 # обёртка для /app/team
│   ├── InviteAcceptPage.vue         # обёртка для /invite/[token]
│   ├── sections/
│   │   ├── MembersSection.vue
│   │   └── InvitesSection.vue
│   └── dialogs/
│       └── InviteMemberDialog.vue
├── composables/useTeam.ts
├── helpers/
│   ├── api.ts                       # WorkspaceMembersApi + WorkspaceInvitesApi
│   └── toasts.ts
├── types/index.ts                   # реэкспорт WorkspaceMemberDto, WorkspaceInviteDto, WorkspaceRole, etc.
└── index.ts                         # public API: TeamPage, InviteAcceptPage, useTeam
```

### API-контроллеры

```ts
// lib-modules/team/helpers/api.ts
export class WorkspaceMembersApiController extends ApiController {
  getMembers(workspaceId: string, q?: string, offset = 0, limit = 20): Promise<PagedResponseOfWorkspaceMemberDto>
  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void>
  removeMember(workspaceId: string, userId: string): Promise<void>
}

export class WorkspaceInvitesApiController extends ApiController {
  getInvites(workspaceId: string, opts: { status?: WorkspaceInviteStatus; q?: string; offset?: number; limit?: number }): Promise<PagedResponseOfWorkspaceInviteDto>
  createInvite(workspaceId: string, payload: { email: string; role: WorkspaceInviteRole }): Promise<WorkspaceInviteDto>
  revokeInvite(workspaceId: string, inviteId: string): Promise<void>

  // token-based (анонимный preview / по токену):
  getInvitePreview(token: string): Promise<WorkspaceInvitePreviewDto>
  acceptInvite(token: string): Promise<void>
  declineInvite(token: string): Promise<void>
}
```

Новые записи в `ApiAliases` (`scripts/shared/types/`):
- `workspaceMembers` → `/workspaces/{workspaceId}/members`
- `workspaceMember` → `/workspaces/{workspaceId}/members/{userId}`
- `workspaceInvites` → `/workspaces/{workspaceId}/invites`
- `workspaceInviteRevoke` → `/workspaces/{workspaceId}/invites/{inviteId}/revoke`
- `workspaceInvitePreview` → `/workspace-invites/{token}`
- `workspaceInviteAccept` → `/workspace-invites/{token}/accept`
- `workspaceInviteDecline` → `/workspace-invites/{token}/decline`

GET'ы (members, invites) — `?_t=${Date.now()}`.

### `useTeam()` composable

```ts
const {
  members,                     // Ref<WorkspaceMemberDto[]>
  invites,                     // Ref<WorkspaceInviteDto[]> (status === 'pending')
  loading,                     // Ref<boolean>
  currentRole,                 // computed<WorkspaceRole | null> — моя роль в текущем ws (из useWorkspaceContext)
  canManageMembers,            // computed — currentRole === 'owner'
  canManageInvites,            // computed — currentRole === 'owner' || 'admin'

  loadAll,                     // → параллельно getMembers + getInvites
  inviteMember,                // (email, role) → createInvite → refetch invites
  revokeInvite,                // (inviteId) → silent revoke → refetch invites
  updateMemberRole,            // (userId, role) → silent patch → refetch members
  removeMember,                // (userId) → silent delete → refetch members
  transferOwnership,           // (userId) = updateMemberRole(userId, 'owner') + спец confirm
} = useTeam()
```

`canManageMembers` и `canManageInvites` — нюансы:

- API: «manage workspace members» (PATCH/DELETE) и «manage workspace invites» (POST/revoke) — в спеке две разные пермишены. Точное соответствие ролям спека не описывает.
- Базовое предположение: owner — оба, admin — только invites, editor/viewer — ничего.
- 403 от бэка → toast «Недостаточно прав» + refetch.

Все мутации — через silent `request` + refetch (verify-by-refetch). Тосты централизованно в `helpers/toasts.ts`.

### Страница `/app/team`

`pages/app/team.vue` — обёртка-двустрочник:

```html
<script setup lang="ts">
import { TeamPage } from '~/lib-modules/team'
definePageMeta({ layout: 'app', middleware: 'business-plan' })
</script>
<template><TeamPage /></template>
```

Структура `TeamPage.vue`:

```
TeamPage
├── header: "{ workspaceName } · Команда"  +  кнопка "Пригласить"  (показ: canManageInvites)
├── MembersSection
│   ├── owner row: badge "Владелец", без actions для self
│   └── остальные rows: avatar/initials + name + email + role-badge + (если canManageMembers) DropdownMenu:
│       ├── "Сменить роль" → submenu admin/editor/viewer (исключая текущую)
│       ├── "Передать владение..." → TransferOwnershipDialog
│       └── "Удалить" → AlertDialog confirm
└── InvitesSection (показывается если invites.length > 0 OR canManageInvites)
    └── rows: email + role-badge + "истекает через X дней" + (canManageInvites) кнопка "Отозвать" → AlertDialog confirm
```

Empty state в Members (только owner и нет invites): «Вы пока в команде один. Пригласите коллег, чтобы вместе работать с воркспейсом» + кнопка «Пригласить» (если `canManageInvites`).

#### `InviteMemberDialog`

shadcn `<Dialog>` с `v-model:open`. Поля: `email` (text input), `role` (select: admin/editor/viewer; default — `editor`). Submit → `useTeam.inviteMember(email, role)`.

Обработка ошибок:
- 400 (валидация email) → inline-ошибка в форме.
- 409 (дубликат) → toast «Уже приглашён или участник».
- Прочее → toast generic.

#### Передача владения

Отдельный компонент `TransferOwnershipDialog` (внутри `dialogs/`) — `<AlertDialog>` с двумя ref'ами (open + target). Требует ввести `email` нового владельца текстом для подтверждения (защита от misclick). На confirm — `transferOwnership(target.userId)` → текущий пользователь становится `admin`, целевой — `owner`.

#### Workspace context отсутствует

Если `useWorkspaceContext().requireWorkspaceId()` бросает — `TeamPage` показывает empty state «Выберите воркспейс» + кнопка на `/app/workspaces`. Не обращаемся к API, не показываем ошибки.

### Публичная страница `/invite/[token]`

`pages/invite/[token].vue` — вне `/app/`, без `app` layout, доступна анонимно:

```html
<script setup lang="ts">
import { InviteAcceptPage } from '~/lib-modules/team'
definePageMeta({ layout: 'auth' })  // или blank-layout, по аналогии с email-sent
</script>
<template><InviteAcceptPage :token="$route.params.token" /></template>
```

`InviteAcceptPage.vue` flow:

```
mounted → getInvitePreview(token)
  ├── 200 + status='pending'  → карточка: workspaceName, invitedBy.name, role-локализация,
  │                              "истекает: {expiresAt}", кнопки "Принять" / "Отклонить"
  ├── 200 + status='accepted' → "Вы уже приняли это приглашение" + ссылка на /app
  ├── 200 + status='expired'  → "Срок действия истёк"
  ├── 200 + status='revoked'  → "Приглашение отозвано"
  └── 404                    → "Приглашение не найдено или повреждена ссылка"

[Принять]
  ├── НЕ авторизован → router.push(`/auth?return=${encodeURIComponent('/invite/' + token)}`)
  │                    после логина юзер вернётся на эту же страницу, кнопку нажимает повторно.
  │                    Auto-submit при наличии ?intent=accept в первой итерации не делаем.
  └── авторизован → acceptInvite(token) → toast → router.push('/app/workspaces')
                     (на /app/workspaces, чтобы юзер мог переключиться на новый воркспейс)

[Отклонить]
  └── declineInvite(token) → toast → router.push('/')
```

Если accept/decline по факту окажутся анонимными — упростим (не редиректим в /auth), но базовая модель «accept требует auth» оставлена как стандарт.

### Permissions внутри страницы

| Состояние | Что видно |
|---|---|
| `isBusinessPlan === false` | Не видно: middleware редиректит на `/app/plans`. |
| `currentRole === 'owner'` | Все секции и actions, включая передачу владения. |
| `currentRole === 'admin'` | Members read-only; «Пригласить» / «Отозвать» доступны. |
| `currentRole === 'editor' \| 'viewer'` | Обе секции read-only, никаких action-кнопок. |
| Workspace не выбран | Empty state «Выберите воркспейс». |

### Verification gate (Phase 2)

- В пустом ws (только owner): хедер + owner row + empty Invites + кнопка «Пригласить» видна.
- Создание инвайта → новая запись в Pending Invites; toast.
- Revoke инвайта → запись пропадает; toast.
- Смена роли editor → admin: dropdown в строке отражает новое значение после refetch.
- Удаление участника: строка пропадает; toast.
- Передача владения: после confirm target становится `owner`; что происходит с моей ролью — определяется бэком (предположительно сваливается в `admin`). После refetch проверяем фактический результат в браузере и при необходимости корректируем UI/копи в плане реализации.
- Incognito: открыть `/invite/{token}` — preview без логина рендерится корректно.
- Не залогиненный кликает «Принять» → редирект в `/auth`; после логина возврат → повторный клик «Принять» → юзер становится участником, viewable в `/app/workspaces` как новый ws.
- Editor / viewer открывают `/app/team` — списки видны, action-кнопок нет.
- 403 на mutation — toast «Недостаточно прав», refetch выправляет UI.

## Фаза 3 — Activity Log

### Структура модуля

```
lib-modules/activity-log/
├── components/
│   ├── ActivityLogPage.vue
│   ├── ActivityLogFilters.vue
│   └── ActivityLogItem.vue
├── composables/useActivityLog.ts
├── helpers/
│   ├── api.ts                       # WorkspaceActivityLogApiController
│   └── formatting.ts                # mapAction()
├── types/index.ts
└── index.ts                         # public API: ActivityLogPage, useActivityLog
```

### API-контроллер

```ts
export class WorkspaceActivityLogApiController extends ApiController {
  getLog(workspaceId: string, opts: {
    userId?: string
    entityType?: string
    action?: string
    from?: string  // ISO date-time
    to?: string
    offset?: number
    limit?: number
  }): Promise<PagedResponseOfActivityLogItemDto>
}
```

`ApiAliases.workspaceActivityLog` → `/workspaces/{workspaceId}/activity-log`. GET с `?_t=${Date.now()}`.

### `useActivityLog()` composable

```ts
const {
  items,                  // Ref<ActivityLogItemDto[]>
  loading,
  hasMore,                // computed: items.length < total
  filters,                // Ref<{ userId?: string; from?: string; to?: string }>

  loadInitial,            // сбросить items, offset=0, fetch
  loadMore,               // offset += loaded.length, append
  setFilters,             // Object.assign + loadInitial
  resetFilters,           // filters = {} + loadInitial
} = useActivityLog()
```

Никакого polling. Refresh — только manual (через перезаход или explicit refresh button — добавим если попросят).

### Страница `/app/activity`

```
ActivityLogPage
├── header: "{ workspaceName } · Журнал"
├── ActivityLogFilters (sticky сверху)
│   ├── user select       — список членов через прямой вызов `WorkspaceMembersApiController.getMembers()` локально в `useActivityLog` (не делим стейт с `useTeam` — модули независимые, общего store нет)
│   ├── date range picker — from / to (shadcn-vue date primitive)
│   └── reset button (показывается если фильтры активны)
└── list
    ├── grouped by day (реюз formatDateGroup из scripts/features/conversations/formatting.ts)
    ├── ActivityLogItem rows: avatar + actor name (или "Система" если actor=null)
    │                         + actionText (mapAction) + relative time (через existing formatter)
    ├── empty state: "Записей нет" / "Ничего не найдено по фильтру"
    └── infinite scroll trigger (IntersectionObserver на последней строке) → loadMore()
```

#### Скоуп фильтров в первой итерации

Только **user select + date range**. Спека не перечисляет возможные значения `entityType` / `action` — без знания списка фильтры по ним делать не имеет смысла (свободный текст слишком сырой). Добавить эти фильтры — отдельной задачей, когда соберём реальные коды событий.

### `mapAction()` formatter

```ts
// helpers/formatting.ts
const ACTION_TEXTS: Record<string, (item: ActivityLogItemDto) => string> = {
  // примеры — реальный список соберём в процессе по факту:
  // 'post.created':     () => 'создал(а) пост',
  // 'post.updated':     () => 'отредактировал(а) пост',
  // 'member.added':     () => 'добавил(а) участника',
  // 'member.role.changed': () => 'изменил(а) роль участника',
}

export function mapAction(item: ActivityLogItemDto): string {
  return ACTION_TEXTS[item.action]?.(item) ?? item.action
}
```

Sentinel-fallback на сырой `item.action` — страница не ломается на незнакомых event-кодах. Конкретные коды наполним по мере того, как увидим их в проде.

### Permissions

API: «Requires workspace access to view the workspace activity log» (роль не уточнена в спеке). Базовое предположение — owner+admin.

В первой итерации:

- Сайдбар-пункт «Журнал» виден всем юзерам с `isBusinessPlan` (как и Team) — не делаем кросс-проверку роли в сайдбаре.
- Сама страница: на 403 от бэка — empty state «Журнал доступен только владельцу или администратору воркспейса».
- На 401 (токен истёк) — стандартный glob handler перенаправляет в /auth.

### Verification gate (Phase 3)

- Страница открывается, рисуется первая страница записей (по умолчанию 50).
- Фильтр user → список сужается до записей этого юзера.
- Date range → ровно по диапазону.
- Reset → возвращается изначальный список.
- Скролл до низа → подгружается следующая пачка (offset += 50).
- Editor / viewer открывает — empty state «нет доступа».
- Workspace не выбран — empty state «Выберите воркспейс».

## Файлы (полный список изменений)

### Новые

- `lib-modules/team/**` — весь модуль (см. Фаза 2 структура).
- `lib-modules/activity-log/**` — весь модуль (см. Фаза 3 структура).
- `pages/app/team.vue` — обёртка над `lib-modules/team` `TeamPage`.
- `pages/app/activity.vue` — обёртка над `lib-modules/activity-log` `ActivityLogPage`.
- `pages/invite/[token].vue` — обёртка над `lib-modules/team` `InviteAcceptPage`.
- `middleware/business-plan.ts` (если выберется middleware-вариант гейта) — редирект на `/app/plans` при `!isBusinessPlan`.

### Правки

- `lib-modules/plans/composables/usePlans.ts` — `+computed isBusinessPlan`.
- `lib-modules/app-layout/composables/useAppLayout.ts` — добавить два `SidebarItem`'а с `requiresBusinessPlan: true` и фильтрацию по `isBusinessPlan` через `usePlans`.
- `lib-modules/app-layout/types/index.ts` (или где живёт `SidebarItem`) — добавить опциональный `requiresBusinessPlan?: boolean`.
- `lib-modules/app-layout/components/AppSidebar.vue` — `+icons users/history` в `iconComponents`; `+text "Командная версия"` в чипе подписки.
- `scripts/shared/types/api-aliases.ts` (или где живёт `ApiAliases`) — 8 новых записей (см. Фаза 2 + Фаза 3 endpoint mapping).

## Не входит (YAGNI)

- Per-workspace plan tier (API не поддерживает).
- Real-time push обновления членов / событий лога.
- Bulk-операции с участниками или приглашениями.
- Просмотр / diff `payload` в Activity Log.
- Self-onboarding для invited-viewer на free-плане (известное ограничение Фазы 1; может стать отдельной задачей).
- Email-копи редактируется на бэке, никаких шаблонов на фронте.
- Локализация UI-строк за пределы существующих конвенций приложения (`ru`/`en` по существующему паттерну).
