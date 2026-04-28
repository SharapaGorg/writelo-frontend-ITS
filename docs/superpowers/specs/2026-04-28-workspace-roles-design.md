# Workspace roles — UI gating design

**Date**: 2026-04-28
**Scope**: привязка серверных workspace-ролей (`owner | admin | editor | viewer`) к интерфейсу: гейтинг кнопок/секций/страниц, индикатор роли в воркспейс-селекторе.

## Контекст

Бекенд уже отдаёт роль текущего юзера в каждом воркспейсе через `WorkspaceDto.role` (`scripts/shared/types/workspace.ts:7`). В клиенте роль доступна как `useWorkspaceContext().currentWorkspace.value.role`.

Существующий частичный гейтинг:
- `lib-modules/team/composables/useTeam.ts` — `canManageInvites` (owner|admin), `canManageMembers` (owner). Используется внутри team-страницы.
- `lib-modules/workspaces/components/BrandBriefSection.vue` — принимает `canEdit` prop, родитель пока подаёт его руками.
- `scripts/shared/api/controller.ts:218-227` — глобальный 403-handler с тостом (defense in depth).

Остальные модули (calendar, editor, activity-log, workspace settings, навигация в sidebar) гейтинга не имеют — viewer/editor видят те же CTA, что и owner.

## Цель

