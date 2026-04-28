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

    // Optimistic: статус и карточка появляются ДО HTTP, иначе при быстром редиректе из
    // редактора (handlePublish → router.push) sidebar не успевает их отрендерить.
    const previousStatus = post.status
    projectStore.updatePostLocal(postId, { status: 'publishing' })

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
    publications.value = [publication, ...publications.value]

    let updated
    try {
      updated = await api.publishPostNow(workspaceId, postId)
    } catch (e) {
      projectStore.updatePostLocal(postId, { status: previousStatus })
      finalize(publication.id, { status: 'failed', error: 'Не удалось отправить на публикацию' })
      throw e
    }

    // НЕ синхронизируем status из ответа: бэк может вернуть 'ready', т.к. publishing-job
    // ещё не стартовал. Поллинг подхватит реальное состояние через 2с. Здесь только
    // publishedLink, если он уже доступен.
    if (updated.publishedLink) {
      projectStore.updatePostLocal(postId, { publishedLink: updated.publishedLink })
    }

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
