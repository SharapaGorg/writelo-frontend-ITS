# Cross-platform publish — design

**Дата:** 2026-04-23
**Модуль:** `lib-modules/content-calendar` (стор + API + типы), `lib-modules/app-layout` (sidebar-widget), `lib-modules/content-editor` (кнопка "Опубликовать")

## Контекст

Сейчас кнопка "Опубликовать" в `PostPreviewPanel.vue` — заглушка: `setTimeout(500)` → `updateDraft({status:'published'})` локально без сохранения. По факту ничего не публикуется и статус даже не уезжает на бэк.

Бэк (API 23.04) даёт 5 реальных эндпоинтов публиша, все асинхронные (202 Accepted). Тело запроса везде одинаковое — `{ postId }` (+ опциональные extras для IG reel). Статус пишется в сам пост: `ready → publishing → (published | failed)`. Отдельного эндпоинта для опроса статуса попытки публикации нет — опрашиваем сам пост через `GET /workspaces/{wid}/posts/{postId}`.

## Цель

End-to-end публиш: пользователь жмёт "Опубликовать" → запрос уходит на правильный платформенный эндпоинт → фронт сразу редиректит на `/app/calendar` и показывает прогресс-виджет в глобальном `AppSidebar` → стор поллит статус, карточка в сайдбаре обновляется live → зелёная галка при успехе, красный крест при фейле. Всё держится до перезагрузки страницы (без персиста).

## Покрытие платформ

| Платформа | post | story | reel | article |
|---|---|---|---|---|
| instagram | ✓ | ✓ | ✓ | — |
| telegram  | ✓ | ✓ | — | — |
| vk        | — | — | — | — |
| youtube   | — | — | — | — |

VK и YouTube бэком не покрыты — кнопка "Опубликовать" для аккаунтов этих платформ дизейблится с тултипом "Публикация в {VK/YouTube} скоро появится".

## Архитектура

Новые файлы:
- `lib-modules/content-calendar/stores/publicationsStore.ts` — Pinia-стор очереди публикаций + поллер.
- `lib-modules/app-layout/components/PublicationsPanel.vue` — виджет в сайдбаре.

Модифицируются:
- `scripts/shared/types/index.ts` — 5 новых `ApiAliases` + (опц.) `workspacePost` если ещё нет.
- `lib-modules/content-calendar/types/index.ts` — расширение `PostStatus`, новые типы `Publication`, `PublishAcceptedResponse`, `PublishReelOptions`.
- `lib-modules/content-calendar/helpers/api.ts` — методы `getPost` и `publishPost` (диспатчер).
- `lib-modules/content-calendar/index.ts` — реэкспорт `usePublicationsStore` и новых типов.
- `lib-modules/app-layout/components/AppSidebar.vue` — встраивание `PublicationsPanel` между subscription-chip и bottom-nav.
- `lib-modules/content-editor/components/PostPreviewPanel.vue` — реальный `handlePublish` + гард для VK/YT.

## Типы

```ts
// PostStatus расширяется бэковыми transient-состояниями.
// UI-статус-селект в редакторе НЕ предлагает publishing/failed как выбор —
// только idea/draft/ready; остальные два приходят исключительно от бэка.
export type PostStatus = 'idea' | 'draft' | 'ready' | 'publishing' | 'published' | 'failed'

// Запись очереди публикации — локальная, не бэковая.
export interface Publication {
  id: string                // локальный UUID
  postId: string
  workspaceId: string
  platform: SocialNetwork
  mediaType: PostMediaType  // 'post' | 'story' | 'reel' | 'article'
  postTitle: string         // для карточки в сайдбаре
  accountName: string       // для карточки
  status: 'publishing' | 'published' | 'failed'
  error?: string
  publishedLink?: string    // из post.publishedLink после финала
  startedAt: number
  completedAt?: number
}

export interface PublishReelOptions {
  locationId?: string
  shareToFeed?: boolean
  coverUrl?: string
}

// Унифицированный ответ 202 от любого платформенного эндпоинта.
export interface PublishAcceptedResponse {
  postId: string
  publicationAttemptId?: string
  publicationAttemptIds?: string[]  // stories возвращают массив
  status: PostStatus
}
```

## API layer

### `ApiAliases` (новые)

`workspacePost = 'workspaces/{workspaceId}/posts/{postId}'` уже существует (`scripts/shared/types/index.ts:84`, используется в PATCH/DELETE), переиспользуем его для GET. Добавляем 5 новых:

```ts
workspaceInstagramPublishPost         // POST /workspaces/{workspaceId}/instagram/{socialAccountId}/posts
workspaceInstagramPublishReel         // POST /workspaces/{workspaceId}/instagram/{socialAccountId}/reels
workspaceInstagramPublishStory        // POST /workspaces/{workspaceId}/instagram/{socialAccountId}/stories
workspaceTelegramPublishPost          // POST /workspaces/{workspaceId}/telegram/{socialAccountId}/posts
workspaceTelegramPublishStory         // POST /workspaces/{workspaceId}/telegram/{socialAccountId}/stories
```

