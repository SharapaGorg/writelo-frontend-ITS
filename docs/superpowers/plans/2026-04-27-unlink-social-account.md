# Отвязка соц. аккаунта — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить UI отвязки соц. аккаунта в трёх местах потребления: AccountsSidebar (calendar/editor) — через правый клик, BrandAccountsSection (workspaces page) — через 3-точечную кнопку. Везде с AlertDialog-подтверждением.

**Architecture:** Новый action `unlinkAccount(accountId)` в `contentProjectStore` (pessimistic, по образцу `deletePost`). Эндпоинт `DELETE /workspaces/{id}/social-accounts/{id}` уже есть как `ContentCalendarApiController.deleteSocialAccount`. AccountsSidebar и BrandAccountsSection эмитят `unlink: accountId`, parent-компоненты держат локальный `pendingUnlink` стейт + AlertDialog. `activeAccountIds` в useContentCalendar чистится автоматически существующим watcher-ом, в editor-е чистим `selectedAccountId` руками.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Pinia, Tailwind, shadcn-vue (`@/components/ui/{context-menu,dropdown-menu,alert-dialog,button}`), `vue-sonner`, `lucide-vue-next`.

**Spec:** `docs/superpowers/specs/2026-04-27-unlink-social-account-design.md`

**Verification gate:** ручной smoke-тест на трёх поверхностях через юзеровский `yarn dev` :3000.

---

## Task 1: Store action `unlinkAccount`

**Files:**
- Modify: `lib-modules/content-calendar/stores/contentProjectStore.ts`

- [ ] **Step 1.1:** Добавить action.

В `contentProjectStore.ts` найти `async function createTag(...)` (около строки 224) и сразу ПЕРЕД ней добавить:

```ts
async function unlinkAccount(accountId: string): Promise<boolean> {
  const project = currentProject.value
  if (!project) return false
  const idx = project.accounts.findIndex(a => a.id === accountId)
  if (idx === -1) return false

  if (isDemo.value) {
    project.accounts.splice(idx, 1)
    return true
  }

  const workspaceId = context.currentWorkspaceId.value
  if (!workspaceId) return false

  try {
    await api.deleteSocialAccount(workspaceId, accountId)
    project.accounts.splice(idx, 1)
    return true
  } catch (e) {
    console.error('[contentProjectStore] unlinkAccount failed:', e)
    return false
  }
}
```

- [ ] **Step 1.2:** Экспортировать.

Найти `return { ... createTag, }` (около строки 268) и добавить `unlinkAccount` в список экспортов:

```ts
  return {
    // State
    projects,
    selectedProjectId,
    loading,
    isDemo,
    // Computed
    currentProject,
    currentProjectAccounts,
    // Actions
    enableDemoMode,
    disableDemoMode,
    selectProject,
    fetchProjectData,
    updatePost,
    updatePostLocal,
    createPost,
    deletePost,
    createTag,
    unlinkAccount,
  }
```

