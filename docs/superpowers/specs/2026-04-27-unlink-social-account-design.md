# Отвязка соц. аккаунта — design

**Дата:** 2026-04-27
**Модули:** `lib-modules/content-calendar`, `lib-modules/workspaces`
**Endpoint:** `DELETE /workspaces/{workspaceId}/social-accounts/{socialAccountId}` — уже есть как `ContentCalendarApiController.deleteSocialAccount`.

## Контекст

После TG-link миграции (см. `2026-04-27-telegram-link-migration-design.md`) пользователь получает возможность привязывать каналы, но не отвязывать — UI отсутствует. Это блокирует тестирование: каждый прогон линковки расходует свежий канал.

Списки соц. аккаунтов отрисовываются в двух местах:
1. **Calendar/editor sidebar** — `lib-modules/content-calendar/components/AccountsSidebar.vue`. Чипы-кнопки, которые юзер кликает чтобы добавлять/убирать платформу из активных фильтров. Используется в `ContentCalendarPage` и `ContentEditorLayout`.
2. **Brand card в `/app/workspaces`** — `lib-modules/workspaces/components/BrandAccountsSection.vue`. Горизонтальные чипы внутри AccordionContent карточки бренда. Используется в `WorkspacesListPage`.

State лежит в двух разных местах:
- `contentProjectStore` (Pinia) — `currentProject.accounts` для (1).
- Локальный `accountsByWorkspace` map в `WorkspacesListPage` — для (2).

## Решения

| Вопрос | Решение |
|---|---|
| Триггер в (1) AccountsSidebar | shadcn `<ContextMenu>` (правый клик) на каждом чипе. Один пункт — «Отвязать». |
| Триггер в (2) BrandAccountsSection | shadcn `<DropdownMenu>` за маленькой 3-точечной кнопкой внутри чипа (справа от имени). Тот же пункт — «Отвязать». |
| Подтверждение | shadcn `<AlertDialog>` — общий паттерн, копи и обработчики локальные у parent-консумера (не выносим в отдельный компонент — два потребителя с разной state-логикой). |
| Pessimistic vs optimistic | Pessimistic: ждём 200 от DELETE, потом мутируем стейт. Без визуального флэша «удалили → вернули». Если запрос упал — toast.error, ничего не меняем. |
| Где живёт мутация для (1) | Новый action `unlinkAccount(accountId): Promise<boolean>` в `contentProjectStore` — следует паттерну `deletePost`. Возвращает успех; toast делает caller. |
| Где живёт мутация для (2) | Inline-функция в `WorkspacesListPage.vue` — у него свой локальный `accountsByWorkspace`-map, отдельный store не нужен. |
| Чистка `activeAccountIds` после unlink в (1) | Parent (Calendar/Editor pages) после успешного unlink убирает id из локального `activeAccountIds`-списка. |
| Копи модалки | Title: «Отвязать аккаунт?». Description: «Канал «{name}» будет отвязан от бренда. Запланированные публикации в него не пройдут.». Actions: «Отмена» / «Отвязать» (`variant="destructive"`). |

## Поток

### Calendar/editor (правый клик)

1. Юзер кликает правой кнопкой на чип аккаунта в `AccountsSidebar`.
2. Появляется ContextMenu с пунктом «Отвязать».
3. Клик «Отвязать» → `emit('unlink', accountId)`.
4. Parent (`ContentCalendarPage` или `ContentEditorLayout`) сохраняет `pendingUnlinkAccount: SocialAccount | null` и открывает AlertDialog.
5. Юзер подтверждает → parent зовёт `store.unlinkAccount(accountId)`:
   - Store: `await api.deleteSocialAccount(workspaceId, accountId)`; на успех `splice` из `currentProject.accounts`, `return true`. На ошибку `console.error`, `return false`.
6. Parent: на `true` — `toast.success('Аккаунт отвязан')`, чистит `activeAccountIds` от этого id. На `false` — `toast.error('Не получилось отвязать аккаунт')`.
7. Закрывает AlertDialog, обнуляет `pendingUnlinkAccount`.

### Brand card (3 точки)

1. Юзер кликает 3-точечную кнопку на чипе.
2. DropdownMenu с пунктом «Отвязать».
3. Клик «Отвязать» → `emit('unlink', accountId)`.
4. `WorkspacesListPage` сохраняет `pendingUnlinkAccount: { workspaceId; account }` и открывает AlertDialog (тот же что уже в файле для удаления бренда — переиспользуем компоненты, но не state).
5. Подтверждение → inline-handler:
   - `await api.deleteSocialAccount(workspaceId, accountId)` (через `useContentCalendarApi` или `useWorkspacesApi` — какой уже импортирован, см. реализацию).
   - На успех: фильтрация `accountsByWorkspace[workspaceId]`, `toast.success`.
   - На ошибку: `toast.error`.
6. Закрывает AlertDialog.

## Изменения по файлам

### `lib-modules/content-calendar/stores/contentProjectStore.ts`

Добавить action `unlinkAccount`:
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

Экспортировать в `return { ... unlinkAccount }`.

### `lib-modules/content-calendar/components/AccountsSidebar.vue`

