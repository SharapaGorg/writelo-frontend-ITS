import mitt from 'mitt'
import type {FillNewConversationType} from "~/composables/eventBus/types";
import type {FileForm} from "~/lib-modules/conversations";

export type EventEditMessage = {
    messageId: number,
    newText: string
}

export type OpenFileFullScreen = {
    type: FileForm,
    content: string
}


type Events = {
    openFileFullScreen: OpenFileFullScreen,
    rerollMessage: {},
    stopGeneration: {},
    editMessage: EventEditMessage,
    fillNewConversation: FillNewConversationType,
    changeNavbarVisibility: boolean,
    dialogTitleUpdated: undefined
}

export const eventBus = mitt<Events>();