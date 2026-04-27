# Telegram channel linking — миграция на v1-26.04

**Дата:** 2026-04-27
**Модуль:** `lib-modules/content-calendar` (компонент + API), `scripts/shared/types`
**Базовый спек:** `docs/superpowers/specs/2026-04-23-telegram-channel-link-dev-design.md` (старый flow, который сейчас в коде)

## Контекст

В спеке `v1-26.04` ручки TG-канал-линка из v1-23.04 удалены целиком:

| Удалено | Что было |
|---|---|
| `POST /workspaces/{id}/telegram/link/start` | возвращал `{ deepLink, verificationCode, expiresAt }` |
| `GET /workspaces/{id}/telegram/link/status/{code}` | возвращал `{ status, failureReason?, socialAccountId? }` со status-машиной `pending → user_started → completed/failed/expired` |
| `DELETE /workspaces/{id}/telegram/{socialAccountId}` | отвязка |
| Схемы `TelegramLinkStartResponse`, `TelegramLinkStatusResponse`, `TelegramBotLinkVerificationStatus` | — |

Линковка унифицирована под одну ручку для IG и TG:

```
POST /workspaces/{workspaceId}/social-accounts/link
body: { platform: "telegram" | "instagram" }
→ { url: string }       // SocialAccountLinkStartResponse
```

Polling-эндпоинта в новой спеке **нет**. `verificationCode`, `expiresAt`, `failureReason`, `socialAccountId` в ответе — отсутствуют. Удаление аккаунта теперь общее: `DELETE /workspaces/{workspaceId}/social-accounts/{socialAccountId}` (уже используется в `deleteSocialAccount`).

## Цель

Перевести существующий компонент `TelegramLinkFlow.vue` и его API-методы на новый эндпоинт без потери UX «канал привязан → диалог закрыт». Публичный контракт компонента (`:workspace-id`, `@linked`) сохраняется — `ConnectAccountPage.vue` не меняется.

## Решения

| Вопрос | Решение |
|---|---|
| Чем заменить polling статуса по `code`? | Snapshot-diff поллинг `GET /workspaces/{id}/social-accounts`: запоминаем set ID существующих TG-аккаунтов до старта, после старта поллим список, ждём появления нового TG-id |
| Generic-компонент или TG-only? | TG-only. Имя файла, метода контроллера, текстов UI остаются TG-специфичными. Generic-выделение отложено до момента, когда понадобится IG-онбординг с OAuth-callback |
| Polling-параметры | `POLL_INTERVAL_MS = 3000`, `TIMEOUT_SEC = 120` (раньше 2000 / 60) |
| Поведение при таймауте | Состояние «не дождались привязки» с двумя кнопками: «Проверить» (один `getSocialAccounts`-запрос → если новый TG нашёлся, эмитим `linked`; иначе сообщение «не нашли») и «Начать заново» (перезапуск flow) |
| Имя метода в `ContentCalendarApiController` | `startTelegramLink(workspaceId)` — внутри дёргает `/social-accounts/link` с захардкоженным `platform: 'telegram'`. Не делаем generic-метод (`startSocialAccountLink(workspaceId, platform)`) — соответствует scope «TG-only» |

## Поведение

1. Пользователь кликает TG-плитку в `ConnectAccountPage`.
2. `TelegramLinkFlow` на маунте:
   - Снимает снэпшот: `existingTgIds = Set<string>` из текущего `getSocialAccounts()`, фильтр по `network === 'telegram'`.
   - Вызывает `startTelegramLink(workspaceId)` → `{ url }`.
   - Запускает poll-таймер (3s) и countdown-таймер (1s).
3. UI показывает:
   - Кнопку-ссылку **«Открыть бота в Telegram»** (`href = url`, `target=_blank`, `rel="noopener noreferrer"`).
   - Подсказку «Откройте бота и нажмите Start» + спиннер + `mm:ss` обратный отсчёт.
4. Каждый poll-tick:
   - `getSocialAccounts(workspaceId)` → ищем TG-аккаунт, чей `id` не в `existingTgIds`.
   - Найден → `emit('linked', newId)`, останавливаем таймеры.
   - Не найден → продолжаем.
5. Countdown дошёл до 0 → `state = 'timed_out'`. Останавливаем poll-таймер.
6. В timeout-состоянии:
   - Кнопка **«Проверить»** → один `getSocialAccounts` → если новый TG найден, `emit('linked', id)`; иначе показываем сообщение «Канал ещё не появился».
   - Кнопка **«Начать заново»** → сбрасываем state, запускаем `start()` заново (в т.ч. новый POST → новый `url`, новый snapshot).
7. Закрытие диалога до завершения — `onBeforeUnmount` чистит таймеры. Серверной отмены нет (бэк сам разберётся).

## Изменения

### `scripts/shared/types/index.ts` (ApiAliases)

Удалить:
```ts
workspaceTelegramLinkStart  = 'workspaces/{workspaceId}/telegram/link/start',
workspaceTelegramLinkStatus = 'workspaces/{workspaceId}/telegram/link/status/{code}',
```

Добавить (в группу Social accounts):
```ts
workspaceSocialAccountsLink = 'workspaces/{workspaceId}/social-accounts/link',
```

### `lib-modules/content-calendar/types/index.ts`

