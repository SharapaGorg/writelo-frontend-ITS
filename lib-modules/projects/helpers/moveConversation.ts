import type {
    ChatsFormationSection,
    ChatsFormationType,
    ShortConversationType
} from "~/lib-modules/conversations";

/**
 * Удаляет диалог из проекта (возвращает копию)
 *
 * @param chats
 * @param conversationId
 */
export function removeConversationFromFormation(
    chats: ChatsFormationType,
    conversationId: ShortConversationType['privateId']
): {
    updatedChats: ChatsFormationType,
    conversation: ShortConversationType | undefined
} {
    let updatedChats: ChatsFormationType = {};
    let foundConversation: ShortConversationType | undefined = undefined;

    for (const [section, conversations] of Object.entries(chats)) {
        foundConversation = conversations.find(conv => conv.privateId === conversationId);

        const filteredConversations = conversations.filter(
            conv => conv.privateId !== conversationId
        );

        // Добавляем секцию только если в ней есть диалоги
        if (filteredConversations.length > 0) {
            updatedChats[section as ChatsFormationSection] = filteredConversations;
        }
    }

    return {updatedChats, conversation: foundConversation};
}

/**
 * Добавляет диалог в проект (возвращает копию)
 *
 * @param chats
 * @param conversation
 */
export function addConversationToFormation(
    chats: ChatsFormationType,
    conversation: ShortConversationType
): ChatsFormationType {
    let result: ChatsFormationType = {...chats};
    if (!result['today']) {
        result['today'] = [];
    }

    result['today'].push(conversation);

    return result;
}

interface MoveConversationToFormation {
    oldFormation: ChatsFormationType, // измененные данные проекта, ИЗ которого удаляют диалог
    newFormation: ChatsFormationType // измененные данные проекта, В который добавляют диалог
}

/**
 * Заведует полной логикой переноса диалога из одного проекта в другой
 *
 * @param fromFormation проект, из которого нужно удалить диалог
 * @param toFormation проект, в который нужно добавить диалог
 * @param conversationId айди диалога
 *
 * @returns см. MoveConversationToFormation тип
 */
export function moveConversationToFormation(
    fromFormation: ChatsFormationType,
    toFormation: ChatsFormationType | undefined,
    conversationId: ShortConversationType['privateId']
): MoveConversationToFormation {
    let newFormation = {};

    const {conversation, updatedChats} = removeConversationFromFormation(fromFormation, conversationId);

    if (toFormation !== undefined) { // если данные проекта, в который переносится диалог, уже были подгружены, то можно использовать внутренний механизм, если нет, придется спрашивать у API актуальные данные вручную
        newFormation = addConversationToFormation(toFormation, conversation!);
    }

    return {oldFormation: updatedChats, newFormation}
}