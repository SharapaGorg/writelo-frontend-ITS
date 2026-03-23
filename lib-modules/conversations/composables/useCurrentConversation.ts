import {useCurrentConversationStore} from "~/lib-modules/conversations";
import {generateUUID} from "~/scripts/features/utils";
import {Role} from '~/lib-modules/conversations'
import {toastAlreadyNewChat} from "~/scripts/features/utils/toater";
import {Routes} from "~/scripts/shared/types";

export const useCurrentConversation = () => {
    const $store = useCurrentConversationStore();

    /**
     * Visually add message to the board

     * @param text
     * @param role
     * @param created_at
     *
     * @returns uuid of new message (local id to be replaced after actual API request)
     */
    const addMessage = (
        text: string,
        role: Role = Role.user,
        created_at?: string | undefined,
    ) => {
        console.log('ADD MESSAGE:', text);

        if (!created_at) {
            created_at = (new Date()).toString();
        }

        let uuid = generateUUID();

        let files = [];
        const {attachedFiles} = useAttachMedia();

        if (role === Role.user) {
            for (let attachedFile of attachedFiles) {
                files.push({
                    name: attachedFile.name,
                    type: attachedFile.fileType,
                    file_id: 0,
                    access_hash: attachedFile.hash,
                    content: attachedFile.file
                });
            }
        }

        $store.addMessage({
            id: uuid,
            role: role,
            text: text,
            created_at: created_at,
            processing: role === Role.assistant && !text.length,
            // @ts-ignore
            files: files
        })

        return uuid;
    }


    const makeNewChat = () => {
        const {detachAll} = useAttachMedia();
        detachAll();

        clearConversation();
        navigateTo(Routes.newConversation);
    }

    const clearConversation = () => {
        $store.setMessages([]);
        $store.setTitle(null);
    }


    return {
        addMessage,
        makeNewChat,
        clearConversation
    }
}