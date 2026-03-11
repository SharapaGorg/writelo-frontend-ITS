import {ApiController} from "~/scripts/shared/api/controller";
import type {ImageHistoryItem} from "../types";

const $api = new ApiController();

const images = ref<ImageHistoryItem[]>([]);
const isLoading = ref(false);
const hasMore = ref(true);
const isInitialized = ref(false);

const LIMIT = 20;

export const useImageHistory = () => {
    const fetchImages = async (reset: boolean = false) => {
        if (isLoading.value || (!hasMore.value && !reset)) return;

        if (reset) {
            images.value = [];
            hasMore.value = true;
        }

        isLoading.value = true;

        try {
            const offset = reset ? 0 : images.value.length;
            const response = await $api.getImageHistory(offset, LIMIT);

            if (response.length < LIMIT) {
                hasMore.value = false;
            }

            images.value = [...images.value, ...response];
            isInitialized.value = true;
        } catch (e) {
            console.error('Failed to fetch image history:', e);
        } finally {
            isLoading.value = false;
        }
    };

    const getImageUrl = (image: ImageHistoryItem): string | null => {
        if (!image.accessHash) return null;
        return `${$api['domain']}/images/${image.id}_${image.accessHash}`;
    };

    const addToHistory = (image: ImageHistoryItem) => {
        images.value = [image, ...images.value];
    };

    return {
        images: computed(() => images.value),
        isLoading: computed(() => isLoading.value),
        hasMore: computed(() => hasMore.value),
        isInitialized: computed(() => isInitialized.value),
        fetchImages,
        getImageUrl,
        addToHistory
    };
};
