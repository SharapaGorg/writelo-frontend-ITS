const CONVERSATION_TITLE_LIMIT = 20;

export const eraseConversationTitle = (conversationTitle: string, limit = CONVERSATION_TITLE_LIMIT): string => {
    if (conversationTitle.length < limit) {
        return conversationTitle;
    }

    return conversationTitle.slice(0, limit) + '...';
}