- Добавить в emits: `unlink: [accountId: string]`.
- Импорт shadcn ContextMenu: `ContextMenu`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuTrigger` из `~/components/ui/context-menu`.
- Импорт `Trash2` из `lucide-vue-next`.
- Каждый `<button>` чипа обернуть:
  ```vue
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <button … (existing)>…</button>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem class="text-destructive" @click="emit('unlink', account.id)">
        <Trash2 class="mr-2 h-4 w-4" />
        Отвязать
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
  ```
- На пустой плэйсхолдер «Подключить» — без меню (там нечего отвязывать).

### `lib-modules/content-calendar/components/ContentCalendarPage.vue`

- Импорт AlertDialog из `~/components/ui/alert-dialog` (если ещё не импортирован).
- Локальный state: `const pendingUnlink = ref<SocialAccount | null>(null)`.
- Хендлер `onUnlinkRequest(accountId)`:
  - Найти аккаунт в `currentProject.accounts`, положить в `pendingUnlink`.
- Хендлер `confirmUnlink()`:
  - `const acc = pendingUnlink.value; if (!acc) return`.
  - `const ok = await store.unlinkAccount(acc.id)`.
  - На успех: `toast.success('Аккаунт отвязан')`; убрать id из `activeAccountIds`.
  - На ошибку: `toast.error('Не получилось отвязать аккаунт')`.
  - `pendingUnlink.value = null`.
- В `<AccountsSidebar @unlink="onUnlinkRequest"/>`.
- В `<template>` добавить:
  ```vue
  <AlertDialog :open="pendingUnlink !== null" @update:open="(v) => { if (!v) pendingUnlink = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Отвязать аккаунт?</AlertDialogTitle>
        <AlertDialogDescription>
          Канал «{{ pendingUnlink?.name }}» будет отвязан от бренда. Запланированные публикации в него не пройдут.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmUnlink">
          Отвязать
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```

### `lib-modules/content-editor/components/ContentEditorLayout.vue`

То же самое что в `ContentCalendarPage`: `pendingUnlink`, `onUnlinkRequest`, `confirmUnlink`, AlertDialog в template, `@unlink` на `<AccountsSidebar>`. Logic идентична. Дублирование принято — выносить в shared composable не оправдано (две точки потребления, инлайн чище).

### `lib-modules/workspaces/components/BrandAccountsSection.vue`

- Добавить emits: `unlink: [accountId: string]`.
- Импорт DropdownMenu: `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` из `~/components/ui/dropdown-menu`.
- Импорт `MoreVertical`, `Trash2` из `lucide-vue-next`.
- В каждом чипе после `<span class="text-xs text-muted-foreground...">{{ a.username }}</span>` добавить:
  ```vue
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="ml-1 -mr-0.5 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Действия"
        @click.stop
      >
        <MoreVertical class="h-3.5 w-3.5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem class="text-destructive" @click="emit('unlink', a.id)">
        <Trash2 class="mr-2 h-4 w-4" />
        Отвязать
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  ```
- Лёгкий паддинг чипа подтянуть, чтобы кнопка не ломала вертикальное выравнивание.

### `lib-modules/workspaces/components/WorkspacesListPage.vue`

- Локальный state: `const pendingUnlink = ref<{ workspaceId: string; account: SocialAccount } | null>(null)`.
- Импорт `useContentCalendarApi` (там лежит `deleteSocialAccount`) — или использовать существующий, если уже импортирован.
- Импорт `toast` из `vue-sonner`, `getToasterPosition` из `~/scripts/features/utils/toater`.
- Хендлер `onAccountUnlinkRequest(workspaceId: string, accountId: string)`:
  - Найти `account` в `accountsByWorkspace[workspaceId]`, заполнить `pendingUnlink`.
- Хендлер `confirmAccountUnlink()`:
  - `const p = pendingUnlink.value; if (!p) return`.
  - `try { await calendarApi.deleteSocialAccount(p.workspaceId, p.account.id); ...success... } catch { ...error... }`.
  - Успех: `accountsByWorkspace.value[p.workspaceId] = (accountsByWorkspace.value[p.workspaceId] ?? []).filter(a => a.id !== p.account.id); toast.success('Аккаунт отвязан')`.
  - Ошибка: `toast.error('Не получилось отвязать аккаунт')`.
  - `pendingUnlink.value = null`.
- `<BrandAccountsSection :workspace-id="w.id" ... @unlink="(id) => onAccountUnlinkRequest(w.id, id)" />`.
- Добавить в template новый `<AlertDialog>` с привязкой к `pendingUnlink` (по аналогии с уже существующим там диалогом удаления бренда — переиспользуем компоненты shadcn, но это отдельный экземпляр).

## Что НЕ делаем

- Bulk-unlink (множественный выбор).
- Soft-delete / undo через toast — backend такого режима не предусматривает.
- Refetch списка после unlink — pessimistic локальная мутация достаточна, бэк уже подтвердил DELETE.
- i18n — RU-хардкод как везде в этих компонентах.
- Generic-композабл `useUnlinkAccount(stateUpdater)` — два потребителя, не оправдано.
- Изменение state-управления (объединение `contentProjectStore.accounts` и `accountsByWorkspace` в один источник) — out of scope.

## Риски

- **Удаление аккаунта, который заюзан в запланированных постах** — UI этого не предупреждает, бэк может вернуть 400/409 с понятной формулировкой → попадёт в `toast.error('Не получилось отвязать аккаунт')`, текст бэка проигнорируется (общий tooltip). Если бэк реально шлёт `detail` с осмысленным текстом — `ApiController` уже сам toаст-ит ошибку детально (см. `controller.ts:213-238`); тогда наш `toast.error` будет дублировать. Принимаем — лучше двойной toast, чем молчание. Если ApiController покажет toast и throw — наш `toast.error` всё равно выполнится. Заметить в smoke-тесте.
- **Состояние гонки**: юзер отвязал в одной вкладке, в другой ещё видит чип и пытается его «отвязать» → DELETE вернёт 404, пойдём в catch → `toast.error`. Стейт второй вкладки при этом не очистится сам — приемлемо.
- **Отвязка активного фильтра** — после удаления `activeAccountIds` теряет id, но UI чипа уже исчезает, так что визуальный артефакт не возникает.
