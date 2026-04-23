# API Changelog: v1-new → v1-23.04

**Дата:** 2026-04-23
**База:** `docs/v1-new.json` (14.04)
**Новый спек:** `docs/v1-23.04.json` (23.04)
**Тип миграции:** аддитивная (ломающих удалений нет)

Основной фокус релиза — **интеграции с Instagram и Telegram** для публикации контента из воркспейса, плюс отдельный канал загрузки медиа для постов.

---

## Новые эндпоинты

### Instagram (новый тег `Instagram`)

| Метод | Путь | Назначение |
|-------|------|------------|
| GET | `/workspaces/instagram/oauth/callback` | Коллбэк Instagram Business Login OAuth (редирект на фронт) |
| POST | `/workspaces/{workspaceId}/instagram/oauth/start` | Старт OAuth-флоу → `InstagramOAuthStartResponse` с `authorizationUrl` |
| POST | `/workspaces/{workspaceId}/instagram/{socialAccountId}/refresh` | Ручное обновление токена и ресинк профиля |
| POST | `/workspaces/{workspaceId}/instagram/{socialAccountId}/posts` | Поставить в очередь публикацию в Feed |
| POST | `/workspaces/{workspaceId}/instagram/{socialAccountId}/reels` | Поставить Reels (с `locationId`, `shareToFeed`, `coverUrl`) |
| POST | `/workspaces/{workspaceId}/instagram/{socialAccountId}/stories` | Поставить Stories |
| POST | `/workspaces/{workspaceId}/instagram/{socialAccountId}/sync-posts` | Подтянуть недавние медиа/инсайты в аналитику |

### Telegram (новый тег `Workspace Telegram`)

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/workspaces/{workspaceId}/telegram/link/start` | Начать верификацию канала → `deepLink`, `verificationCode`, `expiresAt` |
| GET  | `/workspaces/{workspaceId}/telegram/link/status/{code}` | Статус верификации (`status`, `failureReason`, `socialAccountId`) |
| DELETE | `/workspaces/{workspaceId}/telegram/{socialAccountId}` | Отвязать канал |
| POST | `/workspaces/{workspaceId}/telegram/{socialAccountId}/posts` | Публикация поста в канал |
| POST | `/workspaces/{workspaceId}/telegram/{socialAccountId}/stories` | Публикация истории в канал |

### Загрузка медиа для постов (отдельная пара)

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/workspaces/{workspaceId}/posts/uploads/init` | Инициализация загрузки медиа к постам (без экстракторов) |
| POST | `/workspaces/{workspaceId}/posts/uploads/finalize` | Финализация — сохраняет storage-объект напрямую |

> **Важно:** это **не** та же цепочка, что `uploadFile()` из `lib-modules/shared`. Для прикрепления медиа к постам использовать именно эту пару; общий `uploadFile()` остаётся для чата/генераций.

---

## Изменённые эндпоинты

- `POST /workspaces/{workspaceId}/invites` — добавлен ответ `400` (ошибка валидации инвайта). Успешный путь не изменён.

## Удалённые эндпоинты

Нет.

---

## Изменённые схемы (breaking для фронта)

### `UpsertPostRequest`
- `platformContent` стал **required**. Фронт обязан отправлять ключ (допустимо `null`), иначе 400.

### `PaymentSessionDto`
- Добавлено **required** поле `isGift: boolean`. После regen TS-типов сборка упадёт, если не поправить мапинг.

### `CreatePaymentRequest`
- Добавлено опциональное `forGift: boolean | null`. Для инициации подарочного платежа.

### `CalendarEventDto`
- Добавлено опциональное `locale: string | null`.

> DTO по `Workspace`, `Conversation`, `Message`, `Image`, `User`, `Brand`, `BrandBrief`, `Client`, `Project` **не менялись**. Ни переименований, ни смены типов существующих полей.

---

## Новые схемы (17)

**Instagram/Telegram публикация:**
- `PublishPostRequest`, `PublishReelRequest`, `PublishStoryRequest`
- `PublishTelegramPostRequest`, `PublishTelegramStoryRequest`

**Ответы:**
- `InstagramOAuthStartResponse`
- `InstagramPublishAcceptedResponse`, `InstagramStoryPublishAcceptedResponse`
- `TelegramPostAcceptedResponse`
- `TelegramLinkStartResponse`, `TelegramLinkStatusResponse`

**Синхронизация IG:**
- `InstagramSyncedPostDto` — `postId`, `externalPostId`, `caption`, `mediaType: PostContentType`, `permalink`, `timestamp`, метрики `views/reach/likes/comments/shares/saves`
- `SyncPostsResponse` — `items`, `createdCount`, `updatedCount`, `snapshotCount`, `syncedAt`

**Post uploads:**
- `InitPostMediaUploadRequest`, `FinalizePostMediaUploadRequest`, `FinalizePostMediaUploadResponse`

**Enum:**
- `TelegramBotLinkVerificationStatus`: `pending` / `user_started` / `completed` / `failed` / `expired`

## Удалённые схемы

Нет.

---

## Прочее

- **Tags:** добавлены `Instagram` и `Workspace Telegram`
- **Security schemes / servers / security / info:** без изменений

---

## Чеклист миграции фронта

### Обязательно (блокирует сборку после regen клиента)
- [ ] В `PaymentSessionDto` добавить `isGift: boolean` (required)
- [ ] Везде, где отправляется `UpsertPostRequest`, гарантировать наличие ключа `platformContent` (хоть `null`)

### Новый функционал
- [ ] Расширение `WorkspacesApiController` (или отдельный `InstagramApiController`) под Instagram: OAuth start/callback, refresh, publish post/reel/story, sync-posts
- [ ] `TelegramApiController` / методы в workspaces: link start/status, unlink, publish post/story
- [ ] Отдельный хелпер `uploadPostMedia()` поверх `posts/uploads/init` + `finalize` — не переиспользовать общий `uploadFile()` из `lib-modules/shared`
- [ ] Поддержать `isGift` / `forGift` в платёжном флоу, если будет UI «подарить подписку»
- [ ] В `CalendarEventDto` прокинуть опциональный `locale`

### Опорные файлы
- `scripts/shared/api/controller.ts` — базовый `ApiController`
- `lib-modules/workspaces/helpers/api.ts` — паттерн extension-контроллера
- `scripts/shared/types/` — DTO
- `scripts/shared/types/index.ts` — `ApiAliases`, `buildUrl`
