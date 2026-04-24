# Cross-platform publish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать рабочую публикацию поста из редактора: 5 платформенных эндпоинтов (IG post/reel/story, TG post/story), фоновый поллинг статуса, live-виджет прогресса в глобальном `AppSidebar`.

**Architecture:** Диспатчер в `ContentCalendarApiController.publishPost` роутит по `platform × mediaType`. Новый Pinia-стор `publicationsStore` держит очередь + поллит `GET /posts/{id}` каждые 2с, обновляя карточки. Виджет `PublicationsPanel` в `AppSidebar` рендерит эти карточки. `PostPreviewPanel.handlePublish` становится: `saveDraft → publicationsStore.publishPost → navigateTo('/app/calendar')`. VK/YouTube дизейблены в UI + throw в диспатчере.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Pinia (setup-store syntax), Tailwind, shadcn-vue (`components/ui/button`), `vue-sonner` via `getToasterPosition()`, `lucide-vue-next` (иконки).

**Spec:** `docs/superpowers/specs/2026-04-23-cross-platform-publish-design.md`

**Prerequisite:** Пользователь держит `yarn dev` на :3000, не поднимаем свой (см. CLAUDE.md / проектная память). Код коммитим только когда юзер подтвердил, что фича работает в браузере.

---

## Task 1: Типы и `ApiAliases`

**Files:**
- Modify: `lib-modules/content-calendar/types/index.ts`
- Modify: `scripts/shared/types/index.ts`

- [ ] **Step 1:** Расширить `PostStatus` в `lib-modules/content-calendar/types/index.ts:5`. Найти строку:

```ts
export type PostStatus = 'idea' | 'draft' | 'ready' | 'published'
```

Заменить на:

```ts
export type PostStatus = 'idea' | 'draft' | 'ready' | 'publishing' | 'published' | 'failed'
```

- [ ] **Step 2:** Добавить новые типы в конец того же файла (`lib-modules/content-calendar/types/index.ts`, после `DemoProject`):

```ts
// ---- Publish flow (API 23.04) ----

export interface PublishReelOptions {
  locationId?: string
  shareToFeed?: boolean
  coverUrl?: string
}

export interface PublishAcceptedResponse {
  postId: string
  publicationAttemptId?: string
  publicationAttemptIds?: string[]  // stories возвращают массив
  status: PostStatus
}

export interface Publication {
  id: string                // локальный UUID
  postId: string
  workspaceId: string
  platform: SocialNetwork
  mediaType: PostMediaType
  postTitle: string
  accountName: string
  status: 'publishing' | 'published' | 'failed'
  error?: string
  publishedLink?: string
  startedAt: number
  completedAt?: number
}
```

- [ ] **Step 3:** Добавить 5 новых значений в `ApiAliases` enum (`scripts/shared/types/index.ts`). Найти блок `// Posts` на строках ~82-89 и добавить СРАЗУ ПОСЛЕ него (перед `// Members & Invites`):

```ts
    // Publish — platform-specific (API 23.04)
    workspaceInstagramPublishPost = 'workspaces/{workspaceId}/instagram/{socialAccountId}/posts',
    workspaceInstagramPublishReel = 'workspaces/{workspaceId}/instagram/{socialAccountId}/reels',
    workspaceInstagramPublishStory = 'workspaces/{workspaceId}/instagram/{socialAccountId}/stories',
    workspaceTelegramPublishPost = 'workspaces/{workspaceId}/telegram/{socialAccountId}/posts',
    workspaceTelegramPublishStory = 'workspaces/{workspaceId}/telegram/{socialAccountId}/stories',
```

`workspacePost` уже есть (строка 84), дублировать не надо.

- [ ] **Step 4:** Проверка сборки типов — запустить `yarn build` или просто `yarn dev` (уже запущен на :3000). Если TypeScript ругается где-то на `PostStatus === 'publishing'` — это ожидаемо, следующие таски это обработают. Если падает на изменённом файле — починить.

