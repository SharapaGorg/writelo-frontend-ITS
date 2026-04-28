# Workspace roles — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Привязать серверные workspace-роли (`owner | admin | editor | viewer`) к UI: гейтить кнопки/секции/страницы, показывать индикатор роли в воркспейс-селекторе.

**Architecture:** Один центральный composable `useWorkspacePermissions()` в `lib-modules/workspaces` — единый источник правды для прав текущего воркспейса. Per-workspace getters в Pinia store для случаев, когда нужны права в произвольном воркспейсе (страница `/app/workspaces`). Стратегия — скрывать всё недоступное (без disable+tooltip). Defense-in-depth через существующий 403-handler в `ApiController`.

**Tech Stack:** Vue 3 + Nuxt 3, Pinia, Tailwind, shadcn-vue, Vitest для unit-тестов composable.

**Spec:** `docs/superpowers/specs/2026-04-28-workspace-roles-design.md`

**User flow constraint** (per memory): после изменений в каждой UI-фазе **юзер сам тестирует в браузере**, агент **не коммитит автоматически** до подтверждения. Каждая фаза заканчивается шагом "Browser verify → ждём 'работает' → коммитим".

---

## Phase 1 — Foundation (composable + store + shared components)

Создаём всё, что не видно пользователю напрямую: composable, расширения store, общие UI-компоненты (`NoAccessState`, `RoleBadge`). Старый getter `canEdit` в store остаётся как алиас, удалится в Phase 4.

**Files:**
- Create: `lib-modules/workspaces/composables/useWorkspacePermissions.ts`
- Create: `lib-modules/workspaces/composables/__tests__/useWorkspacePermissions.test.ts`
- Modify: `lib-modules/workspaces/stores/workspacesStore.ts`
- Modify: `lib-modules/workspaces/composables/useWorkspaces.ts`
- Modify: `lib-modules/workspaces/index.ts`
- Create: `lib-modules/workspaces/components/NoAccessState.vue`
- Create: `lib-modules/workspaces/components/RoleBadge.vue`

### Task 1.1: Расширить store getters

- [ ] **Step 1: Добавить новые getters в `lib-modules/workspaces/stores/workspacesStore.ts`**

В блоке `getters:` рядом с существующим `canEdit` добавить:

```ts
canEditBrandBriefIn: (state) => (workspaceId: string): boolean => {
  const w = state.workspaces.find(w => w.id === workspaceId)
  if (!w) return false
  return w.role === 'editor' || w.role === 'admin' || w.role === 'owner'
},

canRenameWorkspaceIn: (state) => (workspaceId: string): boolean => {
  const w = state.workspaces.find(w => w.id === workspaceId)
  if (!w) return false
  return w.role === 'admin' || w.role === 'owner'
},

canDeleteWorkspaceIn: (state) => (workspaceId: string): boolean => {
  const w = state.workspaces.find(w => w.id === workspaceId)
  return w?.role === 'owner'
},
```

Существующий `canEdit` пока **не трогаем** — Phase 4 удалит после миграции потребителей.

- [ ] **Step 2: Type-check**

Run: `yarn build` или `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 1.2: Создать `useWorkspacePermissions` composable

- [ ] **Step 1: Создать файл `lib-modules/workspaces/composables/useWorkspacePermissions.ts`**

```ts
import { computed, type ComputedRef } from 'vue'
import { useWorkspaceContext } from './useWorkspaceContext'
import { useUserController } from '~/composables/user'
import type { WorkspaceRole, WorkspaceMemberDto } from '../types'

function isAtLeastFactory(roleRef: ComputedRef<WorkspaceRole | null>) {
  return (...allowed: WorkspaceRole[]) =>
    computed(() => roleRef.value !== null && allowed.includes(roleRef.value))
}

export function useWorkspacePermissions() {
  const ctx = useWorkspaceContext()
  const userController = useUserController()

  const currentRole = computed<WorkspaceRole | null>(
    () => ctx.currentWorkspace.value?.role ?? null,
  )

  const isAtLeast = isAtLeastFactory(currentRole)

  // Контент (editor+)
  const canManagePosts = isAtLeast('editor', 'admin', 'owner')
  const canEditBrandBrief = isAtLeast('editor', 'admin', 'owner')

  // Workspace settings (admin+)
  const canRenameWorkspace = isAtLeast('admin', 'owner')
  const canManageSocialAccounts = isAtLeast('admin', 'owner')
  const canViewActivityLog = isAtLeast('admin', 'owner')
  const canManageInvites = isAtLeast('admin', 'owner')

  // Owner-only
  const canManageAdmins = isAtLeast('owner')
  const canDeleteWorkspace = isAtLeast('owner')

  // Per-target helpers
  function getAssignableRoles(member: WorkspaceMemberDto): WorkspaceRole[] {
    const role = currentRole.value
    const selfId = userController.user.value?.id ?? null

    if (role === 'owner') {
      if (member.userId === selfId) return []
      if (member.role === 'owner') return []
      return ['viewer', 'editor', 'admin']
    }
    if (role === 'admin') {
      if (member.role === 'viewer' || member.role === 'editor') {
        return ['viewer', 'editor']
      }
      return []
    }
    return []
  }

  function canChangeMemberRole(member: WorkspaceMemberDto): boolean {
    return getAssignableRoles(member).length > 0
  }

  function canRemoveMember(member: WorkspaceMemberDto): boolean {
    const role = currentRole.value
    const selfId = userController.user.value?.id ?? null

    if (role === 'owner') {
      return member.userId !== selfId && member.role !== 'owner'
    }
    if (role === 'admin') {
      return member.role === 'viewer' || member.role === 'editor'
    }
    return false
  }

  return {
    currentRole,
    canManagePosts,
    canEditBrandBrief,
    canRenameWorkspace,
    canManageSocialAccounts,
    canViewActivityLog,
    canManageInvites,
    canManageAdmins,
    canDeleteWorkspace,
    getAssignableRoles,
    canChangeMemberRole,
    canRemoveMember,
  }
}

