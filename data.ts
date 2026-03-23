export enum MessageFileType {
    Text = 0,
    Image = 1,
    Audio = 2,
    Video = 3,
    Document = 4,
    Raw = 5
}

export enum MessageRole {
    Assistant = 0,
    User = 1
}

export interface MessageFile {
    name: string;
    type: MessageFileType;
    fileId: string;
    accessHash: string;
}

export interface Message {
    id: number;
    role: MessageRole;
    text: string;
    file?: MessageFile;
    createdAt: string;
}

export interface GroupedMessages {
    mainMessageId: number;
    messageIds: number[];
}

export interface Conversation {
    privateId: string;
    shareId?: string;
    title: string;
    messages: Message[];
    createdAt: string;
    modifiedAt: string;
    groups?: GroupedMessages[];
}