- [ ] **Step 5:** НЕ коммитить — ждём подтверждения юзера после всего плана.

---

## Task 2: API methods — `getPost` + `publishPost` dispatcher

**Files:**
- Modify: `lib-modules/content-calendar/helpers/api.ts`

- [ ] **Step 1:** В импортах на строках 10-26 добавить новые типы из `../types`:

Найти блок:
```ts
import type {
  SocialAccount,
  SocialNetwork,
  ...
  TelegramLinkStartResponse,
  TelegramLinkStatusResponse,
} from '../types'
```

И добавить перед закрывающей `} from '../types'`:

```ts
  PublishAcceptedResponse,
  PublishReelOptions,
```

- [ ] **Step 2:** Добавить метод `getPost` в класс `ContentCalendarApiController`. Найти метод `async getPosts(workspaceId: string): Promise<CalendarPost[]> { ... }` и СРАЗУ ПОСЛЕ него вставить:

```ts
  async getPost(workspaceId: string, postId: string): Promise<CalendarPost> {
    const url = buildUrl(ApiAliases.workspacePost, { workspaceId, postId })
    const dto = await this.api.request(url, RequestMethod.GET) as PostListItemDto
    return toCalendarPost(dto)
  }
```

- [ ] **Step 3:** Добавить метод `publishPost` (диспатчер). Вставить ПОСЛЕ `deletePost`, ПЕРЕД комментарием `// Calendar events`:

```ts
  // Publish dispatcher — routes by platform × mediaType.
  async publishPost(
    workspaceId: string,
    socialAccountId: string,
    postId: string,
    platform: SocialNetwork,
    mediaType: PostMediaType,
    reelOpts?: PublishReelOptions,
  ): Promise<PublishAcceptedResponse> {
    type DispatchEntry = { alias: ApiAliases; body: Record<string, unknown> }

    const entry: DispatchEntry | null = (() => {
      if (platform === 'instagram') {
        if (mediaType === 'post') {
          return { alias: ApiAliases.workspaceInstagramPublishPost, body: { postId } }
        }
        if (mediaType === 'reel') {
          return {
            alias: ApiAliases.workspaceInstagramPublishReel,
            body: {
              postId,
              locationId: reelOpts?.locationId,
              shareToFeed: reelOpts?.shareToFeed,
              coverUrl: reelOpts?.coverUrl,
            },
          }
        }
        if (mediaType === 'story') {
          return { alias: ApiAliases.workspaceInstagramPublishStory, body: { postId } }
        }
      }
      if (platform === 'telegram') {
        if (mediaType === 'post') {
          return { alias: ApiAliases.workspaceTelegramPublishPost, body: { postId } }
        }
        if (mediaType === 'story') {
          return { alias: ApiAliases.workspaceTelegramPublishStory, body: { postId } }
        }
      }
      return null
    })()

    if (!entry) {
      const platformLabel =
        platform === 'vk' ? 'VK' :
        platform === 'youtube' ? 'YouTube' :
        platform
      throw new Error(`Публикация ${mediaType} в ${platformLabel} пока не поддерживается`)
    }

    const url = buildUrl(entry.alias, { workspaceId, socialAccountId })
    return this.api.request(url, RequestMethod.POST, entry.body) as Promise<PublishAcceptedResponse>
  }
```

- [ ] **Step 4:** Убедиться, что файл компилируется без ошибок (смотреть в Vite dev server логи на :3000).

- [ ] **Step 5:** НЕ коммитить — ждём подтверждения юзера после всего плана.

---

## Task 3: `publicationsStore`

**Files:**
- Create: `lib-modules/content-calendar/stores/publicationsStore.ts`
- Modify: `lib-modules/content-calendar/index.ts`

