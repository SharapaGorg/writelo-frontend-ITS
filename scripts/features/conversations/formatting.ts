import type {
    ChatsFormationSection,
    ChatsFormationType, ChatsGroupSection,
    ShortConversationType
} from "~/lib-modules/conversations";

function isToday(date: Date, now: Date): boolean {
    return date.toDateString() === now.toDateString();
}

function isWithinLastDays(date: Date, days: number, now: Date): boolean {
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - days);
    return date > pastDate && date <= now;
}

export const getConversationGroup = (datetime: Date | string): ChatsFormationSection => {
    // form group name of dialog by its creation time
    if (typeof datetime === 'string') {
        datetime = new Date(datetime);
    }

    const now = new Date();

    if (isToday(datetime, now)) {
        return "today";
    } else if (isWithinLastDays(datetime, 7, now)) {
        return "last_7_days";
    } else if (isWithinLastDays(datetime, 30, now)) {
        return "last_30_days";
    }

    return datetime.getFullYear().toString();
}


export const getChatsGroupsFormation = (conversations: ShortConversationType[]): ChatsFormationType => {
    let result: ChatsFormationType = {};

    for (let conversation of conversations) {
        let group = getConversationGroup(conversation.modifiedAt);
        if (!result[group]) {
            result[group] = []
        }
        result[group].push(conversation);
    }

    const ordered: ChatsFormationType = {};

    (['today', 'last_7_days', 'last_30_days'] as ChatsFormationSection[]).forEach(key => {
        if (result[key]) ordered[key] = result[key];
    });

    Object.keys(result).forEach(key => {
        if (!ordered[key]) ordered[key] = result[key];
    });

    return ordered;
}


export const getChatsGroupsFormationArray = (conversations: ShortConversationType[]): ChatsGroupSection[] => {
    const buckets: Record<string, ShortConversationType[]> = {}

    for (const conv of conversations) {
        const groupKey = getConversationGroup(conv.modifiedAt)
        if (!buckets[groupKey]) buckets[groupKey] = []
        buckets[groupKey].push(conv)
    }

    const order = ['today', 'last_7_days', 'last_30_days']

    const ordered: ChatsGroupSection[] = []

    // добавляем фиксированные
    for (const key of order) {
        if (buckets[key]) {
            ordered.push({key, label: key, chats: buckets[key]})
        }
    }

    // добавляем годовые секции отдельно и сортируем по году
    const yearSections = Object.keys(buckets)
        .filter(k => !order.includes(k))
        .map(k => ({
            key: k,
            label: k,
            chats: buckets[k]
        }))
        .sort((a, b) => Number(b.key) - Number(a.key)) // старые сверху, новые снизу

    return [...ordered, ...yearSections]
}