export type WorkspacePermissions = ReturnType<typeof useWorkspacePermissions>
```

- [ ] **Step 2: Проверить, что `useUserController` действительно отдаёт `user.value.id`**

Run: `grep -n "user.*ref\|user.*computed\|user.*UserDto" composables/user.ts`
Expected: видим, что user-объект экспортится. Если имя свойства не `user`, поправить импорт в composable.

- [ ] **Step 3: Type-check**

Run: `yarn build` или `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 1.3: Unit-тесты для composable

- [ ] **Step 1: Создать файл `lib-modules/workspaces/composables/__tests__/useWorkspacePermissions.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import type { WorkspaceMemberDto, WorkspaceDto } from '../../types'

// Мокаем зависимости перед импортом composable
const currentWorkspace = ref<WorkspaceDto | null>(null)
const user = ref<{ id: string } | null>(null)

vi.mock('../useWorkspaceContext', () => ({
  useWorkspaceContext: () => ({ currentWorkspace }),
}))
vi.mock('~/composables/user', () => ({
  useUserController: () => ({ user }),
}))

import { useWorkspacePermissions } from '../useWorkspacePermissions'

function setRole(role: WorkspaceDto['role'] | null, selfId = 'me') {
  currentWorkspace.value = role ? ({ id: 'w1', role } as WorkspaceDto) : null
  user.value = { id: selfId }
}

function makeMember(userId: string, role: WorkspaceMemberDto['role']): WorkspaceMemberDto {
  return { userId, name: userId, email: null, role, joinedAt: '' }
}

describe('useWorkspacePermissions — flag matrix', () => {
  it('viewer: only read', () => {
    setRole('viewer')
    const p = useWorkspacePermissions()
    expect(p.canManagePosts.value).toBe(false)
    expect(p.canEditBrandBrief.value).toBe(false)
    expect(p.canViewActivityLog.value).toBe(false)
    expect(p.canManageInvites.value).toBe(false)
    expect(p.canDeleteWorkspace.value).toBe(false)
  })

  it('editor: content + brand brief, no team/log/settings', () => {
    setRole('editor')
    const p = useWorkspacePermissions()
    expect(p.canManagePosts.value).toBe(true)
    expect(p.canEditBrandBrief.value).toBe(true)
    expect(p.canRenameWorkspace.value).toBe(false)
    expect(p.canViewActivityLog.value).toBe(false)
    expect(p.canManageInvites.value).toBe(false)
  })

  it('admin: full except owner-only', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.canManagePosts.value).toBe(true)
    expect(p.canRenameWorkspace.value).toBe(true)
    expect(p.canManageInvites.value).toBe(true)
    expect(p.canViewActivityLog.value).toBe(true)
    expect(p.canManageAdmins.value).toBe(false)
    expect(p.canDeleteWorkspace.value).toBe(false)
  })

  it('owner: everything', () => {
    setRole('owner')
    const p = useWorkspacePermissions()
    expect(p.canManageAdmins.value).toBe(true)
    expect(p.canDeleteWorkspace.value).toBe(true)
  })

  it('null role: nothing', () => {
    setRole(null)
    const p = useWorkspacePermissions()
    expect(p.canManagePosts.value).toBe(false)
    expect(p.canViewActivityLog.value).toBe(false)
  })
})

describe('useWorkspacePermissions — getAssignableRoles', () => {
  it('owner can assign viewer/editor/admin to any non-owner non-self', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('other', 'editor'))).toEqual(['viewer', 'editor', 'admin'])
  })

  it('owner cannot assign roles to themselves', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('me', 'owner'))).toEqual([])
  })

  it('owner cannot assign roles to another owner', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('other', 'owner'))).toEqual([])
  })

  it('admin can assign viewer/editor to non-admin members', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual(['viewer', 'editor'])
    expect(p.getAssignableRoles(makeMember('x', 'editor'))).toEqual(['viewer', 'editor'])
  })

  it('admin cannot touch other admins or owner', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'admin'))).toEqual([])
    expect(p.getAssignableRoles(makeMember('x', 'owner'))).toEqual([])
  })

  it('editor/viewer cannot assign anything', () => {
    setRole('editor')
    let p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual([])
    setRole('viewer')
    p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual([])
  })
})

describe('useWorkspacePermissions — canRemoveMember', () => {
  it('owner can remove anyone except self and owner', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('me', 'owner'))).toBe(false)
    expect(p.canRemoveMember(makeMember('other', 'owner'))).toBe(false)
    expect(p.canRemoveMember(makeMember('other', 'admin'))).toBe(true)
    expect(p.canRemoveMember(makeMember('other', 'editor'))).toBe(true)
  })

  it('admin can remove only viewer/editor', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(true)
    expect(p.canRemoveMember(makeMember('x', 'editor'))).toBe(true)
    expect(p.canRemoveMember(makeMember('x', 'admin'))).toBe(false)
    expect(p.canRemoveMember(makeMember('x', 'owner'))).toBe(false)
  })

  it('editor/viewer cannot remove anyone', () => {
    setRole('editor')
    let p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(false)
    setRole('viewer')
    p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(false)
  })
})
```