### Методы в `ContentCalendarApiController`

```ts
async getPost(workspaceId: string, postId: string): Promise<CalendarPost>
```
Одиночный fetch поста через `workspacePost`. Используется поллером и, на будущее, как fallback для редактора при прямой перезагрузке на `/app/editor/{id}`.

```ts
async publishPost(
  workspaceId: string,
  accountId: string,
  postId: string,
  platform: SocialNetwork,
  mediaType: PostMediaType,
  reelOpts?: PublishReelOptions,
): Promise<PublishAcceptedResponse>
```

Диспатчер — по таблице:

| platform | mediaType | alias | body |
|---|---|---|---|
| instagram | post    | `workspaceInstagramPublishPost`  | `{ postId }` |
| instagram | reel    | `workspaceInstagramPublishReel`  | `{ postId, ...reelOpts }` |
| instagram | story   | `workspaceInstagramPublishStory` | `{ postId }` |
| telegram  | post    | `workspaceTelegramPublishPost`   | `{ postId }` |
| telegram  | story   | `workspaceTelegramPublishStory`  | `{ postId }` |

Всё остальное (vk/youtube, IG+article, TG+reel, TG+article) — `throw new Error('Публикация ... пока не поддерживается')` ещё до сетевого запроса.

## Publications store

`lib-modules/content-calendar/stores/publicationsStore.ts` — Pinia-стор, singleton.

### State

```ts
publications: Publication[]   // новые добавляются в начало массива (для отображения сверху)
```

Приватно в модуле стора — `Map<publicationId, IntervalHandle>` для чистки интервалов.

### Actions

**`publishPost(postId: string): Promise<void>`**

1. `const projectStore = useContentProjectStore()`, `const workspaceContext = useWorkspaceContext()`.
2. `workspaceId = workspaceContext.requireWorkspaceId()`.
3. `post = projectStore.currentProject?.posts.find(p => p.id === postId)` — если нет → throw.
4. `account = projectStore.currentProject?.accounts.find(a => a.id === post.accountId)` — если нет → throw.
5. `platform = account.network`, `mediaType = uiTypeToMediaType(post.type)` (переиспользуем функцию из `helpers/api.ts`).
6. `api.publishPost(workspaceId, accountId, postId, platform, mediaType)` — если throw (неподдерживаемая платформа / сетевая ошибка) → пробрасываем наверх без создания записи.
7. Создаём `publication: Publication` со `status: 'publishing'`, пушим в начало массива.
8. Оптимистично: `projectStore.updatePostLocal(postId, { status: 'publishing' })` — зеркалим статус в `contentProjectStore.currentProject.posts`, чтобы календарная ячейка отражала состояние без ожидания первого поллинга. (`updatePostLocal` уже существует как приватная функция в сторе, её нужно реэкспортить в `actions` блоке, если ещё не.)
9. Запускаем `startPolling(publication)`.

**`removePublication(id: string)`**

Удаляет запись из массива + чистит интервал. Сейчас из UI не вызывается (всё живёт до reload), но экспозим для будущих use-cases.

### Polling

`startPolling(publication)` — внутренний:

```ts
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 3 * 60 * 1000
const MAX_CONSECUTIVE_ERRORS = 3

let consecutiveErrors = 0
const startedAt = Date.now()

const handle = setInterval(async () => {
  if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
    clearPoll()  // таймаут: карточка остаётся в publishing, никаких ошибок
    return
  }
  try {
    const post = await api.getPost(publication.workspaceId, publication.postId)
    consecutiveErrors = 0

    // Зеркалим в contentProjectStore — см. шаг 8 `publishPost`
    projectStore.updatePostLocal(publication.postId, {
      status: post.status,
      publishedLink: post.publishedLink,
    })

    if (post.status === 'published') {
      publication.status = 'published'
      publication.publishedLink = post.publishedLink
      publication.completedAt = Date.now()
      clearPoll()
    } else if (post.status === 'failed') {
      publication.status = 'failed'
      publication.error = 'Публикация не удалась'  // бэк текста ошибки пока не отдаёт в DTO
      publication.completedAt = Date.now()
      clearPoll()
    }
    // иначе 'publishing' — ждём дальше
  } catch (e) {
    consecutiveErrors++
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      publication.status = 'failed'
      publication.error = 'Потеряли связь с сервером'
      publication.completedAt = Date.now()
      clearPoll()
    }
  }
}, POLL_INTERVAL_MS)
```

`clearPoll` — `clearInterval(handle)` + удаление из Map.

## UI: `PublicationsPanel.vue`

Файл: `lib-modules/app-layout/components/PublicationsPanel.vue`.

Props: нет. Берёт `publications` из `usePublicationsStore` + `isCollapsed` из `useAppLayout` (чтобы знать про свёрнутое состояние сайдбара).