- [ ] **Step 1:** Создать файл `lib-modules/content-calendar/stores/publicationsStore.ts` с содержимым:

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateUUID } from '~/scripts/features/utils'
import { useWorkspaceContext } from '~/lib-modules/workspaces/composables/useWorkspaceContext'
import { useContentCalendarApi } from '../helpers/api'
import { useContentProjectStore } from './contentProjectStore'
import type { Publication, PostMediaType } from '../types'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 3 * 60 * 1000
const MAX_CONSECUTIVE_ERRORS = 3

// Locally, the calendar type is 'post' | 'story' | 'reels' | 'article'
// while backend uses 'post' | 'story' | 'reel' | 'article'. Duplicate the
// conversion from helpers/api.ts to avoid exporting a private helper.
function contentTypeToMediaType(type: 'post' | 'story' | 'reels' | 'article'): PostMediaType {
  return type === 'reels' ? 'reel' : type
}

export const usePublicationsStore = defineStore('publications', () => {
  const publications = ref<Publication[]>([])
  const pollHandles = new Map<string, ReturnType<typeof setInterval>>()

  const api = useContentCalendarApi()
  const projectStore = useContentProjectStore()
  const workspaceContext = useWorkspaceContext()

  function clearPoll(publicationId: string) {
    const handle = pollHandles.get(publicationId)
    if (handle) {
      clearInterval(handle)
      pollHandles.delete(publicationId)
    }
  }

  function finalize(publicationId: string, patch: Partial<Publication>) {
    const idx = publications.value.findIndex(p => p.id === publicationId)
    if (idx === -1) return
    Object.assign(publications.value[idx], patch, { completedAt: Date.now() })
    clearPoll(publicationId)
  }

  function startPolling(publication: Publication) {
    let consecutiveErrors = 0
    const startedAt = publication.startedAt

    const handle = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        // Тайм-аут: останавливаем поллинг, карточка остаётся в 'publishing'.
        clearPoll(publication.id)
        return
      }
      try {
        const post = await api.getPost(publication.workspaceId, publication.postId)
        consecutiveErrors = 0

        // Зеркалим в contentProjectStore, чтобы календарная ячейка отражала состояние.
        projectStore.updatePostLocal(publication.postId, {
          status: post.status,
          publishedLink: post.publishedLink,
        })

        if (post.status === 'published') {
          finalize(publication.id, {
            status: 'published',
            publishedLink: post.publishedLink,
          })
        } else if (post.status === 'failed') {
          finalize(publication.id, {
            status: 'failed',
            error: 'Публикация не удалась',
          })
        }
        // иначе — 'publishing', продолжаем ждать
      } catch (e) {
        consecutiveErrors++
        console.error('[publicationsStore] poll error:', e)
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          finalize(publication.id, {
            status: 'failed',
            error: 'Потеряли связь с сервером',
          })
        }
      }
    }, POLL_INTERVAL_MS)

    pollHandles.set(publication.id, handle)
  }

  async function publishPost(postId: string): Promise<void> {
    const workspaceId = workspaceContext.requireWorkspaceId()
    const project = projectStore.currentProject
    if (!project) throw new Error('Не удалось найти текущий проект')

    const post = project.posts.find(p => p.id === postId)
    if (!post) throw new Error('Пост не найден в сторе')

    const account = project.accounts.find(a => a.id === post.accountId)
    if (!account) throw new Error('Аккаунт поста не найден')

    const mediaType = contentTypeToMediaType(post.type)

    // Может throw'нуть "не поддерживается" — пробрасываем наверх, карточку не создаём.
    await api.publishPost(
      workspaceId,
      account.id,
      postId,
      account.network,
      mediaType,
    )

    const publication: Publication = {
      id: generateUUID(),
      postId,
      workspaceId,
      platform: account.network,
      mediaType,
      postTitle: post.title || post.content?.slice(0, 60) || '(без названия)',
      accountName: account.name,
      status: 'publishing',
      startedAt: Date.now(),
    }

    // Новые карточки — в начале массива.
    publications.value = [publication, ...publications.value]

    // Оптимистично: помечаем пост как publishing в общем сторе.
    projectStore.updatePostLocal(postId, { status: 'publishing' })

    startPolling(publication)
  }

  function removePublication(id: string) {
    clearPoll(id)
    publications.value = publications.value.filter(p => p.id !== id)
  }

  return {
    publications,
    publishPost,
    removePublication,
  }
})
```

- [ ] **Step 2:** Реэкспортить стор из `lib-modules/content-calendar/index.ts`. Найти строку:

```ts
export { useContentProjectStore } from './stores/contentProjectStore'
```

И добавить ПОСЛЕ неё:

```ts
export { usePublicationsStore } from './stores/publicationsStore'
```

- [ ] **Step 3:** Проверить компиляцию — вкладка браузера на :3000 должна загрузиться без консольных ошибок про `publicationsStore`.

- [ ] **Step 4:** НЕ коммитить.

---

## Task 4: `PublicationsPanel.vue` — виджет

**Files:**
- Create: `lib-modules/app-layout/components/PublicationsPanel.vue`

- [ ] **Step 1:** Создать файл `lib-modules/app-layout/components/PublicationsPanel.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { useAppLayout } from '../composables/useAppLayout'
import { usePublicationsStore } from '~/lib-modules/content-calendar'
import type { SocialNetwork } from '~/lib-modules/content-calendar'