1. Полная матрица прав по всем мутациям/страницам.
2. Один источник правды — composable `useWorkspacePermissions()`.
3. Стратегия отображения: всё, что недоступно — **скрываем**. Read-only данные остаются видимыми.
4. Индикатор роли в воркспейс-селекторе (текущий + роль в каждом workspace в dropdown'е).

## Permission matrix

| Действие | viewer | editor | admin | owner |
|---|:---:|:---:|:---:|:---:|
| Смотреть посты, brand brief, участников | ✅ | ✅ | ✅ | ✅ |
| AI-чаты (создать диалог, писать) | ✅ | ✅ | ✅ | ✅ |
| Создать / редактировать / удалить пост | ❌ | ✅ | ✅ | ✅ |
| Планировать / публиковать пост | ❌ | ✅ | ✅ | ✅ |
| Загружать медиа, генерить картинки в редакторе | ❌ | ✅ | ✅ | ✅ |
| Редактировать brand brief | ❌ | ✅ | ✅ | ✅ |
| Переименовать воркспейс | ❌ | ❌ | ✅ | ✅ |
| Привязать / отвязать соц-аккаунт | ❌ | ❌ | ✅ | ✅ |
| Activity log (sidebar + страница) | ❌ | ❌ | ✅ | ✅ |
| Отправить / отозвать инвайт | ❌ | ❌ | ✅ | ✅ |
| Сменить роль viewer ↔ editor | ❌ | ❌ | ✅ | ✅ |
| Удалить участника (viewer/editor) | ❌ | ❌ | ✅ | ✅ |
| Назначить / снять / удалить admin | ❌ | ❌ | ❌ | ✅ |
| Transfer ownership | ❌ | ❌ | ❌ | ✅ |
| Удалить воркспейс | ❌ | ❌ | ❌ | ✅ |

## Архитектура

### Composable `useWorkspacePermissions()`

**Файл**: `lib-modules/workspaces/composables/useWorkspacePermissions.ts`
**Экспорт**: добавляется в `lib-modules/workspaces/index.ts`

Source of truth — `useWorkspaceContext().currentWorkspace.value.role`. Все простые флаги — `ComputedRef<boolean>`, реактивны на смену воркспейса.

```ts
export function useWorkspacePermissions() {
  const ctx = useWorkspaceContext()
  const currentRole = computed<WorkspaceRole | null>(
    () => ctx.currentWorkspace.value?.role ?? null,
  )

  const isAtLeast = (...roles: WorkspaceRole[]) =>
    computed(() => currentRole.value !== null && roles.includes(currentRole.value))

  return {
    currentRole,

    // Контент (editor+)
    canManagePosts:           isAtLeast('editor', 'admin', 'owner'),
    canEditBrandBrief:        isAtLeast('editor', 'admin', 'owner'),  // current workspace
    // Для других воркспейсов (например, на странице /app/workspaces) использовать
    // store getter'ы напрямую: canEditBrandBriefIn(id), canRenameWorkspaceIn(id),
    // canDeleteWorkspaceIn(id). Этот composable — только про currentWorkspace.

    // Workspace settings (admin+)
    canRenameWorkspace:       isAtLeast('admin', 'owner'),
    canManageSocialAccounts:  isAtLeast('admin', 'owner'),
    canViewActivityLog:       isAtLeast('admin', 'owner'),
    canManageInvites:         isAtLeast('admin', 'owner'),

    // Команда (per-target логика)
    canChangeMemberRole:      (m: WorkspaceMemberDto) => boolean,
    canRemoveMember:          (m: WorkspaceMemberDto) => boolean,
    getAssignableRoles:       (m: WorkspaceMemberDto) => WorkspaceRole[],
    canManageAdmins:          isAtLeast('owner'),

    // Owner only
    canDeleteWorkspace:       isAtLeast('owner'),
  }
}
```

### Per-target хелперы

`getAssignableRoles(m)` — какие роли текущий юзер может назначить этому участнику:

- **owner**:
  - если `m.userId === self` → `[]`
  - если `m.role === 'owner'` → `[]` (transfer ownership — отдельный flow)
  - иначе → `['viewer', 'editor', 'admin']`
- **admin**:
  - если `m.role` ∈ `{viewer, editor}` → `['viewer', 'editor']`
  - иначе → `[]` (нельзя трогать другого admin/owner)
- **editor / viewer / null** → `[]`

`canChangeMemberRole(m)` ≡ `getAssignableRoles(m).length > 0`

`canRemoveMember(m)`:
- **owner**: `true` если `m.userId !== self` и `m.role !== 'owner'`
- **admin**: `true` если `m.role` ∈ `{viewer, editor}`
- иначе: `false`

### Существующий `useTeam` рефакторится

`canManageInvites` / `canManageMembers` → прокси на центральные флаги. `getAssignableRoles` / `canRemoveMember` дополнительно ре-экспортятся через team composable для удобства. Изменения в потребителях минимальны.

## Изменения по модулям

### `lib-modules/workspaces/`
- **NEW**: `composables/useWorkspacePermissions.ts`
- **NEW**: `components/RoleBadge.vue` (см. секцию "Индикатор роли")
- `index.ts` — экспорт нового composable + RoleBadge
- `stores/workspacesStore.ts` — существующий getter `canEdit(workspaceId)` (=owner|admin) **не отвечает матрице**: editor должен править brand brief, а delete доступен только owner. Расщепляем на три getter'а:
  - `canEditBrandBriefIn(workspaceId)` — editor|admin|owner
  - `canRenameWorkspaceIn(workspaceId)` — admin|owner (текущая семантика `canEdit`)
  - `canDeleteWorkspaceIn(workspaceId)` — owner only
  Старый `canEdit` удаляется. `useWorkspacePermissions()` для текущего воркспейса делегирует туда же.
- `components/WorkspacesListPage.vue` — переподключает три новых getter'а:
  - кнопка delete (line ~441) под `v-if="canDeleteWorkspaceIn(w.id)"` (вместо текущего `canEdit`)
  - input имени (line ~469) — рендерится только если `canRenameWorkspaceIn(w.id)`, иначе текст
  - `<BrandBriefSection :can-edit="canEditBrandBriefIn(w.id)" />`
  - кнопка save (line ~492) — disabled если ни одно из полей не редактируемо текущей ролью
- `components/BrandBriefSection.vue` — сейчас использует `:disabled="!canEdit"`. Меняем на `v-if`-ветвление: при `canEdit` — обычная форма; при `!canEdit` — read-only текстовое отображение значений без полей ввода и без кнопки save.

### `lib-modules/team/`
- `composables/useTeam.ts` — рефакторинг на центральный composable; добавляются `getAssignableRoles`, `canRemoveMember`.
- `components/sections/InvitesSection.vue` — `v-if="canManageInvites"` на корневом уровне секции.
- `components/sections/MembersSection.vue` — дропдаун ролей берёт варианты из `getAssignableRoles(member)`; пустой массив → рендер как текст; кнопка "Удалить" скрыта если `!canRemoveMember(member)`.
- `components/dialogs/TransferOwnershipDialog.vue` — кнопка-триггер скрыта если `!canManageAdmins`.

### `lib-modules/content-calendar/`
- `components/ContentCalendarPage.vue` — все CTA "Создать пост" / "+ Добавить" скрыты если `!canManagePosts`.
- `components/PostPreviewPanel.vue` — кнопки edit / delete / publish / schedule / "Открыть в редакторе" скрыты если `!canManagePosts`. Превью контента (текст, медиа, дата, статус) остаётся.
- `components/DayCell.vue`, `DayDetailPanel.vue` — quick-create CTA скрыт.
- `components/AccountsSidebar.vue` — кнопки add / unlink скрыты если `!canManageSocialAccounts`. Список аккаунтов остаётся read-only.
- `components/SidebarContainer.vue` — пробег по CTA, гейтинг где надо.

### `pages/app/editor/[[postId]].vue` + `lib-modules/content-editor/`
- Page-level guard: `v-if="!canManagePosts"` рендерит `<NoAccessState />`. Без редиректа.

### `pages/app/activity.vue` + `lib-modules/activity-log/`
- На странице уже стоит `middleware: 'business-plan'` (план-гейт). Role-гейт **наслаивается внутри компонента**: внутри `ActivityLogPage.vue` рендерим `<NoAccessState v-if="!canViewActivityLog" />`. Middleware остаётся как есть.

### `lib-modules/app-layout/`
- `composables/useAppLayout.ts` — `SidebarItem` получает опциональный `requiresPermission?: PermissionFlag`; computed `visibleSidebarItems` фильтрует по флагам из `useWorkspacePermissions()`.
- `components/AppSidebar.vue` — рендерит `visibleSidebarItems`.
- `components/AppNavbar.vue` — индикатор роли (см. ниже).

### Не трогаем
- `lib-modules/conversations/` — все роли могут чатиться без ограничений.
- `lib-modules/imageGenerator/` — гейтится опосредованно через content-editor.
- `lib-modules/profile/`, `lib-modules/plans/` — per-user, не workspace-scoped.
- `scripts/shared/api/controller.ts` — 403-handler уже работает.

## Sidebar — фильтрация

```ts
type PermissionFlag =
  | 'canViewActivityLog'
  // ...по мере роста

interface SidebarItem {
  // существующие поля
  requiresPermission?: PermissionFlag
}

const permissions = useWorkspacePermissions()
const visibleSidebarItems = computed(() =>
  sidebarItems.value.filter(item =>
    !item.requiresPermission || permissions[item.requiresPermission].value
  )
)
```

Помеченные пункты:
- **Activity log** → `requiresPermission: 'canViewActivityLog'` — исчезает у viewer/editor.

Остальные пункты доступны всем ролям (внутренний гейтинг страницы решает что показывать).

## Page-level guard и empty-state

**Новый компонент**: `components/NoAccessState.vue` (атом).

Содержание:
- Иконка `Lock` или `ShieldX` (lucide).
- Заголовок: "Нет доступа".
- Подзаголовок: "У вашей роли нет прав для этого раздела. Если думаете, что это ошибка — напишите владельцу воркспейса."
- Кнопка "Назад к календарю" → `router.push('/app/calendar')`.

Использование:

```vue
<script setup>
const { canViewActivityLog } = useWorkspacePermissions()
const { isReady } = useWorkspaceContext()
</script>

<template>
  <PageSkeleton v-if="!isReady" />
  <NoAccessState v-else-if="!canViewActivityLog" />
  <ActivityLogContent v-else />
</template>
```

Loading vs no-access — пока воркспейс ещё не загрузился (`!isReady`), рендерим page skeleton, а не NoAccess. Иначе мелькает "Нет доступа" во время загрузки.

## Индикатор роли (RoleBadge)

**Файл**: `lib-modules/workspaces/components/RoleBadge.vue`

Принимает `role: WorkspaceRole`, рендерит маленький text-chip:

```ts
const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner:  'Владелец',
  admin:  'Админ',
  editor: 'Редактор',
  viewer: 'Зритель',
}

const ROLE_ICONS: Record<WorkspaceRole, Component> = {
  owner:  Crown,
  admin:  ShieldCheck,
  editor: PencilLine,
  viewer: Eye,
}
```

**Стиль**: text-only chip с тонким border, `text-muted-foreground border-border`. Без брендового цвета (чтобы не путать с plan-chip). Иконка слева от текста.

**Размещение** в `AppNavbar.vue`:
1. Рядом с текущим выбранным воркспейсом в селекторе — `<RoleBadge :role="currentRole" />`.
2. Внутри dropdown-списка у каждого item'а — `<RoleBadge :role="ws.role" />`. Чтобы при переключении было видно, какая роль ждёт юзера в каждом воркспейсе.

## Edge cases

1. **Owner смотрит свою строку в участниках** — `getAssignableRoles(self) = []`, `canRemoveMember(self) = false`. Дропдаун рендерится как текст "owner", кнопки удаления нет. Существующий "Leave workspace" остаётся отдельной кнопкой (доступен всем).

2. **Смена воркспейса** — реактивно: `currentWorkspace.role` меняется → флаги пересчитываются → UI обновляется без перезагрузки. Если юзер был на activity-log в admin-воркспейсе и переключился в viewer — page-level guard сразу показывает NoAccess.

3. **Роль изменилась на бекенде, пока юзер на странице** — клиент не подписан на push-обновления своей роли. Stale UI до nav/refresh. Если юзер кликнет ставшую недоступной кнопку — бекенд вернёт 403, существующий `ApiController` handler покажет тост.

4. **Refresh / прямой URL** — `currentWorkspace` загружается асинхронно. Пока `!isReady` — рендерим skeleton, не NoAccess.

5. **Ошибка загрузки воркспейса** — отдельный flow, не часть этой фичи.

6. **Удалили юзера из воркспейса, пока он в нём** — отдельный flow (бекенд → 403/404 на любом запросе → клиент redirect to workspace selector). Не часть этой фичи.

7. **Owner удалил воркспейс** — после успешного DELETE существующий flow переключает на другой воркспейс / пустой стейт.

## Non-goals

- Real-time синхронизация ролей (polling / WebSocket).
- Visual hint "вы видите эту страницу в read-only потому что вы X" — намеренно скрываем без пояснений.
- Отдельный гейтинг conversations / image generator (живут внутри уже гейтнутого editor / общедоступны).
- Изменения в `scripts/` legacy-коде — только `lib-modules/`.
- Защита роутов через Nuxt middleware — page-level guard внутри компонента, без middleware.
- Логика "viewer удаляет свои чаты" — все роли свободно работают с диалогами.
- Английская локализация ярлыков RoleBadge — позже, отдельно.

## Smoke tests

1. **viewer** — calendar показывает посты без CTA "Создать"; editor URL → NoAccess; team-страница без секции Invites; sidebar без activity-log; brand brief read-only без кнопки save; navbar показывает badge "Зритель".
2. **editor** — calendar/editor работают; brand brief редактируется; нет Invites/activity-log/rename workspace/social accounts; navbar badge "Редактор".
3. **admin** — всё editor + Invites + activity-log + rename + соц-аккаунты; в team дропдаун ролей предлагает только viewer/editor для не-admin участников; admin-строки в списке без кнопок изменения; navbar badge "Админ".
4. **owner** — всё; в team дропдаун предлагает все три роли; transfer ownership доступен; delete workspace доступен; navbar badge "Владелец".
5. **Переключение** admin → viewer на activity-log — мгновенный NoAccess.
6. **Workspace dropdown** — рядом с каждым воркспейсом виден соответствующий role-badge.
