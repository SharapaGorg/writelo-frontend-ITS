import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiController } from '~/scripts/shared/api/controller'
import { getChatsGroupsFormationArray } from '~/scripts/features/conversations/formatting'
import type { ShortConversationType } from '~/lib-modules/conversations'
import type { ConversationListItemDto } from '~/scripts/shared/types/workspace'
import { eventBus } from '~/composables/eventBus'
import type { DialogTitleUpdated } from '~/composables/eventBus/types'
import { useDemoMode, demoConversations } from '~/lib-modules/demo-mode'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const apiController = new ApiController()

// Adapter to convert new API format to old format for backwards compatibility
function adaptConversation(dto: ConversationListItemDto): ShortConversationType {
    return {
        privateId: dto.id,
        title: dto.title,
        createdAt: dto.createdAt,
        modifiedAt: dto.modifiedAt,
        shareId: null, // Sharing removed in new API
    }
}

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

        // Get current workspace ID
        const workspaceContext = useWorkspaceContext()
        if (!workspaceContext.isReady.value) {
            console.warn('[conversationsStore] Workspace context not ready, skipping init')
            loading.value = false
            return
        }

        const workspaceId = workspaceContext.currentWorkspaceId.value!

        // Fetch conversations from workspace-scoped API
        const limit = 20
        for (let page = 0; page < 10; page++) {
            try {
                const response = await apiController.getWorkspaceConversations(
                    workspaceId,
                    page * limit,
                    limit
                )
                if (!response || !response.items || response.items.length === 0) break

                // Adapt to old format for backwards compatibility
                const adapted = response.items.map(adaptConversation)
                conversations.value.push(...adapted)

                // Stop if no more pages
                if (!response.hasMore) break
            } catch (error) {
                console.error('[conversationsStore] Error fetching conversations:', error)
                break
            }
        }

        loading.value = false
    }

    function updateDialogTitle(data: DialogTitleUpdated) {
        console.log('[conversationsStore] updateDialogTitle called', data)
        // Support both old (privateId) and new (id) formats
        const conv = conversations.value.find(
            c => c.privateId === data.conversation_id
        )
        if (conv) {
            conv.title = data.title
            console.log('[conversationsStore] title updated to:', data.title)
        }
    }

    async function removeConversation(conversationId: string, t: (key: string) => string) {
        removedConversations.value.add(conversationId)

        // Get workspace ID
        const workspaceContext = useWorkspaceContext()
        const workspaceId = workspaceContext.requireWorkspaceId()

        await apiController.deleteWorkspaceConversation(workspaceId, conversationId)
    }

    // Note: Sharing removed in new API - these methods kept for interface compatibility
    async function shareConversation(conversationId: string) {
        console.warn('[conversationsStore] shareConversation: Sharing is not available in new API')
        return null
    }

    async function unshareConversation(conversationId: string) {
        console.warn('[conversationsStore] unshareConversation: Sharing is not available in new API')
        return null
    }

    function isConversationRemoved(id: string) {
        return removedConversations.value.has(id)
    }

    function addConversation(conversation: ShortConversationType) {
        // Add to the beginning of the list
        conversations.value.unshift(conversation)
    }

    /**
     * Add conversation from new API format
     */
    function addConversationDto(dto: ConversationListItemDto) {
        conversations.value.unshift(adaptConversation(dto))
    }

    function subscribeToEvents() {
        // @ts-ignore
        eventBus.on('dialogTitleUpdated', updateDialogTitle)
    }

    function unsubscribeFromEvents() {
        // @ts-ignore
        eventBus.off('dialogTitleUpdated', updateDialogTitle)
    }

    /**
     * Clear store (on workspace change or logout)
     */
    function clear() {
        conversations.value = []
        removedConversations.value.clear()
        loading.value = true
    }

    return {
        loading,
        conversations,
        groups,
        init,
        addConversation,
        addConversationDto,
        subscribeToEvents,
        unsubscribeFromEvents,
        removeConversation,
        isConversationRemoved,
        shareConversation,
        unshareConversation,
        clear,
    }
})