- [ ] **Step 1.3:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep contentProjectStore
```

Ожидаемо: 0 строк (нет новых ошибок в этом файле).

---

## Task 2: AccountsSidebar — ContextMenu

**Files:**
- Modify: `lib-modules/content-calendar/components/AccountsSidebar.vue`

- [ ] **Step 2.1:** Добавить импорты.

В `<script setup>` после строки `import { Plus } from 'lucide-vue-next'` добавить `Trash2`:

```ts
import { Plus, Trash2 } from 'lucide-vue-next'
```

После импорта `useWorkspaceContext` добавить:

```ts
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu'
```

- [ ] **Step 2.2:** Добавить emit `unlink`.

Найти существующий блок:
```ts
const emit = defineEmits<{
  toggle: [accountId: string]
  select: [accountId: string]
}>()
```

Заменить на:
```ts
const emit = defineEmits<{
  toggle: [accountId: string]
  select: [accountId: string]
  unlink: [accountId: string]
}>()
```

- [ ] **Step 2.3:** Обернуть кнопку чипа в ContextMenu.

В `<template>` найти `<button v-for="account in accounts" ...>` и заменить весь блок этого `<button ...>...</button>` на:

```vue
<ContextMenu v-for="account in accounts" :key="account.id">
  <ContextMenuTrigger as-child>
    <button
      :class="[
        'w-full rounded-md border-2 transition-all flex items-center gap-3 p-3',
        isActive(account.id)
          ? `${networkConfig[account.network].bgActive} text-white shadow-md`
          : 'bg-card border-border text-muted-foreground hover:border-border'
      ]"
      :title="account.username"
      @click="props.singleSelect ? emit('select', account.id) : emit('toggle', account.id)"
    >
      <!-- VK icon -->
      <svg v-if="account.network === 'vk'" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
      </svg>
      <!-- YouTube icon -->
      <svg v-else-if="account.network === 'youtube'" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <!-- Telegram icon -->
      <svg v-else-if="account.network === 'telegram'" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      <!-- Instagram icon -->
      <svg v-else-if="account.network === 'instagram'" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>

      <span class="text-sm font-medium truncate">
        {{ account.name }}
      </span>
    </button>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem class="text-destructive focus:text-destructive" @click="emit('unlink', account.id)">
      <Trash2 class="mr-2 h-4 w-4" />
      Отвязать
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

Атрибут `v-for` и `:key` теперь на `<ContextMenu>`, на самом `<button>` их быть не должно.

- [ ] **Step 2.4:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep AccountsSidebar
```

Ожидаемо: 0 строк новых ошибок.

---

## Task 3: ContentCalendarPage — wire AlertDialog + handler

**Files:**
- Modify: `lib-modules/content-calendar/components/ContentCalendarPage.vue`

- [ ] **Step 3.1:** Импорты.

В `<script setup>` найти существующие импорты (после `import AccountsSidebar from './AccountsSidebar.vue'`). Добавить (если каких-то нет):

```ts
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useContentProjectStore } from '../stores/contentProjectStore'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import type { SocialAccount } from '../types'
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
```

> Импорты `ref` и `toast` могут уже быть. Проверить грепом перед вставкой; добавлять только то, чего нет.

- [ ] **Step 3.2:** Добавить state и handlers.

В блоке скрипта после блока деструктуризации `useContentCalendar()` добавить:

```ts
const projectStore = useContentProjectStore()
const pendingUnlink = ref<SocialAccount | null>(null)

function onUnlinkRequest(accountId: string) {
  const acc = currentProject.value?.accounts.find(a => a.id === accountId)
  if (!acc) return
  pendingUnlink.value = acc
}

async function confirmUnlink() {
  const acc = pendingUnlink.value
  if (!acc) return
  pendingUnlink.value = null
  const ok = await projectStore.unlinkAccount(acc.id)
  if (ok) {
    toast.success('Аккаунт отвязан', { position: getToasterPosition() })
  } else {
    toast.error('Не получилось отвязать аккаунт', { position: getToasterPosition() })
  }
}
```

> `currentProject` уже деструктуризован из `useContentCalendar()` (см. строки 28-33 файла). Если нет — добавить в существующую деструктуризацию.

`activeAccountIds` чистить вручную НЕ надо — в `useContentCalendar.ts:42-49` уже стоит watcher, который удаляет id из `activeAccountIds` когда аккаунт исчезает из `currentProject.accounts`.

- [ ] **Step 3.3:** Подключить `@unlink` к AccountsSidebar.

Найти в template (около строки 507):
```vue
<AccountsSidebar
  :accounts="(currentProject?.accounts ?? [])"
  :active-account-ids="activeAccountIds"
  @toggle="toggleAccount"
/>
```

Заменить на:
```vue
<AccountsSidebar
  :accounts="(currentProject?.accounts ?? [])"
  :active-account-ids="activeAccountIds"
  @toggle="toggleAccount"
  @unlink="onUnlinkRequest"
