import {useAttachingMediaStore, type AttachedFile} from "~/stores/attachingMedia";
import {ApiController} from "~/scripts/shared/api/controller";

// Routes where there's no workspace/auth context — landing showcase. Attach
// flow there is purely visual; skip the real upload so visitors don't see
// failed-upload state (and we don't fire unauthenticated requests).
const NO_UPLOAD_ROUTES = ['/landing-new']

let init: boolean = false;

export const useAttachMedia = () => {
    const store = useAttachingMediaStore();
    const $api = new ApiController();
    const $env = useEnv();
    const route = useRoute();

    if (!init) {
        init = true;
        store.onAttach(async (attachedFile: AttachedFile) => {
            const path = route?.path ?? (import.meta.client ? window.location.pathname : '')
            if (NO_UPLOAD_ROUTES.some(p => path.startsWith(p))) {
                // Showcase: pretend the upload succeeded with a dummy id so the
                // chip renders as "loaded" and detach works normally.
                store.loadFile(attachedFile.hash, `showcase-${attachedFile.hash}`, 'image')
                return
            }

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