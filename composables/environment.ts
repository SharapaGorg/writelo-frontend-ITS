import {type Ref, ref} from 'vue';

let entity: null | EnvironmentController = null;

export function useEnv() {
    if (entity) {
        return entity;
    }

    entity = new EnvironmentController();
    return entity;
}


class EnvironmentController {
    processMessageId: Ref<number | string | null> = ref(null); // id of message, which is being generated right now

    loading: Ref<boolean> = ref(true);
    sendingMessagesBlocked: Ref<boolean> = ref(false);
}