Рендер:
- Не рендерится когда `publications.length === 0`.
- Заголовок "Публикации" — мелкий uppercase, как "Аккаунты" в `AccountsSidebar.vue`. В collapsed-режиме заголовок скрыт.
- Список карточек, новые сверху. Максимум отображения — все (без виртуализации; ожидаем единицы). Если разрастётся — добавим `max-h` + скролл позже.

Карточка (expanded):
- Слева: SVG-иконка платформы (тот же набор, что в `AccountsSidebar`: `vk | youtube | telegram | instagram`). Для vk/youtube не отобразится никогда (они не могут быть в списке), но для полноты — оставляем.
- Центр: `postTitle` (truncate) + под ним мелким серым `accountName`.
- Справа: статус-иконка:
  - `publishing` → `<Loader2 class="animate-spin" />` (lucide-vue-next)
  - `published` → `<CheckCircle2 class="text-green-600" />`
  - `failed` → `<XCircle class="text-red-600" />`
- Если `publishedLink` присутствует — рядом со статус-иконкой `<ExternalLink>` (клик c `@click.stop` открывает ссылку в новом табе).
- Клик по карточке (не по ExternalLink) → `router.push('/app/editor/${postId}')`.

Карточка (collapsed):
- Только статус-иконка по центру, без текста. Тултип (`title` атрибут) — `postTitle`.
- Клик — та же навигация.

Место в `AppSidebar.vue`: вставляется между subscription-chip и bottom-nav-блоком (т.е. сразу после кнопки подписки, перед разделителем).

## UI: `PostPreviewPanel.vue` — изменения

### Гард по платформе

```ts
const isPlatformSupported = computed<boolean>(() => {
  const net = currentAccount.value?.network
  return net === 'instagram' || net === 'telegram'
})

const publishDisabledReason = computed<string | undefined>(() => {
  if (isPublished.value) return undefined
  if (!isPlatformSupported.value) {
    const label = networkNames[currentAccount.value?.network ?? 'vk']
    return `Публикация в ${label} скоро появится`
  }
  return undefined
})
```

На самой кнопке:
```vue
<Button
  v-if="canPublish"
  :disabled="!isPlatformSupported || isPublishing"
  :title="publishDisabledReason"
  ...
>
```

### Реальный `handlePublish`

```ts
const handlePublish = async () => {
  if (!postId.value && !currentDraft.value) return
  isPublishing.value = true
  try {
    await saveDraft()
    // saveDraft может свежесоздать пост и проставить postId через setPostId
    const effectivePostId = postId.value
    if (!effectivePostId) throw new Error('Пост не сохранён')

    await publicationsStore.publishPost(effectivePostId)

    showPublishDialog.value = false
    showCelebration.value = true  // оставляем конфетти как честный сигнал "ушло в очередь"
    toast.success('Публикуем...', { position: getToasterPosition() })
    navigateTo('/app/calendar')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Не удалось отправить на публикацию'
    toast.error(msg, { position: getToasterPosition() })
  } finally {
    isPublishing.value = false
  }
}
```

Сохранение до публиша обязательно: на редкий случай, когда юзер поменял что-то после `saveDraft` и сразу жмёт "Опубликовать" — бэк должен публиковать актуальное.

## Edge cases

| Случай | Поведение |
|---|---|
| Пост не в сторе при `publishPost(postId)` | `store.publishPost` throws → UI toast.error, карточки нет |
| Аккаунт не найден по `post.accountId` | то же |
| Платформа VK/YouTube | throw из API-диспатчера → UI toast (кнопка должна быть уже задизейблена, это fallback) |
| IG + article, TG + reel/article | то же throw |
| Сетевая ошибка до 202 | throw → UI toast, карточки нет |
| Сетевая ошибка в поллинге | 3 ретрая, потом карточка → `failed` с "Потеряли связь" |
| Поллинг >3 мин без финала | stop interval, карточка остаётся `publishing`. При reload страницы статус подтянется из `getPosts` на календаре |
| Refresh страницы во время публикации | Стор очищается, бэк-пост доходит до финала. При открытии календаря — актуальный `status` через `fetchProjectData` |
| Параллельные публикации | Каждая со своим интервалом, независимы |
| Кнопка "Опубликовать" в редакторе на неподдерживаемой платформе | Дизейблена с тултипом; `handlePublish` не вызывается |

## Out of scope

- Публиш для VK и YouTube (нет бэка).
- IG reel extras (`locationId`, `shareToFeed`, `coverUrl`) — передаём пустыми/дефолтами. UI для них — отдельная задача.
- Retry кнопка на failed-карточке — пока нет. Клик по failed ведёт в редактор, пользователь жмёт "Опубликовать" заново вручную.
- Персист стора между перезагрузками — нет (по требованию: всё до reload).
- Реакция календарной сетки на `status='publishing'`/`'failed'` — отдельная задача по визуальной индикации. Сейчас статус сохраняется в `CalendarPost`, а как его рендерить в ячейке — вне этой спеки.
- Media upload для постов (`posts/uploads/init` + `finalize`) — отдельная параллельная задача, тут не трогаем.
