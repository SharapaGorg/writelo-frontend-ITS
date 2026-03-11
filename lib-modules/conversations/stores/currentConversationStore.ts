import {defineStore} from 'pinia'
import type {MessageType} from "~/lib-modules/conversations";


export const useCurrentConversationStore = defineStore('currentConversation', () => {
    const messages = ref<MessageType[]>([]);
    const conversationTitle = ref<string | null>(null);

    const addMessage = (message: MessageType) => {
        messages.value.push(message);
    }

    const removeMessage = (id: MessageType["id"]) => {
        messages.value = messages.value.filter(item => item.id !== id);
    }

    const setMessages = (messages_: MessageType[]) => {
        messages.value = messages_;
    }

    const setTitle = (title: string | null) => {
        conversationTitle.value = title;
    }

    return {
        messages: computed(() => messages.value),
        conversationTitle: computed(() => conversationTitle.value),
        isConversationEmpty: computed(() => messages.value.length === 0),
        addMessage,
        removeMessage,
        setMessages,
        setTitle,
    }
})