const router = useRouter()
const { isCollapsed } = useAppLayout()
const { publications } = storeToRefs(usePublicationsStore())

const hasItems = computed(() => publications.value.length > 0)

function goToEditor(postId: string) {
  router.push(`/app/editor/${postId}`)
}

function openPublishedLink(event: MouseEvent, url: string) {
  event.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Используем те же пути SVG, что в AccountsSidebar, чтобы не плодить иконки.
const networkPath: Record<SocialNetwork, string> = {
  vk: 'M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
}

const networkColor: Record<SocialNetwork, string> = {
  vk: 'text-blue-500',
  youtube: 'text-red-500',
  telegram: 'text-sky-500',
  instagram: 'text-pink-500',
}
</script>

<template>
  <div v-if="hasItems" class="px-2 pt-2 pb-1 border-t border-border">
    <div
      v-if="!isCollapsed"
      class="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      Публикации
    </div>

    <ul class="flex flex-col gap-1">
      <li
        v-for="pub in publications"
        :key="pub.id"
        :class="cn(
          'rounded-md hover:bg-accent transition-colors cursor-pointer overflow-hidden',
          isCollapsed ? 'flex items-center justify-center p-2' : 'flex items-center gap-2 px-2 py-1.5'
        )"
        :title="pub.postTitle"
        @click="goToEditor(pub.postId)"
      >
        <!-- Platform icon (only when expanded) -->
        <svg
          v-if="!isCollapsed"
          :class="cn('h-4 w-4 shrink-0', networkColor[pub.platform])"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path :d="networkPath[pub.platform]" />
        </svg>

        <!-- Title + account (only when expanded) -->
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <div class="text-xs font-medium truncate">{{ pub.postTitle }}</div>
          <div class="text-[10px] text-muted-foreground truncate">{{ pub.accountName }}</div>
        </div>

        <!-- Status icon -->
        <div class="flex items-center gap-1 shrink-0">
          <Loader2 v-if="pub.status === 'publishing'" class="h-4 w-4 animate-spin text-muted-foreground" />
          <CheckCircle2 v-else-if="pub.status === 'published'" class="h-4 w-4 text-green-600" />
          <XCircle v-else-if="pub.status === 'failed'" class="h-4 w-4 text-red-600" />

          <button
            v-if="pub.publishedLink && !isCollapsed"
            type="button"
            class="p-0.5 text-muted-foreground hover:text-foreground"
            title="Открыть опубликованный пост"
            @click="openPublishedLink($event, pub.publishedLink)"
          >
            <ExternalLink class="h-3.5 w-3.5" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
