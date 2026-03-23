import {defineStore} from 'pinia'
import {generateUUID} from "~/scripts/features/utils";
import {FileForm} from "~/lib-modules/conversations/types";

const MAX_FILES = 3; // максимум прикрепленных файлов в одном сообщении

export type AttachedFile = {
    file: File;
    date: Date; // локальная дата добавления (для сортировки)
    hash: string; // сначала локальный, потом заменяется на тот, что прилетел с API
    name: string;
    fileType?: FileForm | null; // не числится, пока не получены данные с API
    loaded?: boolean;
    error?: string | null;
}

export type AttachCallback = (attachedFile: AttachedFile) => void;
export type DetachCallback = (detachedFile: AttachedFile) => void;
export type LoadCallback = (detachedFile: Required<AttachedFile>) => void;

/**
 * Стор для хранения прикрепленных файлов и манипуляции с их состоянием
 * Пример состояния: загружен / грузится
 */
export const useAttachingMediaStore = defineStore('attachingMedia', () => {
    const attachedFiles = reactive<AttachedFile[]>([]);

    let detachCallbacks: DetachCallback[] = [];
    let attachCallbacks: AttachCallback[] = [];
    let loadCallbacks: LoadCallback[] = [];

    /**
     *
     * @param hash локальный хеш файла
     * @param apiHash хеш файла после загрузки на сервер
     * @param apiFileType тип файла, полученный из апи после загрузки файла
     * @param error есть ли ошибка при загрузке файла
     *
     * После загрузки на сервер прикрепленного файла нужно обновить пустые поля (hash, fileType),
     * для чего эта функция и используется
     */
    const loadFile = (hash: string, apiHash: string | null, apiFileType: FileForm | null, error?: string | null) => {
        const index = attachedFiles.findIndex(f => f.hash === hash);
        if (index === -1) {
            console.warn('[store:attachingMedia] < File to be loaded not found');
            return;
        }

        if (apiHash) {
            attachedFiles[index].hash = apiHash;
        }
        attachedFiles[index].fileType = apiFileType;
        attachedFiles[index].loaded = true;
        attachedFiles[index].error = error;

        triggerLoadCallbacks(attachedFiles[index] as Required<AttachedFile>);
    }

    const attachFile = (file: File): AttachedFile | undefined => {
        const hash = generateUUID();
        const name = file.name;

        const doesFileExist = attachedFiles.some(f =>
            f.file.name === file.name &&
            f.file.size === file.size &&
            f.file.lastModified === file.lastModified
        );

        if (doesFileExist) {
            console.warn(`[store:attachingMedia] > File [${name}] already exist`);
            return;
        }

        const fileToAttach: AttachedFile = {file, hash, name, date: new Date()}

        if (attachedFiles.length < MAX_FILES) {
            attachedFiles.push(fileToAttach);

            triggerAttachCallbacks(fileToAttach);
            return fileToAttach;
        }

        attachedFiles[0] = fileToAttach;

        // сортирую в обратном порядке, чтобы каждый раз заменялся именно самый ранее добавленный файл
        attachedFiles.sort((a, b) => a.date.getTime() - b.date.getTime());

        triggerAttachCallbacks(fileToAttach);

        return fileToAttach;
    }

    const triggerAttachCallbacks = (attachedFile: AttachedFile) => {
        for (let callback of attachCallbacks) {
            callback(attachedFile);
        }
    }

    const triggerDetachCallbacks = (attachedFile: AttachedFile) => {
        for (let callback of detachCallbacks) {
            callback(attachedFile);
        }
    }

    const triggerLoadCallbacks = (attachedFile: Required<AttachedFile>) => {
        for (let callback of loadCallbacks) {
            callback(attachedFile);
        }
    }

    const detachFile = (hash: string): void => {
        const index = attachedFiles.findIndex(f => f.hash === hash);
        if (index === -1) {
            throw new Error(`Attached file ${hash} not found`);
        }

        const detachedFile = attachedFiles[index];
        attachedFiles.splice(index, 1);

        triggerDetachCallbacks(detachedFile);
    }

    const onDetach = (callback_: DetachCallback) => {
        detachCallbacks.push(callback_);
    }

    const onAttach = (callback_: AttachCallback) => {
        attachCallbacks.push(callback_);
    }

    /**
     * @param callback_
     * Когда файл загрузился на сервер
     */
    const onLoad = (callback_: LoadCallback) => {
        loadCallbacks.push(callback_);
    }

    return {
        // getters
        attachedFiles: computed(() => attachedFiles),
        // methods
        attachFile,
        detachFile,
        loadFile,
        // events
        onAttach,
        onDetach,
        onLoad
    }
})