import { computed, ref } from 'vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useAssistantApi } from '../helpers/api'
import { useAssistantStore } from '../stores/assistantStore'

const isLoading = ref(false)
const search = ref('')

export function useAssistantHistory() {
  const { requireWorkspaceId, currentWorkspace } = useWorkspaceContext()
  const api = useAssistantApi()
  const store = useAssistantStore()

  const items = computed(() => {
    const wid = currentWorkspace.value?.id
    if (!wid) return []
    const list = store.getConversations(wid)
    const q = search.value.trim().toLowerCase()
    if (!q) return list
    return list.filter(c => (c.title ?? '').toLowerCase().includes(q))
  })

  async function refresh() {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return
    }
    isLoading.value = true
    try {
      const list = await api.listConversations(wid)
      store.setConversations(wid, list)
    } finally {
      isLoading.value = false
    }
  }

  async function rename(id: string, title: string) {
    const wid = requireWorkspaceId()
    const trimmed = title.trim().slice(0, 64)
    const updated = await api.renameConversation(wid, id, trimmed)
    store.upsertConversation(wid, updated)
  }

  async function remove(id: string) {
    const wid = requireWorkspaceId()
    await api.deleteConversation(wid, id)
    store.removeConversation(wid, id)
  }

  function setSearch(v: string) {
    search.value = v
  }

  return {
    items,
    isLoading: computed(() => isLoading.value),
    search: computed(() => search.value),
    setSearch,
    refresh,
    rename,
    remove,
  }
}
