export type ChatsFormationType = {
    [key in ChatsFormationSection]: ShortConversationType[]
};

export interface ChatsGroupSection {
    key: string;                      // 'today' | 'last_7_days' | '2025'
    label: string;                    // Для t()
    chats: ShortConversationType[];   // Список диалогов
}

export type ChatsGroupsArray = ChatsGroupSection[];

export type ChatsFormationSection = 'today' | 'last_7_days' | 'last_30_days' | string // not string, full year actually

export enum Role {
    assistant = 0,
    user = 1
}

export enum FileForm {
    text = 0,
    image = 1,
    audio = 2,
    video = 3,
}

export type FileType = {
    name: string,
    type: FileForm,
    fileId: string,
    accessHash: string,
    content: string // only locally
}

export type MessageType = {
    "id": number | string, // uuid locally (string), integer globally
    "role": Role,
    "text": string,
    "file": FileType,
    files: FileType[], // локальная херня, чтобы сразу показывать картинки
    "createdAt": string,
    // only locally
    "processing": boolean,
    error: boolean,
}

export type GroupType = {
    mainMessageId: number,
    messageIds: number[]
}

export type ConversationType = {
    privateId: string,
    shareId?: string,
    title: string,
    messages: MessageType[],
    createdAt: string,
    modifiedAt: string,
    groups?: GroupType[]
}

export type ShortConversationType = {
    privateId: string,
    title: string,
    shareId?: string | null,
    createdAt: string,
    modifiedAt: string
}

export type SendMessageStreamResponse = {
    response: Promise<any>,
    requestUuid: string,
    responseUuid: string
}

export type UploadFileResponse = {
    id: string,
    type: FileForm
}

export type CreateConversationResponse = {
    privateId: string,
    title: string,
    shareId?: string,
    messages: MessageType[],
    createdAt: string,
    modifiedAt: string
}

export type MessageStreamData = {
    action: 'create_conversation' | 'process_response' | 'message_ids_replace' | 'set_title' | 'finish_response' | 'text_chunk' | 'request_message_id' | 'response_message_id' | 'response_end',
    map: null | { [key: string]: number },
    messageId: number | string,
    dt: string, // chunk of model response
    title: string | null | undefined,
    success: boolean | null | undefined, // is present if action = 'response_end' or 'finish_response'
    message: string | null | undefined // is string, if success is false - reason of failure
    error: string | null | undefined // if success : false, error field is presented (legacy)
}

export type FileTypesResponse = {
    extensions: { [typeName: string]: string[] }
}