Удалить:
```ts
export type TelegramLinkStatus = ...
export interface TelegramLinkStartResponse { deepLink; verificationCode; expiresAt }
export interface TelegramLinkStatusResponse { status; failureReason?; socialAccountId? }
```

Добавить:
```ts
export interface StartSocialAccountLinkRequest {
  platform: SocialNetwork
}

export interface SocialAccountLinkStartResponse {
  url: string
}
```

### `lib-modules/content-calendar/helpers/api.ts`

Удалить из импорта типов: `TelegramLinkStartResponse`, `TelegramLinkStatusResponse`.
Добавить: `SocialAccountLinkStartResponse`, `StartSocialAccountLinkRequest`.

Удалить методы `startTelegramLink` и `getTelegramLinkStatus` в текущем виде, заменить на:

```ts
// Telegram channel linking — generic /social-accounts/link
startTelegramLink(workspaceId: string): Promise<SocialAccountLinkStartResponse> {
  const url = buildUrl(ApiAliases.workspaceSocialAccountsLink, { workspaceId })
  const body: StartSocialAccountLinkRequest = { platform: 'telegram' }
  return this.api.request(url, RequestMethod.POST, body) as Promise<SocialAccountLinkStartResponse>
}
```

`getSocialAccounts` уже есть — реиспользуем как есть.

### `lib-modules/content-calendar/components/TelegramLinkFlow.vue`

Полный rewrite. Новые состояния:

```ts
type FlowState =
  | 'starting'      // POST /social-accounts/link в полёте
  | 'waiting'       // url получен, поллим
  | 'timed_out'     // 120s истекло
  | 'error'         // start или poll упал
```

Removed state machine: `pending | user_started | completed | failed | expired`.

Новые refs:
- `state: Ref<FlowState>`
- `linkUrl: Ref<string | null>` (вместо `session`)
- `existingTgIds: Set<string>` (snapshot)
- `remainingSec: Ref<number>` (без изменений)
- `errorText: Ref<string | null>` (без изменений)
- `manualCheckPending: Ref<boolean>` (для кнопки «Проверить»)
- `manualCheckEmpty: Ref<boolean>` (показать «не нашли»)

Removed refs: `session`, `status`, `failureReason`, `starting` (схлопнут в state).

Константы:
```ts
const POLL_INTERVAL_MS = 3000
const TIMEOUT_SEC = 120
```

Удалённые UI-блоки:
- Display `verificationCode` + кнопка copy.
- Различие `pending` vs `user_started` подсказок.
- `failureReason` блок.
- `failed`/`expired` ветки старой машины.

Новые UI-ветки:
1. `state === 'starting'` → спиннер «Готовим ссылку…»
2. `state === 'waiting'` → кнопка-ссылка `linkUrl` + спиннер «Откройте бота и нажмите Start» + `mm:ss`
3. `state === 'timed_out'` → текст «Не дождались привязки. Если уже подтвердил в Telegram — нажми «Проверить».» + 2 кнопки. После «Проверить» с пустым результатом — добавляем строку «Канал ещё не появился, попробуй ещё раз».
4. `state === 'error'` → `errorText` + кнопка «Попробовать снова».

`getToasterPosition` (используется для toast-а копирования в старой версии) — больше не нужен в этом компоненте.

### Импорты иконок

Останутся: `Loader2`, `ExternalLink`, `AlertCircle`. Уйдёт: `Copy`.

### `ConnectAccountPage.vue`

**Не меняется.** Контракт `<TelegramLinkFlow :workspace-id @linked />` сохраняется.

## Что НЕ делаем

- Generic `SocialAccountLinkFlow` под IG.
- IG-OAuth callback (`/workspaces/social-accounts/link/oauth/callback`).
- Миграцию publish-ручек (`workspaceInstagramPublish*`, `workspaceTelegramPublish*`) — отдельная задача, скорее всего связанная с переездом публикации на статус-машину `Posts`.
- i18n — оставляем хардкод RU как в исходнике.
- Серверную отмену flow при закрытии диалога.

## Риски

- **Бэк может не успеть создать `SocialAccount` к моменту, когда юзер вернётся из бота.** В poll-цикле это видно как «новый TG не появился» → продолжаем поллить до таймаута; при таймауте есть ручной «Проверить». В целом приемлемо.
- **Юзер начал линк, не закрыл диалог, в другом окне привязал ещё один TG-канал** — наш poll увидит новый id, который реально к этому flow не относится, и эмитнет `linked`. Маловероятный кейс (отдельная вкладка + параллельный flow), не закладываемся.
- **`url` для TG в спеке без формата.** Подразумевается `t.me/<bot>?start=<token>` — фронт просто открывает в новой вкладке, формат не парсит. Если бэк отдаст что-то странное — UX просто провалится молча, юзер закроет диалог. Принимаем.
- **Polling 3s на список аккаунтов — нагрузка.** На один открытый диалог 1 запрос/3s — ~40 запросов на 120s. Приемлемо для редкого CTA.

## Риски, которые сняты по сравнению со старым флоу

- Не нужно жонглировать `verificationCode` между фронтом и юзером (бот теперь знает токен из самого `?start=`).
- Не зависим от того, чтобы бэк правильно реализовал статус-машину — только от факта появления записи в `/social-accounts`.