- [ ] **Step 2: Запустить тесты**

Run: `yarn test lib-modules/workspaces/composables/__tests__/useWorkspacePermissions.test.ts`
Expected: все тесты PASS.

### Task 1.4: Создать `NoAccessState.vue`

- [ ] **Step 1: Создать `lib-modules/workspaces/components/NoAccessState.vue`**

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShieldX } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const router = useRouter()

function goHome() {
  router.push('/app/calendar')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center px-6">
    <ShieldX class="h-12 w-12 text-muted-foreground" />
    <div class="space-y-1">
      <h2 class="text-lg font-semibold">Нет доступа</h2>
      <p class="text-sm text-muted-foreground max-w-sm">
        У вашей роли нет прав для этого раздела. Если думаете, что это ошибка — напишите владельцу воркспейса.
      </p>
    </div>
    <Button variant="outline" size="sm" @click="goHome">Назад к календарю</Button>
  </div>
</template>
```

- [ ] **Step 2: Проверить что компонент компилируется**

Run: `npx vue-tsc --noEmit` (или `yarn build`)
Expected: без ошибок.

### Task 1.5: Создать `RoleBadge.vue`

- [ ] **Step 1: Создать `lib-modules/workspaces/components/RoleBadge.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Crown, ShieldCheck, PencilLine, Eye } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import type { WorkspaceRole } from '../types'

const props = defineProps<{
  role: WorkspaceRole | null | undefined
  class?: string
}>()

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Владелец',
  admin: 'Админ',
  editor: 'Редактор',
  viewer: 'Зритель',
}

const ROLE_ICONS = {
  owner: Crown,
  admin: ShieldCheck,
  editor: PencilLine,
  viewer: Eye,
} as const

const meta = computed(() => {
  if (!props.role) return null
  return {
    label: ROLE_LABELS[props.role],
    icon: ROLE_ICONS[props.role],
  }
})
</script>

<template>
  <span
    v-if="meta"
    :class="cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-border text-[11px] leading-none text-muted-foreground',
      props.class,
    )"
  >
    <component :is="meta.icon" class="h-3 w-3" />
    {{ meta.label }}
  </span>
</template>
```

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 1.6: Экспортировать из public API модуля

- [ ] **Step 1: Обновить `lib-modules/workspaces/index.ts`**

Добавить рядом с существующими экспортами:

```ts
// Permissions
export { useWorkspacePermissions } from './composables/useWorkspacePermissions'
export type { WorkspacePermissions } from './composables/useWorkspacePermissions'

// Components
export { default as NoAccessState } from './components/NoAccessState.vue'
export { default as RoleBadge } from './components/RoleBadge.vue'
```

- [ ] **Step 2: Type-check + build**

Run: `yarn build`
Expected: без ошибок.

### Task 1.7: Коммит

- [ ] **Step 1: Закоммитить foundation**

```bash
git add lib-modules/workspaces/composables/useWorkspacePermissions.ts \
        lib-modules/workspaces/composables/__tests__/useWorkspacePermissions.test.ts \
        lib-modules/workspaces/stores/workspacesStore.ts \
        lib-modules/workspaces/components/NoAccessState.vue \
        lib-modules/workspaces/components/RoleBadge.vue \
        lib-modules/workspaces/index.ts
git commit -m "feat(workspaces): permissions composable + role-aware components

Adds useWorkspacePermissions() as central source of truth for current
workspace permissions. Adds per-workspace store getters
(canEditBrandBriefIn / canRenameWorkspaceIn / canDeleteWorkspaceIn)
for /app/workspaces page. Adds NoAccessState + RoleBadge components.