```

- [ ] **Step 2:** Реэкспортить компонент из `lib-modules/app-layout/index.ts`. Сначала посмотреть текущее содержимое файла, найти строку с экспортом `AppSidebar` или `AppNavbar` и ДОБАВИТЬ (стиль должен совпадать с существующими экспортами):

```ts
export { default as PublicationsPanel } from './components/PublicationsPanel.vue'
```

- [ ] **Step 3:** НЕ коммитить.

---

## Task 5: Вмонтировать `PublicationsPanel` в `AppSidebar`

**Files:**
- Modify: `lib-modules/app-layout/components/AppSidebar.vue`

- [ ] **Step 1:** В `lib-modules/app-layout/components/AppSidebar.vue` добавить импорт компонента. Найти блок импортов (строки 1-23) и добавить ПЕРЕД `const router = useRouter()` (строка 25):

```ts
import PublicationsPanel from './PublicationsPanel.vue'
```

- [ ] **Step 2:** Вмонтировать виджет в шаблон — ВСТАВИТЬ между subscription-chip кнопкой и `<!-- Bottom Navigation -->`. Найти закрывающий `</button>` subscription-chip (строка ~180) и следующую за ним строку `<!-- Bottom Navigation -->`. Между ними вставить:

```vue
    <PublicationsPanel />

```

Итоговый фрагмент должен выглядеть так:

```vue
    </button>

    <PublicationsPanel />

    <!-- Bottom Navigation -->
```

- [ ] **Step 3:** Проверить в браузере: открыть `/app/calendar`, в сайдбаре слева виджета пока не должно быть (публикаций ещё нет — `publications.length === 0`), layout не сломан.

- [ ] **Step 4:** НЕ коммитить.

---

## Task 6: `PostPreviewPanel` — platform gate + реальный `handlePublish`

**Files:**
- Modify: `lib-modules/content-editor/components/PostPreviewPanel.vue`

- [ ] **Step 1:** Добавить импорты. В `lib-modules/content-editor/components/PostPreviewPanel.vue`, найти блок импортов (строки 1-23) и добавить:

```ts
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { getToasterPosition } from '~/scripts/features/utils/toater'
import { usePublicationsStore } from '~/lib-modules/content-calendar'
```

- [ ] **Step 2:** Добавить `postId` и `setPostId` в destructure из `useContentEditor`. Найти строки 25-38:

```ts
const {
  currentDraft,
  updateDraft,
  addImage,
  removeImage,
  saveDraft,
  isSaving,
  isReel,
  activePanel,
  setActivePanel,
  goToImagesPanel,
  selectedAccountId,
  currentProjectAccounts
} = useContentEditor()
```

Заменить на:

```ts
const {
  currentDraft,
  updateDraft,
  addImage,
  removeImage,
  saveDraft,
  isSaving,
  isReel,
  activePanel,
  setActivePanel,
  goToImagesPanel,
  selectedAccountId,
  currentProjectAccounts,
  postId
} = useContentEditor()

const router = useRouter()
const publicationsStore = usePublicationsStore()
```

- [ ] **Step 3:** Добавить computed для платформенного гарда. Найти `const allowedTypes = computed<ContentType[]>(...)` и ДОБАВИТЬ ПОСЛЕ этого computed (перед `function isContentTypeAvailable`):

```ts
const isPlatformSupported = computed<boolean>(() => {
  const net = currentAccount.value?.network
  return net === 'instagram' || net === 'telegram'
})

