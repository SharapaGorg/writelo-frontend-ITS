# Telegram channel linking — design

**Дата:** 2026-04-23
**Модуль:** `lib-modules/content-calendar` + `lib-modules/workspaces/components/ConnectAccountPage.vue`

## Контекст

В `/app/connect-account` (вход из календаря) плитка **Telegram** открывает диалог с `TelegramLoginButton(mode="link")`. Эта кнопка бьёт в `/me/link/telegram` — привязывает TG-аккаунт пользователя для **авторизации**, а не канал к воркспейсу. В самом UI так и написано: «Привязка канала к бренду в разработке».

На бекенде (API 23.04) появились реальные эндпоинты:
- `POST /workspaces/{workspaceId}/telegram/link/start` → `{ deepLink, verificationCode, expiresAt }`
- `GET  /workspaces/{workspaceId}/telegram/link/status/{code}` → `{ status, failureReason?, socialAccountId? }`, `status ∈ pending | user_started | completed | failed | expired`
- `DELETE /workspaces/{workspaceId}/telegram/{socialAccountId}` — отвязка (в этом спеке не реализуем)

## Цель

Заменить заглушку в TG-диалоге `/app/connect-account` на реальный flow привязки канала через `link/start` + поллинг `link/status`. На всех окружениях одинаково. TG-авторизация пользователя (`useTelegramOAuth`, `/me/link/telegram`, `/auth/telegram`) не трогается — она продолжает работать для логина.

## Поведение

1. Пользователь кликает плитку **Telegram**.
2. Фронт сразу вызывает `POST /workspaces/{id}/telegram/link/start`. Открывается диалог с:
   - Кнопкой-ссылкой **«Открыть бота в Telegram»** (`href = deepLink`, `target=_blank`).
   - Видимым `verificationCode` (моноширинный блок + кнопка копирования).
   - Подсказкой «Откройте бота и нажмите Start — мы сами дождёмся подтверждения».
   - Спиннером «Ожидаем подтверждения…».
3. Параллельно поллим `GET /workspaces/{id}/telegram/link/status/{code}` каждые ~2 сек:
   - `pending` → ждём.
   - `user_started` → меняем подсказку на «Пользователь открыл бота, ждём подтверждения…».
   - `completed` → toast успеха, закрываем диалог, `navigateTo('/app/calendar')` (там `useSocialAccounts` обновится на маунте, новый канал появится в сайдбаре).
   - `failed` → показать `failureReason` + кнопка **«Начать заново»** (перезапускает `link/start`).
   - `expired` → то же, с сообщением «Код истёк».
4. Закрытие диалога до `completed` — прекращаем поллить. На бэке флоу отвалится по `expiresAt`.

## Изменения

### `scripts/shared/types/index.ts`
```ts
workspaceTelegramLinkStart  = 'workspaces/{workspaceId}/telegram/link/start',
workspaceTelegramLinkStatus = 'workspaces/{workspaceId}/telegram/link/status/{code}',
```

### `lib-modules/content-calendar/types/index.ts`
```ts
export type TelegramLinkStatus =
  | 'pending' | 'user_started' | 'completed' | 'failed' | 'expired'

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

### `lib-modules/content-calendar/helpers/api.ts`
Добавить в `ContentCalendarApiController`:
```ts
startTelegramLink(workspaceId): Promise<TelegramLinkStartResponse>
getTelegramLinkStatus(workspaceId, code): Promise<TelegramLinkStatusResponse>
```

### Новый `lib-modules/content-calendar/components/TelegramLinkFlow.vue`
Props: `workspaceId`. Emits: `linked(socialAccountId)`, `cancel`.
На `onMounted` → `startTelegramLink` → запуск интервала поллинга. `onBeforeUnmount` и терминальные статусы чистят интервал. Кнопка «Начать заново» сбрасывает `code` и зовёт `link/start` повторно.

### `lib-modules/workspaces/components/ConnectAccountPage.vue`
В TG-ветке диалога — заменить `TelegramLoginButton` + warning на `<TelegramLinkFlow :workspace-id="workspaceId" @linked="onChannelLinked" @cancel="dialogOpen = false" />`. `onChannelLinked` → toast + закрыть диалог + `navigateTo('/app/calendar')`.

## Что НЕ делаем

- Отвязка канала (`DELETE`).
- Публикация постов в TG.
- UI состояния «подключён, но токен/бот отвалился».
- i18n — хардкод на русском, в календаре так же.

## Риски

- **Поллинг после ухода со страницы.** Чистим интервал в `onBeforeUnmount` и при терминальном статусе.
- **401 в поллинге** — глобальный хендлер `ApiController` уже редиректит на логин; локально ловим throw и показываем «Начать заново».
- **Повторный «Начать заново»** — перед новым `start` явно clearInterval по старому коду.
