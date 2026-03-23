import {useAttachingMediaStore, type AttachedFile} from "~/stores/attachingMedia";
import {ApiController} from "~/scripts/shared/api/controller";


let init: boolean = false;

export const useAttachMedia = () => {
    const store = useAttachingMediaStore();
    const $api = new ApiController();
    const $env = useEnv();

    if (!init) {
        init = true;
        store.onAttach(async (attachedFile: AttachedFile) => {
            $env.sendingMessagesBlocked.value = true; // todo: отрефакторить этот кусок дерьма и убрать нахуй вообще этот EnvironmentController

            try {
                const {id, type} = await $api.uploadFile(attachedFile.file);
                store.loadFile(attachedFile.hash, id, type);
            } catch (e) {
                store.loadFile(attachedFile.hash, null, null, "NOT/STATED");
            } finally {
                $env.sendingMessagesBlocked.value = false;
            }
        });
    }

    const attachFile = (file: File): AttachedFile => {
        return store.attachFile(file);
    }

    const detachFile = (hash: string) => {
        store.detachFile(hash);
    }

    const detachAll = () => {
        [...store.attachedFiles].forEach((file) => {
            store.detachFile(file.hash)
        });
    }

    const {onDetach, onAttach, onLoad, attachedFiles} = store;

    const hasAttachedFiles = computed(() => attachedFiles.length > 0);

    return {
        attachFile,
        detachFile,
        detachAll,
        attachedFiles,
        hasAttachedFiles,
        onDetach,
        onAttach,
        onLoad
    }
}