/>
```

- [ ] **Step 3.4:** Добавить AlertDialog в template.

Найти закрывающий тег корневого контейнера страницы (последний `</div>` или `</template>`). Прямо перед ним вставить:

```vue
<AlertDialog
  :open="pendingUnlink !== null"
  @update:open="(v) => { if (!v) pendingUnlink = null }"
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Отвязать аккаунт?</AlertDialogTitle>
      <AlertDialogDescription>
        Канал «{{ pendingUnlink?.name }}» будет отвязан от бренда. Запланированные публикации в него не пройдут.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Отмена</AlertDialogCancel>
      <AlertDialogAction
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        @click="confirmUnlink"
      >
        Отвязать
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 3.5:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep ContentCalendarPage
```

Ожидаемо: 0 строк новых ошибок.

---

## Task 4: ContentEditorLayout — wire AlertDialog + handler

**Files:**
- Modify: `lib-modules/content-editor/components/ContentEditorLayout.vue`

- [ ] **Step 4.1:** Импорты.

В `<script setup>` после существующих импортов добавить (только то, чего ещё нет — проверять грепом):

```ts
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useContentProjectStore } from '~/lib-modules/content-calendar/stores/contentProjectStore'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import type { SocialAccount } from '~/lib-modules/content-calendar/types'
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
```

- [ ] **Step 4.2:** State и handlers.

В блоке скрипта после деструктуризации `useContentEditor()` (около строки 26) добавить:

```ts
const projectStore = useContentProjectStore()
const pendingUnlink = ref<SocialAccount | null>(null)

function onUnlinkRequest(accountId: string) {
  const acc = currentProjectAccounts.value.find(a => a.id === accountId)
  if (!acc) return
  pendingUnlink.value = acc
}

async function confirmUnlink() {
  const acc = pendingUnlink.value
  if (!acc) return
  pendingUnlink.value = null
  // Если отвязываем выбранный сейчас аккаунт — сбрасываем выбор, иначе UI остаётся в состоянии «выбран несуществующий»
  if (selectedAccountId.value === acc.id) {
    selectAccount(null as unknown as string)
  }
  const ok = await projectStore.unlinkAccount(acc.id)
  if (ok) {
    toast.success('Аккаунт отвязан', { position: getToasterPosition() })
  } else {
    toast.error('Не получилось отвязать аккаунт', { position: getToasterPosition() })
  }
}
```

> `selectAccount` принимает `string`, но при unlink выбранного хочется обнулить. Если в `contentEditorStore` тип `selectAccount` не допускает `null`, достаточно `selectAccount('')` или провести типовую правку. Проверить сигнатуру `store.selectAccount` в `lib-modules/content-editor/stores/contentEditorStore.ts` — если она допускает `null`, передать `null`. Если не допускает — изменить тип параметра на `string | null` и обновить тело (там скорее всего просто `selectedAccountId.value = id`).

- [ ] **Step 4.3:** Подключить `@unlink` к AccountsSidebar.

Найти в template (около строки 93):
```vue
<AccountsSidebar
  v-if="!props.showcaseMode"
  :accounts="currentProjectAccounts"
  :selected-account-id="selectedAccountId ?? undefined"
  :single-select="true"
  @select="selectAccount"
/>
```

Добавить `@unlink`:
```vue
<AccountsSidebar
  v-if="!props.showcaseMode"
  :accounts="currentProjectAccounts"
  :selected-account-id="selectedAccountId ?? undefined"
  :single-select="true"
  @select="selectAccount"
  @unlink="onUnlinkRequest"