const publishDisabledReason = computed<string | undefined>(() => {
  if (!currentAccount.value) return undefined
  if (isPlatformSupported.value) return undefined
  const net = currentAccount.value.network
  const label = networkNames[net]
  return `Публикация в ${label} скоро появится`
})
```

- [ ] **Step 4:** Заменить `handlePublish`. Найти существующий:

```ts
const handlePublish = async () => {
  isPublishing.value = true

  // TODO: Call actual publish API here
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

  updateDraft({ status: 'published' })
  isPublishing.value = false
  showPublishDialog.value = false
  showCelebration.value = true
}
```

Заменить на:

```ts
const handlePublish = async () => {
  isPublishing.value = true
  try {
    await saveDraft()
    const effectivePostId = postId.value
    if (!effectivePostId) throw new Error('Пост не сохранён')

    await publicationsStore.publishPost(effectivePostId)

    showPublishDialog.value = false
    showCelebration.value = true
    toast.success('Публикуем...', { position: getToasterPosition() })
    router.push('/app/calendar')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Не удалось отправить на публикацию'
    toast.error(msg, { position: getToasterPosition() })
  } finally {
    isPublishing.value = false
  }
}
```

- [ ] **Step 5:** Обновить шаблон кнопки "Опубликовать", чтобы учитывать `isPlatformSupported`. Найти в шаблоне:

```vue
      <!-- Publish button (only when status is 'ready') -->
      <Button
        v-if="canPublish"
        @click="showPublishDialog = true"
        class="w-full gap-2 bg-green-600 hover:bg-green-700"
      >
        <Send class="h-4 w-4" />
        Опубликовать
      </Button>
```

Заменить на:

```vue
      <!-- Publish button (only when status is 'ready') -->
      <Button
        v-if="canPublish"
        :disabled="!isPlatformSupported || isPublishing"
        :title="publishDisabledReason"
        @click="showPublishDialog = true"
        class="w-full gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:hover:bg-green-600/50"
      >
        <Send class="h-4 w-4" />
        Опубликовать
      </Button>
```

- [ ] **Step 6:** НЕ коммитить.

---

## Task 7: Ручной smoke-тест в браузере

**Files:** —

Юзер держит `yarn dev` на :3000. Тестируем последовательно, сверяя каждый шаг.

- [ ] **Step 1:** Залогиниться, открыть `/app/calendar`. Убедиться, что аккаунты TG/IG видны в левом сайдбаре. Базовый UI не сломан.

- [ ] **Step 2:** Создать новый пост через редактор или открыть существующий. Выставить `status = 'ready'`. Нажать **Сохранить**. Убедиться, что тост "Сохранено" прилетел.

- [ ] **Step 3:** Нажать **Опубликовать** на аккаунте **Telegram**. В диалоге подтверждения — **Опубликовать**.

**Ожидаемое:**
- Тост "Публикуем..."
- Редирект на `/app/calendar`
- В `AppSidebar` появилась карточка "Публикации" с заголовком поста, именем TG-канала, спиннером
- В DevTools → Network есть `POST /workspaces/.../telegram/.../posts` с 202 Accepted
- Через ~2-6 секунд спиннер сменится на зелёную галку (если бэк публикует успешно) или красный крест (если упал). Рядом может появиться `ExternalLink`-иконка (если бэк вернул `publishedLink`).

- [ ] **Step 4:** Клик по карточке → должен перекинуть в `/app/editor/{postId}`. Клик по `ExternalLink` (если есть) → открыть новый таб с опубликованным постом.

- [ ] **Step 5:** Перезагрузить страницу — карточка в сайдбаре исчезла, статус поста на календаре актуален (published/failed).

- [ ] **Step 6:** Проверить VK/YouTube гард. Если есть аккаунт на этих платформах, открыть пост на нём, выставить status=ready → кнопка "Опубликовать" задизейблена, при наведении тултип "Публикация в {VK|YouTube} скоро появится".

- [ ] **Step 7:** Сказать юзеру: "Готово, тести". Дождаться "работает" → после этого коммитим.

---

## Task 8: Коммиты после подтверждения юзера

**Files:** —

Коммитим двумя логическими группами, как делали раньше (separate spec/impl vs atomic review).

- [ ] **Step 1:** Закоммитить API-слой (типы, контроллер):

```bash
git add lib-modules/content-calendar/types/index.ts scripts/shared/types/index.ts lib-modules/content-calendar/helpers/api.ts
git commit -m "$(cat <<'EOF'
feat(calendar): add publish API — aliases, types, dispatcher

