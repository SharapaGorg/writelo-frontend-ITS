import {ref, computed, readonly} from 'vue'
import type {ShortConversationType} from "~/lib-modules/conversations";

// Global state for conversation-to-project assignment mode
const assignmentMode = ref<{
    conversationId: ShortConversationType['privateId'] | null
    conversationTitle: ShortConversationType['title'] | null
}>({
    conversationId: null,
    conversationTitle: null
})

export const useConversationAssignment = () => {
    const enterAssignmentMode = (conversationId: ShortConversationType['privateId'], conversationTitle: ShortConversationType['title']) => {
        assignmentMode.value = {
            conversationId,
            conversationTitle
        }
    }

    const exitAssignmentMode = () => {
        assignmentMode.value = {
            conversationId: null,
            conversationTitle: null
        }
    }

    const isInAssignmentMode = computed(() => assignmentMode.value.conversationId !== null)

    return {
        assignmentMode: readonly(assignmentMode),
        enterAssignmentMode,
        exitAssignmentMode,
        isInAssignmentMode
    }
}