/>
```

- [ ] **Step 4.4:** AlertDialog в template.

Перед закрывающим корневым тегом template вставить:

```vue
<AlertDialog
  :open="pendingUnlink !== null"
  @update:open="(v) => { if (!v) pendingUnlink = null }"
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Отвязать аккаунт?</AlertDialogTitle>
      <AlertDialogDescription>
        Канал «{{ pendingUnlink?.name }}» будет отвязан от бренда. Запланированные публикации в него не пройдут.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Отмена</AlertDialogCancel>
      <AlertDialogAction
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        @click="confirmUnlink"
      >
        Отвязать
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 4.5:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep ContentEditorLayout
```

Ожидаемо: 0 строк новых ошибок (или только связанные с `selectAccount(null)` если не правил тип).

---

## Task 5: BrandAccountsSection — DropdownMenu c 3 точками

**Files:**
- Modify: `lib-modules/workspaces/components/BrandAccountsSection.vue`

- [ ] **Step 5.1:** Импорты.

В `<script setup>` найти `import { Loader2, Plus } from 'lucide-vue-next'` и заменить на:

```ts
import { Loader2, Plus, MoreVertical, Trash2 } from 'lucide-vue-next'
```

После импорта `Label` добавить:

```ts
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
```

- [ ] **Step 5.2:** Добавить emits.

После `defineProps<{...}>()` добавить:

```ts
const emit = defineEmits<{
  unlink: [accountId: string]
}>()
```

- [ ] **Step 5.3:** Добавить 3-точечную кнопку внутри чипа.

Найти в template блок с чипом (около строки 44):
```vue
<div
  v-for="a in accounts"
  :key="a.id"
  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-muted/30"
>
```

Внутри этого `<div>` после `<span v-if="a.username" ...>{{ a.username }}</span>` (около строки 74) добавить меню перед закрывающим `</div>` чипа:

```vue
<DropdownMenu>
  <DropdownMenuTrigger as-child>
    <button
      type="button"
      class="ml-1 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Действия с аккаунтом"
    >
      <MoreVertical class="h-3.5 w-3.5" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem class="text-destructive focus:text-destructive" @click="emit('unlink', a.id)">
      <Trash2 class="mr-2 h-4 w-4" />
      Отвязать
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

- [ ] **Step 5.4:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep BrandAccountsSection
```

Ожидаемо: 0 строк новых ошибок.

---

## Task 6: WorkspacesListPage — wire AlertDialog + handler

**Files:**
- Modify: `lib-modules/workspaces/components/WorkspacesListPage.vue`

- [ ] **Step 6.1:** Импорты.

`AlertDialog*`, `toast`, `calendarApi` (`useContentCalendarApi`), `SocialAccount` — уже импортированы. Добавлять не нужно. Проверить грепом наличие; если чего-то нет — добавить.

Импортировать `getToasterPosition` если ещё нет:

```ts
import { getToasterPosition } from '~/scripts/features/utils/toater'
```

- [ ] **Step 6.2:** State.

После строки `const deleteDialogOpen = ref(false)` (около строки 42) добавить:

```ts
const pendingUnlinkAccount = ref<{ workspaceId: string; account: SocialAccount } | null>(null)
```

- [ ] **Step 6.3:** Handlers.

После `confirmDelete()` (около строки 252) добавить:

```ts
function onAccountUnlinkRequest(workspaceId: string, accountId: string) {
  const acc = (accountsByWorkspace[workspaceId] ?? []).find(a => a.id === accountId)
  if (!acc) return
  pendingUnlinkAccount.value = { workspaceId, account: acc }
}

async function confirmAccountUnlink() {
  const p = pendingUnlinkAccount.value
  if (!p) return
  pendingUnlinkAccount.value = null
  try {
    await calendarApi.deleteSocialAccount(p.workspaceId, p.account.id)
    accountsByWorkspace[p.workspaceId] = (accountsByWorkspace[p.workspaceId] ?? [])
      .filter(a => a.id !== p.account.id)
    toast.success('Аккаунт отвязан', { position: getToasterPosition() })
  } catch (e) {
    console.error('[WorkspacesListPage] unlink account failed:', e)
    toast.error('Не получилось отвязать аккаунт', { position: getToasterPosition() })
  }
}
```

- [ ] **Step 6.4:** Подключить `@unlink` к BrandAccountsSection.

Найти в template (строки 415-420):
```vue
<BrandAccountsSection
  :workspace-id="w.id"
  :accounts="accountsByWorkspace[w.id] ?? []"
  :loading="accountsLoading[w.id] === true"
  :loaded="accountsLoaded[w.id] === true"