Five platform-specific publish endpoints (IG posts/reels/stories, TG
posts/stories) wired through ApiAliases, new PublishAcceptedResponse /
PublishReelOptions / Publication types, and ContentCalendarApiController
getPost + publishPost dispatcher that routes by platform × mediaType.
PostStatus extended with backend-only 'publishing'/'failed' transient
states.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2:** Закоммитить стор + UI (виджет и редактор):

```bash
git add lib-modules/content-calendar/stores/publicationsStore.ts lib-modules/content-calendar/index.ts lib-modules/app-layout/components/PublicationsPanel.vue lib-modules/app-layout/index.ts lib-modules/app-layout/components/AppSidebar.vue lib-modules/content-editor/components/PostPreviewPanel.vue
git commit -m "$(cat <<'EOF'
feat(calendar): background publish flow with AppSidebar progress widget

publicationsStore holds in-flight publish entries and polls
GET /posts/{id} every 2s until the post flips to published/failed (3
consecutive errors or 3-minute timeout bail out). PublicationsPanel
renders cards in AppSidebar between the subscription chip and
bottom-nav, with platform icon, post title, account name, status icon,
and an ExternalLink when the post reports a publishedLink. The editor's
Publish button is disabled with a tooltip for VK/YouTube (no backend
yet); clicking publish now saves the draft, calls the store, toasts
"Публикуем...", and redirects to /app/calendar.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3:** Проверить `git log --oneline -4` — два новых коммита сверху, спека остаётся `fd40cbb`.

---

## Self-Review

**1. Spec coverage:**
- `PostStatus` расширение → Task 1 Step 1 ✓
- Новые типы → Task 1 Step 2 ✓
- 5 `ApiAliases` → Task 1 Step 3 ✓
- `getPost` и `publishPost` dispatcher → Task 2 ✓
- VK/YouTube/IG+article/TG+reel/TG+article → Task 2 Step 3 (все отсутствующие combos падают в `if (!entry) throw`) ✓
- `publicationsStore` с поллингом, таймаутом 3 мин, 3 ретрая → Task 3 ✓
- Оптимистичный `updatePostLocal` → Task 3 Step 1 (и зеркалирование `publishedLink` в поллере) ✓
- `PublicationsPanel` с карточками, иконками, collapsed-режимом, ExternalLink → Task 4 ✓
- Монтирование в `AppSidebar` между subscription chip и bottom-nav → Task 5 ✓
- `isPlatformSupported` гард + тултип → Task 6 Steps 3,5 ✓
- Реальный `handlePublish` с `saveDraft → publishPost → navigateTo` → Task 6 Step 4 ✓
- Edge cases — нет выделенной задачи, но все они покрыты поведением стора (throw наружу) и UI (toast) — явных тасков не нужно.

**2. Placeholder scan:** Все шаги содержат реальный код и точные пути. Нет TBD/TODO. ✓

**3. Type consistency:**
- `Publication.status` — `'publishing' | 'published' | 'failed'`: используется в сторе и в шаблоне панели, совпадает.
- `PublishAcceptedResponse` — поля `postId`, `publicationAttemptId?`, `publicationAttemptIds?`, `status` — определены в Task 1 Step 2, используются как тип возврата в Task 2 Step 3.
- `PublishReelOptions` — `locationId?`, `shareToFeed?`, `coverUrl?` — определены в Task 1, используются в Task 2 Step 3.
- `contentTypeToMediaType` в сторе vs `uiTypeToMediaType` в helpers — сознательное дублирование, объяснено в комментарии.
- `publishPost` в API-контроллере принимает `(workspaceId, socialAccountId, postId, platform, mediaType, reelOpts?)` — порядок соответствует вызову в сторе: `api.publishPost(workspaceId, account.id, postId, account.network, mediaType)`. ✓
- `postId` экспортится из `useContentEditor` (проверено ранее — есть в `storeToRefs(store)` через `postId: computed`). Destructure в Task 6 Step 2 корректен.
