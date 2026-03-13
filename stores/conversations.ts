import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {ApiController} from '~/scripts/shared/api/controller'
import {getChatsGroupsFormationArray} from '~/scripts/features/conversations/formatting'
import type {ShortConversationType} from '~/lib-modules/conversations'
import {eventBus} from '~/composables/eventBus'
import type {DialogTitleUpdated} from '~/composables/eventBus/types'
import {useDemoMode, demoConversations} from '~/lib-modules/demo-mode'

const apiController = new ApiController()

export const useConversationsStore = defineStore('conversations', () => {
    const loading = ref(true)
    const conversations = ref<ShortConversationType[]>([])
    const removedConversations = ref<Set<string>>(new Set())

    /**
     * groups — теперь computed, возвращает новый формат (array)
     * [
     *   { key: "today", label: "today", chats: [...] },
     *   { key: "2024", label: "2024", chats: [...] },
     *   ...
     * ]
     */
    const groups = computed(() => getChatsGroupsFormationArray(conversations.value))

    async function init() {
        const { isGuestDemo } = useDemoMode()

        loading.value = true
        conversations.value = []

        // In guest demo mode, use static demo conversations
        if (isGuestDemo.value) {
            conversations.value = [...demoConversations]
            loading.value = false
            return
        }

        // Normal flow - fetch from API
        const limit = 20
        for (let page = 0; page < 10; page++) {
            const pack = await apiController.getConversations(page * limit, limit)
            if (!pack || pack.length === 0) break
            conversations.value.push(...pack)
        }

        loading.value = false
    }

    function updateDialogTitle(data: DialogTitleUpdated) {
        console.log('[conversationsStore] updateDialogTitle called', data)
        console.log('[conversationsStore] conversations count:', conversations.value.length)
        console.log('[conversationsStore] looking for privateId:', data.conversation_id)
        const conv = conversations.value.find(c => c.privateId === data.conversation_id)
        console.log('[conversationsStore] found conversation:', conv)
        if (conv) {
            conv.title = data.title
            console.log('[conversationsStore] title updated to:', data.title)
        }
    }

    async function removeConversation(privateId: string, t: (key: string) => string) {
        removedConversations.value.add(privateId)
        await apiController.deleteConversation(privateId)
    }

    async function shareConversation(privateId: string) {
        const result = await apiController.shareConversation(privateId)
        const conv = conversations.value.find(c => c.privateId === privateId)
        if (conv) conv.shareId = result.shareId
        return result
    }

    async function unshareConversation(privateId: string) {
        const result = await apiController.unshareConversation(privateId)
        const conv = conversations.value.find(c => c.privateId === privateId)
        if (conv) conv.shareId = null
        return result
    }

    function isConversationRemoved(id: string) {
        return removedConversations.value.has(id)
    }

    function addConversation(conversation: ShortConversationType) {
        // Add to the beginning of the list
        conversations.value.unshift(conversation)
    }

    function subscribeToEvents() {
        // @ts-ignore
        eventBus.on('dialogTitleUpdated', updateDialogTitle)
    }

    function unsubscribeFromEvents() {
        // @ts-ignore
        eventBus.off('dialogTitleUpdated', updateDialogTitle)
    }

    return {
        loading,
        conversations,
        groups,
        init,
        addConversation,
        subscribeToEvents,
        unsubscribeFromEvents,
        removeConversation,
        isConversationRemoved,
        shareConversation,
        unshareConversation
    }
})