/>
```

Заменить на:
```vue
<BrandAccountsSection
  :workspace-id="w.id"
  :accounts="accountsByWorkspace[w.id] ?? []"
  :loading="accountsLoading[w.id] === true"
  :loaded="accountsLoaded[w.id] === true"
  @unlink="(id) => onAccountUnlinkRequest(w.id, id)"
/>
```

- [ ] **Step 6.5:** Второй AlertDialog в template.

После существующего `<AlertDialog v-model:open="deleteDialogOpen">...</AlertDialog>` (около строки 485) добавить новый:

```vue
<AlertDialog
  :open="pendingUnlinkAccount !== null"
  @update:open="(v) => { if (!v) pendingUnlinkAccount = null }"
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Отвязать аккаунт?</AlertDialogTitle>
      <AlertDialogDescription>
        Канал «{{ pendingUnlinkAccount?.account.name }}» будет отвязан от бренда. Запланированные публикации в него не пройдут.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>{{ t_('cancel') }}</AlertDialogCancel>
      <AlertDialogAction
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        @click="confirmAccountUnlink"
      >
        Отвязать
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- [ ] **Step 6.6:** TS-проверка.

```bash
node_modules/.bin/vue-tsc.cmd --noEmit 2>&1 | grep WorkspacesListPage
```

Ожидаемо: 0 строк новых ошибок.

---

## Task 7: Smoke-тест в браузере

> Юзеровский `yarn dev` :3000. Свой не поднимать.

- [ ] **Step 7.1:** Calendar — правый клик на чип аккаунта.

Открыть `/app/calendar`, дождаться загрузки чипов в левом сайдбаре, кликнуть правой кнопкой на любом аккаунте.

Что ожидаем:
- Появляется ContextMenu с пунктом «Отвязать» (красный, с иконкой Trash2).
- Клик «Отвязать» → AlertDialog «Отвязать аккаунт?» с именем канала в описании.
- «Отмена» → диалог закрывается, ничего не меняется.
- «Отвязать» → один `DELETE /workspaces/{id}/social-accounts/{accountId}` в Network, на 200 — toast «Аккаунт отвязан», чип исчезает из сайдбара, посты от этого аккаунта пропадают из календаря (фильтр `activeAccountIds` чистится автоматически).

- [ ] **Step 7.2:** Editor — правый клик на чип.

Открыть `/app/content-editor` (или путь, по которому `ContentEditorLayout` рендерится — проверить в `pages/`), повторить тест.

Что ожидаем:
- То же что в 7.1, плюс: если отвязываем аккаунт, который сейчас выбран (single-select подсветка) — выбор сбрасывается, ни один чип не активен.

- [ ] **Step 7.3:** Workspaces — 3-точечная кнопка на чипе.

Открыть `/app/workspaces`, развернуть карточку бренда, в секции «Подключённые аккаунты» — у каждого чипа должна быть маленькая 3-точечная кнопка справа от имени. Клик по ней.

Что ожидаем:
- Появляется DropdownMenu с пунктом «Отвязать».
- Клик → AlertDialog «Отвязать аккаунт?» с именем канала.
- Подтверждение → `DELETE` в Network, toast, чип исчезает из секции.

- [ ] **Step 7.4:** Error path (опционально).

Если есть возможность залочить `DELETE` через DevTools (Network → Block request URL) — повторить любой из 7.1-7.3.

Что ожидаем:
- Запрос фейлится, toast «Не получилось отвязать аккаунт», чип ОСТАЁТСЯ в списке (pessimistic).

- [ ] **Step 7.5:** Сообщить юзеру и ждать команды на коммит.

---

## Task 8: Коммит

- [ ] **Step 8.1:** После явного подтверждения юзера закоммитить.

