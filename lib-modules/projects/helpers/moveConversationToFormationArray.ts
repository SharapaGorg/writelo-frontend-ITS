import type {
    ShortConversationType,
    ChatsGroupsArray
} from '~/lib-modules/conversations'

/**
 * Удаляет диалог из formation (array-структуры)
 */
export function removeConversationFromFormationArray(
    chats: ChatsGroupsArray | undefined,
    conversationId: ShortConversationType['privateId']
): {
    updatedChats: ChatsGroupsArray
    conversation?: ShortConversationType
} {
    if (!Array.isArray(chats)) return { updatedChats: [], conversation: undefined }

    let found: ShortConversationType | undefined

    const updated: ChatsGroupsArray = chats
        .map(section => {
            const filtered = section.chats.filter(c => c.privateId !== conversationId)
            if (!found && filtered.length < section.chats.length) {
                found = section.chats.find(c => c.privateId === conversationId)
            }
            return { ...section, chats: filtered }
        })
        .filter(section => section.chats.length > 0)

    return { updatedChats: updated, conversation: found }
}

/**
 * Добавляет диалог в formation (в today, либо создаёт её)
 */
export function addConversationToFormationArray(
    chats: ChatsGroupsArray | undefined,
    conversation: ShortConversationType
): ChatsGroupsArray {
    const copy = Array.isArray(chats)
        ? chats.map(sec => ({ ...sec, chats: [...sec.chats] }))
        : []

    const today = copy.find(s => s.key === 'today')
    if (today) {
        today.chats.unshift(conversation)
    } else {
        copy.unshift({ key: 'today', label: 'today', chats: [conversation] })
    }
    return copy
}

/**
 * Переносит диалог из одной formation в другую
 */
export function moveConversationToFormationArray(
    fromFormation: ChatsGroupsArray | undefined,
    toFormation: ChatsGroupsArray | undefined,
    conversationId: ShortConversationType['privateId']
): {
    oldFormation: ChatsGroupsArray
    newFormation: ChatsGroupsArray
} {
    const { updatedChats, conversation } = removeConversationFromFormationArray(
        fromFormation,
        conversationId
    )

    let newFormation: ChatsGroupsArray = Array.isArray(toFormation)
        ? [...toFormation]
        : []

    if (conversation) {
        newFormation = addConversationToFormationArray(newFormation, conversation)
    }

    return { oldFormation: updatedChats, newFormation }
}
