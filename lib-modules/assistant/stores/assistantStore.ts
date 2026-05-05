import { ref } from 'vue'
import type { ConversationListItemDto } from '~/scripts/shared/types/workspace'

const conversationsByWorkspace = ref<Record<string, ConversationListItemDto[]>>({})
const lastActiveByWorkspace = ref<Record<string, string | null>>({})
// Tracks conversations created in this session that are still awaiting an
// async title-generation from the backend. Used to drive the title skeleton
// in the history panel. NOT persisted — old conversations with literal title
// "Untitled" never enter this set.
const titlePendingByWorkspace = ref<Record<string, string[]>>({})

const LAST_ACTIVE_KEY = 'assistant.lastActive.v1'

function loadLastActive(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLastActive(map: Record<string, string | null>) {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(map))
  } catch {
    /* noop */
  }
}

if (typeof window !== 'undefined') {
  lastActiveByWorkspace.value = loadLastActive()
}

function sortByModifiedDesc(list: ConversationListItemDto[]): ConversationListItemDto[] {
  return [...list].sort((a, b) => {
    const aT = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0
    const bT = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0
    return bT - aT
  })
}

export function useAssistantStore() {
  function setConversations(workspaceId: string, list: ConversationListItemDto[]) {
    conversationsByWorkspace.value = {
      ...conversationsByWorkspace.value,
      [workspaceId]: sortByModifiedDesc(list),
    }
  }

  function upsertConversation(workspaceId: string, conv: ConversationListItemDto) {
    const prev = conversationsByWorkspace.value[workspaceId] ?? []
    const filtered = prev.filter(c => c.id !== conv.id)
    conversationsByWorkspace.value = {
      ...conversationsByWorkspace.value,
      [workspaceId]: sortByModifiedDesc([conv, ...filtered]),
    }
  }

  function patchConversation(
    workspaceId: string,
    convId: string,
    patch: Partial<ConversationListItemDto>,
  ) {
    const prev = conversationsByWorkspace.value[workspaceId] ?? []
    const target = prev.find(c => c.id === convId)
    if (!target) return
    upsertConversation(workspaceId, { ...target, ...patch })
  }

  function removeConversation(workspaceId: string, convId: string) {
    const prev = conversationsByWorkspace.value[workspaceId] ?? []
    conversationsByWorkspace.value = {
      ...conversationsByWorkspace.value,
      [workspaceId]: prev.filter(c => c.id !== convId),
    }
    if (lastActiveByWorkspace.value[workspaceId] === convId) {
      setLastActive(workspaceId, null)
    }
  }

  function getConversations(workspaceId: string): ConversationListItemDto[] {
    return conversationsByWorkspace.value[workspaceId] ?? []
  }

  function setLastActive(workspaceId: string, convId: string | null) {
    lastActiveByWorkspace.value = {
      ...lastActiveByWorkspace.value,
      [workspaceId]: convId,
    }
    saveLastActive(lastActiveByWorkspace.value)
  }

  function getLastActive(workspaceId: string): string | null {
    return lastActiveByWorkspace.value[workspaceId] ?? null
  }

  function markTitlePending(workspaceId: string, convId: string) {
    const prev = titlePendingByWorkspace.value[workspaceId] ?? []
    if (prev.includes(convId)) return
    titlePendingByWorkspace.value = {
      ...titlePendingByWorkspace.value,
      [workspaceId]: [...prev, convId],
    }
  }

  function unmarkTitlePending(workspaceId: string, convId: string) {
    const prev = titlePendingByWorkspace.value[workspaceId] ?? []
    if (!prev.includes(convId)) return
    titlePendingByWorkspace.value = {
      ...titlePendingByWorkspace.value,
      [workspaceId]: prev.filter(id => id !== convId),
    }
  }

  function isTitlePending(workspaceId: string, convId: string): boolean {
    return (titlePendingByWorkspace.value[workspaceId] ?? []).includes(convId)
  }

  return {
    conversationsByWorkspace,
    titlePendingByWorkspace,
    setConversations,
    upsertConversation,
    patchConversation,
    removeConversation,
    getConversations,
    setLastActive,
    getLastActive,
    markTitlePending,
    unmarkTitlePending,
    isTitlePending,
  }
}