```bash
git add lib-modules/content-calendar/stores/contentProjectStore.ts \
        lib-modules/content-calendar/components/AccountsSidebar.vue \
        lib-modules/content-calendar/components/ContentCalendarPage.vue \
        lib-modules/content-editor/components/ContentEditorLayout.vue \
        lib-modules/workspaces/components/BrandAccountsSection.vue \
        lib-modules/workspaces/components/WorkspacesListPage.vue \
        docs/superpowers/specs/2026-04-27-unlink-social-account-design.md \
        docs/superpowers/plans/2026-04-27-unlink-social-account.md
git commit -m "$(cat <<'EOF'
feat(social-accounts): add unlink UI in calendar/editor sidebar and brand cards

Right-click ContextMenu on account chips in AccountsSidebar (calendar/editor),
3-dot DropdownMenu on chips in BrandAccountsSection (workspaces page). Both
flows go through an AlertDialog confirmation and call existing
ContentCalendarApiController.deleteSocialAccount. Pessimistic state update
via new contentProjectStore.unlinkAccount action.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

> Если на момент коммита всё ещё не закоммичена TG-link миграция (см. план `2026-04-27-telegram-link-migration.md`) — добавить и её файлы в `git add` одной строкой; обе фичи логически связаны (соц. аккаунты).

---

## Self-review

**Spec coverage:**
- «Решения / Триггер в (1)» (ContextMenu, правый клик) → Task 2. ✓
- «Решения / Триггер в (2)» (DropdownMenu, 3 точки) → Task 5. ✓
- «Решения / Подтверждение» (AlertDialog инлайн в каждом потребителе) → Tasks 3, 4, 6. ✓
- «Решения / Pessimistic» — Task 1 store action: `await api.delete(...)` ДО `splice`. ✓
- «Решения / Где живёт мутация для (1)» — `contentProjectStore.unlinkAccount` → Task 1. ✓
- «Решения / Где живёт мутация для (2)» — inline в `WorkspacesListPage` → Task 6. ✓
- «Решения / Чистка `activeAccountIds`» — автоматически через существующий watcher в `useContentCalendar.ts:42-49`. Указано в Task 3.2 коммментом. ✓
- «Решения / Копи модалки» — единый текст во всех трёх AlertDialog (Tasks 3.4, 4.4, 6.5). ✓
- «Поток / Calendar/editor» → Tasks 2 + 3 + 4. ✓
- «Поток / Brand card» → Tasks 5 + 6. ✓

**Type/имя consistency:**
- `unlinkAccount(accountId)` в Task 1 → используется в Task 3.2 и 4.2 как `projectStore.unlinkAccount(acc.id)`. ✓
- emit `unlink: [accountId: string]` в Task 2.2 → слушается как `@unlink="onUnlinkRequest"` в Task 3.3 (calendar) и 4.3 (editor). ✓
- emit `unlink: [accountId: string]` в Task 5.2 → слушается как `@unlink="(id) => onAccountUnlinkRequest(w.id, id)"` в Task 6.4. ✓
- `pendingUnlink` (calendar/editor) vs `pendingUnlinkAccount` (workspaces) — разные имена, но в разных файлах, друг другу не мешают. ✓
- `SocialAccount` тип импортируется в Tasks 3.1, 4.1 из `~/lib-modules/content-calendar/types`; в Task 6 уже импортирован в WorkspacesListPage. ✓
- `getToasterPosition` импортируется в Tasks 3.1, 4.1, 6.1 из `~/scripts/features/utils/toater`. ✓

**Caveats / open hooks:**
- Task 4.2 содержит проверку: «если `selectAccount` не принимает `null` — поправить тип». Это не placeholder — исполнитель проверяет сигнатуру и делает минимально нужное.
- Task 6.1 содержит «проверить грепом наличие; если чего-то нет — добавить» — это про defensive imports, не placeholder.

**Placeholders:** ни «TBD», ни «similar to», ни «add error handling». Каждый шаг содержит полный код для вставки.