No UI integration yet — see follow-up phases."
```

Foundation готов. Дальше — интеграция.

---

## Phase 2 — Sidebar filter + Activity log guard + RoleBadge в navbar

Первая фаза с видимым результатом. Юзер должен увидеть: пункт "Журнал" исчезает у viewer/editor; прямой URL `/app/activity` под viewer показывает "Нет доступа"; рядом с воркспейс-селектором появляется badge роли.

**Files:**
- Modify: `lib-modules/app-layout/types/index.ts`
- Modify: `lib-modules/app-layout/composables/useAppLayout.ts`
- Modify: `lib-modules/activity-log/components/ActivityLogPage.vue`
- Modify: `lib-modules/app-layout/components/AppNavbar.vue`

### Task 2.1: Расширить `SidebarItem` тип

- [ ] **Step 1: Обновить `lib-modules/app-layout/types/index.ts`**

Заменить интерфейс на:

```ts
export type PermissionFlag = 'canViewActivityLog'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
  requiresBusinessPlan?: boolean
  requiresPermission?: PermissionFlag
}
```

(`SidebarSection` остаётся как было.)

### Task 2.2: Применить permission filter в `useAppLayout`

- [ ] **Step 1: Обновить `lib-modules/app-layout/composables/useAppLayout.ts`**

Заменить тело composable:

```ts
import { ref, computed } from 'vue'
import { usePlans } from '~/lib-modules/plans'
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
import type { SidebarSection, SidebarItem, PermissionFlag } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const { isBusinessPlan } = usePlans()
  const permissions = useWorkspacePermissions()

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
  ]

  function hasPermission(flag: PermissionFlag): boolean {
    return permissions[flag].value
  }

  const sidebarItems = computed<SidebarItem[]>(() =>
    allItems.filter(i =>
      (!i.requiresBusinessPlan || isBusinessPlan.value) &&
      (!i.requiresPermission || hasPermission(i.requiresPermission))
    ),
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

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 2.3: Page-level guard в Activity log

- [ ] **Step 1: Обернуть содержимое `ActivityLogPage.vue`**

В `lib-modules/activity-log/components/ActivityLogPage.vue`:

В блоке `<script setup>` добавить импорты и взять флаг:

```ts
import { useWorkspacePermissions, NoAccessState } from '~/lib-modules/workspaces'

const { canViewActivityLog } = useWorkspacePermissions()
```

В шаблоне обернуть текущий root так:

```vue
<template>
  <NoAccessState v-if="!canViewActivityLog" />
  <template v-else>
    <!-- существующий шаблон страницы целиком -->
  </template>
</template>
```

(Если у страницы был один корневой элемент — обернуть его в `<template v-else>`. Если несколько — собрать под `<div v-else>` или `<template v-else>` с фрагментом.)

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 2.4: RoleBadge в `AppNavbar.vue`

- [ ] **Step 1: Подключить badge к селектору**

В `lib-modules/app-layout/components/AppNavbar.vue`:

В `<script setup>` импортировать badge и роль текущего воркспейса:

```ts
import { RoleBadge, useWorkspacePermissions } from '~/lib-modules/workspaces'

const { currentRole } = useWorkspacePermissions()
```

В шаблоне `<SelectTrigger>` рядом с `<SelectValue>` показать текущий badge:

```vue
<SelectTrigger class="w-[260px] bg-card border-border">
  <div class="flex items-center gap-2 min-w-0 w-full">
    <SelectValue placeholder="Выберите бренд" class="truncate" />
    <RoleBadge :role="currentRole" class="shrink-0" />
  </div>
</SelectTrigger>
```

В каждом `<SelectItem>` показать badge соответствующего воркспейса:

```vue
<SelectItem v-for="ws in workspaces" :key="ws.id" :value="ws.id">
  <span class="flex items-center justify-between gap-2 w-full min-w-0">
    <span class="truncate">{{ ws.name }}</span>
    <RoleBadge :role="ws.role" class="shrink-0" />
  </span>
</SelectItem>
```

(`workspaces` уже доступны через `useWorkspaces()` в существующем коде; `ws.role` приходит с API в каждом `WorkspaceDto`.)

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 2.5: Browser verify

- [ ] **Step 1: Запросить у юзера verify в браузере**

(Юзер сам держит `yarn dev` на :3000. См. memory `feedback_dev_server_conflict`. Не запускать свой.)

Чек-лист:
1. Логин под voркспейсом, где роль **viewer** или **editor**:
   - В sidebar **нет** пункта "Журнал".
   - Прямой URL `/app/activity` → видно "Нет доступа" + кнопку "Назад к календарю".
2. Логин под **admin** или **owner**:
   - В sidebar пункт "Журнал" виден.
   - Страница активити-лога открывается как раньше.
3. В navbar рядом с селектором воркспейса видна badge роли (например "Админ", "Зритель").
4. В дропдауне селектора у каждого воркспейса видна badge роли в этом воркспейсе.
5. Переключение между воркспейсами с разными ролями: badge и наличие "Журнала" в sidebar обновляются мгновенно.

- [ ] **Step 2: После 'работает' — коммит**

```bash
git add lib-modules/app-layout/types/index.ts \
        lib-modules/app-layout/composables/useAppLayout.ts \
        lib-modules/app-layout/components/AppNavbar.vue \
        lib-modules/activity-log/components/ActivityLogPage.vue
git commit -m "feat(roles): sidebar filter + activity-log guard + role badge in navbar

Hides activity-log nav item for viewer/editor; direct URL renders
NoAccessState. Adds RoleBadge next to workspace selector and inside
each dropdown item."
```

---

## Phase 3 — Team page (invites + members)

Гейтим секции команды по матрице. Editor/viewer видят список участников read-only без секции инвайтов и без "Удалить участника"/"Сменить роль". Admin'у недоступен apc-only "transfer ownership" + не может трогать других admin/owner.

**Files:**
- Modify: `lib-modules/team/composables/useTeam.ts`
- Modify: `lib-modules/team/components/sections/InvitesSection.vue`
- Modify: `lib-modules/team/components/sections/MembersSection.vue`
- Modify: `lib-modules/team/components/dialogs/TransferOwnershipDialog.vue` (если есть отдельная кнопка-триггер — иначе родитель)

### Task 3.1: Прокси `useTeam` через центральный composable

- [ ] **Step 1: Обновить `lib-modules/team/composables/useTeam.ts`**

Заменить существующие `currentRole`, `canManageMembers`, `canManageInvites` и добавить `getAssignableRoles`/`canRemoveMember` через делегирование:

```ts
import { ref, computed } from 'vue'
import { useWorkspaceContext, useWorkspacePermissions } from '~/lib-modules/workspaces'
// остальные импорты как были
```

Внутри `useTeam`:

```ts
const ctx = useWorkspaceContext()
const permissions = useWorkspacePermissions()
const membersApi = useWorkspaceMembersApi()
const invitesApi = useWorkspaceInvitesApi()

const members = ref<WorkspaceMemberDto[]>([])
const invites = ref<WorkspaceInviteDto[]>([])
const loading = ref(false)

// Делегаты:
const currentRole = permissions.currentRole
const canManageInvites = permissions.canManageInvites
const canManageMembers = computed(() =>
  permissions.canManageInvites.value || permissions.canManageAdmins.value,
)
const canManageAdmins = permissions.canManageAdmins
const getAssignableRoles = permissions.getAssignableRoles
const canRemoveMember = permissions.canRemoveMember
```

(Оставшаяся логика — `loadAll`, `inviteMember`, `revokeInvite`, и т.д. — без изменений.)

В `return {}` добавить новые имена:

```ts
return {
  members,
  invites,
  loading,
  currentRole,
  canManageMembers,
  canManageInvites,
  canManageAdmins,
  getAssignableRoles,
  canRemoveMember,
  loadAll,
  inviteMember,
  revokeInvite,
  updateMemberRole,
  removeMember,
  transferOwnership,
}
```

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 3.2: Скрыть Invites Section для editor/viewer

- [ ] **Step 1: Обновить `lib-modules/team/components/sections/InvitesSection.vue`**

В `<script setup>` подтянуть гейт:

```ts
import { useTeam } from '../../composables/useTeam'
const { canManageInvites } = useTeam()
```

(Или через props — посмотреть, как родитель сейчас передаёт состояние; если родитель передаёт props, добавить prop `canManageInvites: boolean`. Иначе импортить напрямую.)

В шаблоне на корневом уровне обернуть всю секцию:

```vue
<template>
  <section v-if="canManageInvites">
    <!-- существующий контент секции -->
  </section>
</template>
```

(Альтернативно: гейт ставится в **родительском** компоненте `TeamPage.vue` через `<InvitesSection v-if="canManageInvites" />`. Это даже чище — выбрать ту версию, которая не требует переподключать данные внутри секции, если её всё равно не покажут. Скорее всего родитель — `TeamPage.vue`. Проверить и сделать там.)

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 3.3: Гейтить Members Section (роли + remove)

- [ ] **Step 1: Обновить `lib-modules/team/components/sections/MembersSection.vue`**

В `<script setup>` добавить:

```ts
import { useTeam } from '../../composables/useTeam'
const { getAssignableRoles, canRemoveMember } = useTeam()
```

В рендере каждой строки участника:

**Дропдаун ролей**: вместо безусловного `<Select>` со всеми вариантами — рендерить только роли из `getAssignableRoles(member)`. Если массив пустой — показать обычный текст с текущей ролью без выпадайки.

```vue
<template v-for="member in members" :key="member.userId">
  <!-- ... остальная инфа участника ... -->

  <template v-if="getAssignableRoles(member).length > 0">
    <Select :model-value="member.role" @update:model-value="(v) => onRoleChange(member, v)">
      <SelectTrigger class="...">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="r in getAssignableRoles(member)"
          :key="r"
          :value="r"
        >
          {{ ROLE_LABELS[r] }}
        </SelectItem>
      </SelectContent>
    </Select>
  </template>
  <span v-else class="text-sm text-muted-foreground">
    {{ ROLE_LABELS[member.role] }}
  </span>

  <Button
    v-if="canRemoveMember(member)"
    variant="ghost"
    size="icon"
    @click="onRemoveMember(member)"
  >
    <Trash2 class="h-4 w-4" />
  </Button>
</template>
```

`ROLE_LABELS` повторно определять не нужно — экспортнуть из `RoleBadge.vue` либо из `lib-modules/workspaces/types` (TBD: где удобнее). Если разруливать сейчас лень — продублировать в локальной const'е секции (это 4 строки, DRY-нарушение терпимое).

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 3.4: Гейтить Transfer ownership

- [ ] **Step 1: Найти кнопку "Transfer ownership"**

Run: `grep -rn "TransferOwnership\|transferOwnership\|передать.*владел" lib-modules/team/components/`
Expected: один из компонентов — кнопка-триггер.

- [ ] **Step 2: Обернуть в `v-if="canManageAdmins"`**

В компоненте, где живёт кнопка-триггер (вероятно `TeamPage.vue` или `MembersSection.vue`):

```ts
const { canManageAdmins } = useTeam()
```

```vue
<Button v-if="canManageAdmins" @click="...">Передать владение</Button>
```

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 3.5: Browser verify

- [ ] **Step 1: Чек-лист на /app/team**

1. Под **viewer** или **editor**: страница открывается, виден список участников, **нет** секции Invites, **нет** дропдауна ролей (отображается просто текст), **нет** кнопок удаления, **нет** "Передать владение".
2. Под **admin**: видна секция Invites; в Members видны дропдауны ролей **только для viewer/editor** (admin/owner — текстом); кнопки удаления только для viewer/editor; "Передать владение" не видно.
3. Под **owner**: всё видно. Дропдаун ролей у каждого члена кроме самого себя предлагает viewer/editor/admin (не "owner"). У своей строки — текстом "Владелец", без удаления. У существующего admin — дропдаун с вариантами viewer/editor/admin (понизить до viewer/editor или оставить admin).

- [ ] **Step 2: После 'работает' — коммит**

```bash
git add lib-modules/team/composables/useTeam.ts \
        lib-modules/team/components/sections/InvitesSection.vue \
        lib-modules/team/components/sections/MembersSection.vue \
        lib-modules/team/components/TeamPage.vue
# и любые dialogs/* которые задели
git commit -m "feat(team): role-aware gating on invites + members + transfer

Editor/viewer see members read-only without invites section. Admin sees
invites + can change viewer↔editor roles. Only owner sees transfer
ownership and can manage admins."
```

---

## Phase 4 — Workspaces list page + brand brief refactor

Перерезаем `WorkspacesListPage.vue` на новые store getters, переключаем `BrandBriefSection` с `:disabled` на v-if read-only display, удаляем старый `canEdit` из store.

**Files:**
- Modify: `lib-modules/workspaces/composables/useWorkspaces.ts`
- Modify: `lib-modules/workspaces/components/WorkspacesListPage.vue`
- Modify: `lib-modules/workspaces/components/BrandBriefSection.vue`
- Modify: `lib-modules/workspaces/stores/workspacesStore.ts`

### Task 4.1: Прокинуть новые getters через `useWorkspaces`

- [ ] **Step 1: Обновить `lib-modules/workspaces/composables/useWorkspaces.ts`**

Найти строку с `canEdit` и заменить:

```ts
const canEditBrandBriefIn = (workspaceId: string) => store.canEditBrandBriefIn(workspaceId)
const canRenameWorkspaceIn = (workspaceId: string) => store.canRenameWorkspaceIn(workspaceId)
const canDeleteWorkspaceIn = (workspaceId: string) => store.canDeleteWorkspaceIn(workspaceId)
```

В `return {}` блок: убрать старый `canEdit`, добавить три новых.

### Task 4.2: Перерезать `WorkspacesListPage.vue`

- [ ] **Step 1: Импорты**

```ts
const {
  workspaces, loading, initialize, createWorkspace, updateWorkspace, deleteWorkspace,
  canEditBrandBriefIn, canRenameWorkspaceIn, canDeleteWorkspaceIn,
} = useWorkspaces()
```

(Удалить старый `canEdit`.)

- [ ] **Step 2: Кнопка delete (около line 441)**

Было: `v-if="canEdit(w.id)"` → стало: `v-if="canDeleteWorkspaceIn(w.id)"`.

- [ ] **Step 3: Поле имени воркспейса (около line 469)**

Было: `<Input ... :disabled="!canEdit(w.id)" />`. Поскольку viewer/editor вообще не могут переименовывать, по матрице — НЕ показываем поле, если `!canRenameWorkspaceIn`. Заменить:

```vue
<div class="space-y-2">
  <Label :for="`name-${w.id}`">
    {{ t_('addClient.brandName') }}
    <span v-if="canRenameWorkspaceIn(w.id)" class="text-red-500">*</span>
  </Label>
  <Input
    v-if="canRenameWorkspaceIn(w.id)"
    :id="`name-${w.id}`"
    v-model="drafts[w.id].name"
  />
  <p v-else class="text-sm text-foreground py-1.5">{{ drafts[w.id].name || '—' }}</p>
</div>
```

- [ ] **Step 4: Brand brief**

```vue
<BrandBriefSection
  :ref="(el) => { briefRefs[w.id] = el as BriefSectionRef | null }"
  :id-prefix="w.id"
  :draft="drafts[w.id]"
  :can-edit="canEditBrandBriefIn(w.id)"
/>
```

(Просто меняем источник с `canEdit(w.id)` на новый.)

- [ ] **Step 5: Кнопка save**

Кнопка save должна включаться, если **что-то** в драфте редактируемо текущей ролью **и** есть изменения. Простейший вариант — считать суперсетом:

```vue
<Button
  size="sm"
  class="gap-2"
  :disabled="
    !(canRenameWorkspaceIn(w.id) || canEditBrandBriefIn(w.id))
    || !isDirty(w)
    || savingId === w.id
  "
  @click="saveDraft(w)"
>...</Button>
```

(viewer не получает save вообще — никакие поля не редактируемы.)

Дополнительно `saveDraft` сам проверяет: PATCH идёт только по полям, которые юзер реально может править. Поскольку нередактируемые поля у него и не могли измениться (формы нет), backend получит правильный набор полей.

- [ ] **Step 6: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 4.3: Переписать `BrandBriefSection.vue` на v-if read-only

- [ ] **Step 1: Заменить `:disabled="!canEdit"` на условный рендер**

В `lib-modules/workspaces/components/BrandBriefSection.vue` для каждого инпут-блока:

было (примерно):

```vue
<Input v-model="draft.industry" :disabled="!canEdit" />
```

стало:

```vue
<Input v-if="canEdit" v-model="draft.industry" />
<p v-else class="text-sm text-foreground py-1.5">{{ draft.industry || '—' }}</p>
```

То же для каждого поля (industry, businessDescription, targetAudience, toneOfVoice, stopWords, examplePosts).

Для textarea / multi-line:

```vue
<Textarea v-if="canEdit" v-model="draft.businessDescription" />
<p v-else class="text-sm text-foreground whitespace-pre-wrap">{{ draft.businessDescription || '—' }}</p>
```

Для тегов (stopWords, если в виде chip-input):

```vue
<TagInput v-if="canEdit" v-model="draft.stopWords" />
<div v-else class="flex flex-wrap gap-1.5">
  <span v-for="t in draft.stopWords" :key="t" class="px-2 py-0.5 text-xs rounded bg-muted">{{ t }}</span>
  <span v-if="!draft.stopWords?.length" class="text-sm text-muted-foreground">—</span>
</div>
```

(Точное совпадение с UX будет варьироваться по полю — главное правило: при `!canEdit` инпуты не рендерятся, вместо них отображается значение.)

- [ ] **Step 2: Type-check + visual verify в storybook/dev**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 4.4: Удалить старый `canEdit` из store

- [ ] **Step 1: Убрать getter `canEdit` из `lib-modules/workspaces/stores/workspacesStore.ts`**

Удалить блок:

```ts
canEdit: (state) => (workspaceId: string): boolean => {
  ...
},
```

- [ ] **Step 2: Найти оставшихся потребителей**

Run: `grep -rn "\.canEdit\|canEdit(" lib-modules/ pages/ scripts/` (исключая `BrandBriefSection.vue` где `canEdit` это **prop**)
Expected: ноль ссылок (кроме prop-определения внутри BrandBriefSection).

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 4.5: Browser verify

- [ ] **Step 1: Чек-лист на /app/workspaces**

(Воркспейсы здесь все, для каждого — своя роль. Проверять отдельно для воркспейсов, где юзер в разной роли.)

1. Воркспейс, где юзер **owner**: видны все поля как input'ы (имя редактируется, brief полностью), кнопка delete видна, save работает.
2. Воркспейс, где юзер **admin**: имя — input, brief — полностью редактируется, **delete-кнопки нет**.
3. Воркспейс, где юзер **editor**: **имя — текстом** (не input), brief — input'ы, save работает (только по brief полям), delete нет.
4. Воркспейс, где юзер **viewer**: имя — текст, brief — текстом (всё read-only), кнопки save нет (всё disabled), delete нет.

- [ ] **Step 2: После 'работает' — коммит**

```bash
git add lib-modules/workspaces/composables/useWorkspaces.ts \
        lib-modules/workspaces/components/WorkspacesListPage.vue \
        lib-modules/workspaces/components/BrandBriefSection.vue \
        lib-modules/workspaces/stores/workspacesStore.ts
git commit -m "refactor(workspaces): split canEdit into per-action getters

Existing canEdit (=owner|admin) didn't match new matrix: editor must edit
brand brief, delete is owner-only. Replaced with three per-workspace
getters used in /app/workspaces page. BrandBriefSection switched from
:disabled to v-if read-only display."
```

---

## Phase 5 — Content calendar gating

Гейтим CTA на календаре: создание поста, редактирование/удаление/публикация в превью, привязка/отвязка соц-аккаунтов.

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`
- Modify: `lib-modules/content-calendar/components/PostPreviewPanel.vue`
- Modify: `lib-modules/content-calendar/components/DayCell.vue`
- Modify: `lib-modules/content-calendar/components/DayDetailPanel.vue`
- Modify: `lib-modules/content-calendar/components/AccountsSidebar.vue`
- Modify: `lib-modules/content-calendar/components/SidebarContainer.vue` (если есть CTA)

### Task 5.1: ContentCalendarPage CTA

- [ ] **Step 1: Найти кнопки "Создать пост"/"+ Добавить" в `ContentCalendarPage.vue`**

Run: `grep -n "Создать\|Добавить\|+ \|@click" lib-modules/content-calendar/components/ContentCalendarPage.vue`

- [ ] **Step 2: Подтянуть permissions, обернуть кнопки в v-if**

```ts
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
const { canManagePosts, canManageSocialAccounts } = useWorkspacePermissions()
```

Каждая мутирующая кнопка → `<Button v-if="canManagePosts" ...>`.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 5.2: PostPreviewPanel

- [ ] **Step 1: Гейтить мутирующие кнопки в `PostPreviewPanel.vue`**

```ts
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
const { canManagePosts } = useWorkspacePermissions()
```

Кнопки edit / delete / publish / schedule / "Открыть в редакторе" → каждая под `v-if="canManagePosts"`. Превью контента (текст, медиа, статус, дата) **остаются** — это read-only данные.

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 5.3: DayCell + DayDetailPanel

- [ ] **Step 1: Скрыть quick-create CTA в `DayCell.vue` / `DayDetailPanel.vue`**

```ts
const { canManagePosts } = useWorkspacePermissions()
```

Любая кнопка/инлайн-CTA "+ добавить пост на этот день" → `v-if="canManagePosts"`. Показ существующих постов остаётся.

- [ ] **Step 2: Type-check**

### Task 5.4: AccountsSidebar

- [ ] **Step 1: Гейтить add/unlink в `AccountsSidebar.vue`**

```ts
const { canManageSocialAccounts } = useWorkspacePermissions()
```

Кнопки "Привязать аккаунт" и "Отвязать" → под `v-if="canManageSocialAccounts"`. Список привязанных аккаунтов остаётся видимым.

- [ ] **Step 2: Type-check**

### Task 5.5: SidebarContainer (если применимо)

- [ ] **Step 1: Проверить наличие мутирующих CTA**

Run: `grep -n "@click\|Button" lib-modules/content-calendar/components/SidebarContainer.vue`

Если найдены CTA, требующие записи (новый пост, теги и т.п.) — гейтить под `canManagePosts`. Если только навигация/фильтры — пропустить.

### Task 5.6: Browser verify

- [ ] **Step 1: Чек-лист на /app/calendar**

1. **viewer**: посты видны на календаре, превью открывается без кнопок edit/delete/publish, нет "+ добавить", нет привязки соц-аккаунтов.
2. **editor**: создание/редактирование/удаление/публикация постов доступны; **нет** управления соц-аккаунтами.
3. **admin** / **owner**: всё доступно.

- [ ] **Step 2: После 'работает' — коммит**

```bash
git add lib-modules/content-calendar/components/ContentCalendarPage.vue \
        lib-modules/content-calendar/components/PostPreviewPanel.vue \
        lib-modules/content-calendar/components/DayCell.vue \
        lib-modules/content-calendar/components/DayDetailPanel.vue \
        lib-modules/content-calendar/components/AccountsSidebar.vue \
        lib-modules/content-calendar/components/SidebarContainer.vue
git commit -m "feat(calendar): role-aware gating on post + social account CTAs

Hides post create/edit/delete/publish buttons for viewer; hides social
account linking for non-admin. Read-only content (post previews,
account list) remains visible."
```

---

## Phase 6 — Editor page guard

Финальная узкая фаза: страница редактора защищается page-level guard'ом, чтобы viewer, ткнувший в URL вручную, видел "Нет доступа", а не пустую/сломанную форму.

**Files:**
- Modify: `pages/app/editor/[[postId]].vue`

### Task 6.1: NoAccessState в editor page

- [ ] **Step 1: Обновить `pages/app/editor/[[postId]].vue`**

В `<script setup>`:

```ts
import { useWorkspacePermissions, NoAccessState } from '~/lib-modules/workspaces'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const { canManagePosts } = useWorkspacePermissions()
const { isReady } = useWorkspaceContext()
```

В шаблоне обернуть текущее содержимое:

```vue
<template>
  <!-- skeleton пока workspace context загружается -->
  <div v-if="!isReady" class="min-h-screen" />
  <NoAccessState v-else-if="!canManagePosts" />
  <template v-else>
    <!-- существующая разметка страницы -->
  </template>
</template>
```

(Если у страницы один корень — обернуть его в `<template v-else>`. Если несколько — `<div v-else>` или fragment-`template v-else`.)

- [ ] **Step 2: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: без ошибок.

### Task 6.2: Browser verify

- [ ] **Step 1: Чек-лист**

1. **viewer**: открыть `/app/editor/<любой существующий postId>` руками → "Нет доступа" + кнопка возврата.
2. **editor / admin / owner**: страница открывается как раньше.
3. Refresh страницы под viewer — пока `currentWorkspace` грузится, виден пустой контейнер (skeleton placeholder); после загрузки — "Нет доступа". Не моргает.

- [ ] **Step 2: После 'работает' — коммит**

```bash
git add pages/app/editor/\[\[postId\]\].vue
git commit -m "feat(editor): role guard with NoAccessState for non-editors

Direct URL access by viewer renders 'Нет доступа' instead of empty
form. Skeleton placeholder during workspace context load avoids flash."
```

---

## Self-review — coverage сверка с спеком

| Spec section | Phase / Task |
|---|---|
| Permission matrix (15 строк) | Phase 1 (composable + tests) — все правила покрыты в `useWorkspacePermissions` + tests |
| Composable `useWorkspacePermissions()` | Phase 1.2 |
| Per-target хелперы `getAssignableRoles` / `canRemoveMember` | Phase 1.2 + tests Phase 1.3 |
| Refactor `useTeam` | Phase 3.1 |
| BrandBriefSection switch to v-if read-only | Phase 4.3 |
| Workspaces store split `canEdit` → 3 getters | Phase 1.1 (add new) + Phase 4.4 (remove old) |
| WorkspacesListPage rewire | Phase 4.2 |
| InvitesSection v-if | Phase 3.2 |
| MembersSection role dropdown / remove | Phase 3.3 |
| TransferOwnership trigger | Phase 3.4 |
| ContentCalendarPage / PostPreviewPanel / DayCell / DayDetailPanel / AccountsSidebar / SidebarContainer | Phase 5.1–5.5 |
| Editor page guard | Phase 6.1 |
| Activity log page guard | Phase 2.3 |
| Sidebar filter (`requiresPermission`) | Phase 2.1, 2.2 |
| NoAccessState component | Phase 1.4 |
| RoleBadge component | Phase 1.5 |
| RoleBadge in AppNavbar (current + dropdown) | Phase 2.4 |
| Не трогаем conversations / imageGenerator / profile / plans / scripts | — (явно не упомянуты в задачах) |

**Edge cases coverage**:
- Owner смотрит свою строку: `getAssignableRoles(self) = []`, `canRemoveMember(self) = false` — закрыто Phase 1.3 тестами + Phase 3.3 рендер.
- Смена воркспейса: composable реактивен — Phase 1.2.
- Refresh / прямой URL: skeleton до `isReady` — Phase 6.1; activity log тоже использует тот же паттерн (можно добавить в Phase 2.3 если выяснится мерцание; сейчас в matrix.activity-log на момент монтирования useActivityLog уже опирается на workspaceId из ctx).
- Stale role: defense in depth через 403-handler в `ApiController` — изменений не нужно.

**Non-goals respected**:
- Без middleware-роутинга — page-level guard внутри компонента (Phase 2.3, 6.1).
- Без real-time sync ролей.
- Без visual hint о read-only — просто скрываем.
- Только `lib-modules/`, `scripts/` не трогаем.

Гэпов нет.

---

## Execution

После каждой фазы — **юзер тестирует в браузере**, и только после "работает" — коммитим. Это критично (см. memory `feedback_dont_auto_commit`).
