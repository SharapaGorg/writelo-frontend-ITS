import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { generateUUID } from '~/scripts/features/utils'
import { useAssistantApi } from '../helpers/api'
import { parseActionsTail, isMarkerLikely } from '../helpers/actionsParser'
import { useAssistantStore } from '../stores/assistantStore'
import type { AssistantMessage } from '../types'

const messages = ref<AssistantMessage[]>([])
const conversationId = ref<string | null>(null)
const isProcessing = ref(false)
const isStopping = ref(false)
const isLoadingHistory = ref(false)
let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null

export function useAssistantChat() {
  const route = useRoute()
  const router = useRouter()
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useAssistantApi()
  const store = useAssistantStore()

  function reset() {
    messages.value = []
    conversationId.value = null
    isProcessing.value = false
    isStopping.value = false
  }

  function addMessage(role: 'user' | 'assistant', text: string): string {
    const id = generateUUID()
    messages.value.push({
      id,
      role,
      text,
      visibleText: text,
      createdAt: Date.now(),
      processing: role === 'assistant' && text === '',
    })
    return id
  }

  function appendChunk(messageId: string, chunk: string) {
    const m = messages.value.find(x => x.id === messageId)
    if (!m) return
    m.text += chunk
    if (isMarkerLikely(m.text)) {
      m.visibleText = parseActionsTail(m.text).visibleText
    } else {
      m.visibleText = m.text
    }
  }

  function setMessageError(messageId: string, error = true) {
    const m = messages.value.find(x => x.id === messageId)
    if (m) m.error = error
  }

  function setMessageBackendId(messageId: string, backendId: number | string) {
    const m = messages.value.find(x => x.id === messageId)
    if (m) m.backendId = backendId
  }

  async function setActiveConversation(convId: string | null) {
    if (conversationId.value === convId) return
    reset()
    conversationId.value = convId
    if (!convId) return

    isLoadingHistory.value = true
    try {
      const wid = requireWorkspaceId()
      store.setLastActive(wid, convId)
      const detail = await api.getConversation(wid, convId)
      // Guard against races: another switch may have happened while we awaited.
      if (conversationId.value !== convId) return
      messages.value = (detail.messages ?? [])
        .filter(m => !m.isService)
        .map(m => ({
          id: generateUUID(),
          backendId: m.id,
          role: m.role,
          text: m.text ?? '',
          visibleText: m.text ?? '',
          createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
        }))
    } catch (e) {
      console.error('[Assistant] failed to load conversation', e)
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function ensureConversation(workspaceId: string): Promise<string> {
    if (conversationId.value) return conversationId.value
    const conv = await api.createConversation(workspaceId)
    conversationId.value = conv.id
    store.upsertConversation(workspaceId, {
      id: conv.id,
      workspaceId,
      title: conv.title ?? '',
      createdAt: conv.createdAt ?? new Date().toISOString(),
      modifiedAt: conv.modifiedAt ?? new Date().toISOString(),
    })
    // Backend returns "Untitled" placeholder; real title arrives via SSE
    // (title_generated). Mark as pending so the sidebar shows a skeleton
    // instead of the literal placeholder.
    store.markTitlePending(workspaceId, conv.id)
    store.setLastActive(workspaceId, conv.id)
    router.replace({ query: { ...route.query, conv: conv.id } })
    return conv.id
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isProcessing.value) return

    let workspaceId: string
    try {
      workspaceId = requireWorkspaceId()
    } catch (e) {
      const errId = addMessage('assistant', 'Сначала выбери бренд в верхней панели.')
      const m = messages.value.find(x => x.id === errId)
      if (m) m.processing = false
      setMessageError(errId)
      return
    }
    const requestId = addMessage('user', trimmed)
    const responseId = addMessage('assistant', '')
    isProcessing.value = true

    let convId: string
    try {
      convId = await ensureConversation(workspaceId)
    } catch (e) {
      setMessageError(responseId)
      const m = messages.value.find(x => x.id === responseId)
      if (m) {
        m.text = 'Не удалось создать диалог. Попробуй ещё раз.'
        m.visibleText = m.text
        m.processing = false
      }
      isProcessing.value = false
      return
    }

    let stream: ReadableStream<Uint8Array>
    try {
      stream = await api.sendMessage(workspaceId, convId, trimmed)
    } catch (e: any) {
      const detail = e?.data?.detail || 'Не удалось отправить сообщение.'
      setMessageError(responseId)
      const m = messages.value.find(x => x.id === responseId)
      if (m) {
        m.text = detail
        m.visibleText = m.text
        m.processing = false
      }
      isProcessing.value = false
      return
    }

    const handle = (parsed: any) => {
      if (parsed.action === 'text_chunk' || parsed.action === 'process_response') {
        appendChunk(responseId, parsed.dt ?? '')
      } else if (parsed.action === 'request_message_id') {
        setMessageBackendId(requestId, parsed.messageId)
      } else if (parsed.action === 'response_message_id') {
        setMessageBackendId(responseId, parsed.messageId)
      } else if (
        parsed.action === 'title_generated' ||
        parsed.action === 'set_title' ||
        parsed.action === 'create_conversation'
      ) {
        const cid = conversationId.value
        const title = parsed.title ?? parsed.dt
        if (cid && title) {
          store.patchConversation(workspaceId, cid, {
            title,
            modifiedAt: new Date().toISOString(),
          })
          store.unmarkTitlePending(workspaceId, cid)
        }
      } else if (parsed.action === 'response_end' || parsed.action === 'finish_response') {
        isProcessing.value = false
        const m = messages.value.find(x => x.id === responseId)
        if (m) {
          m.processing = false
          const { visibleText, actions } = parseActionsTail(m.text)
          m.visibleText = visibleText
          if (actions.length > 0) m.actions = actions
        }
        if (!parsed.success && !isStopping.value) {
          appendChunk(responseId, parsed.message || parsed.error || '\n**Сервер занят**')
          setMessageError(responseId)
        }
        isStopping.value = false
        // Backup: backend may set title after the stream ends (async title worker).
        // Silent refetch of the list ensures the sidebar reflects whatever the
        // backend ended up with, even if no set_title/create_conversation event
        // was emitted for this message. Also clear any stale pending flag —
        // if the title still hasn't arrived by now, refetched list is canon.
        const cid = conversationId.value
        api.listConversations(workspaceId)
          .then(list => {
            store.setConversations(workspaceId, list)
            if (cid) store.unmarkTitlePending(workspaceId, cid)
          })
          .catch(() => { /* noop */ })
      }
    }

    const reader = stream.getReader()
    activeReader = reader
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break
          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)
          if (line.startsWith('data: ')) {
            try {
              handle(JSON.parse(line.slice(6)))
            } catch {
              /* ignore bad json */
            }
          }
        }
      }
    } catch (e) {
      // Reader cancelled (stop) or stream errored — just clean up.
    } finally {
      if (activeReader === reader) activeReader = null
      isProcessing.value = false
      const m = messages.value.find(x => x.id === responseId)
      if (m) m.processing = false
    }
  }

  async function stop() {
    if (!activeReader) return
    isStopping.value = true
    isProcessing.value = false
    const m = messages.value[messages.value.length - 1]
    if (m) m.processing = false
    try {
      await activeReader.cancel()
    } catch {
      /* noop */
    }
    activeReader = null
    isStopping.value = false
  }

  return {
    messages: computed(() => messages.value),
    conversationId: computed(() => conversationId.value),
    isProcessing: computed(() => isProcessing.value),
    isLoadingHistory: computed(() => isLoadingHistory.value),
    reset,
    setActiveConversation,
    send,
    stop,
  }
}
