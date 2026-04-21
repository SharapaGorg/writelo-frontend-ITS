import {ApiController} from "~/scripts/shared/api/controller";
import type {UserGift} from "~/lib-modules/profile/types";
import {useUserController} from "~/composables/user";

const $api = new ApiController();
const gifts = ref<UserGift[]>([]);
const giftsFetched = ref<boolean>(false);

// Static demo gifts
const DEMO_GIFTS: UserGift[] = [
    {
        hash: 'demo-gift-1',
        subscriptionId: 2,
        activatedAt: null,
        activator: null
    },
    {
        hash: 'demo-gift-2',
        subscriptionId: 2,
        activatedAt: '2026-03-01T12:00:00Z',
        activator: 'Иван Петров'
    }
];

const PAGE_SIZE = 50;

export const useGifts = () => {
    const fetchGifts = async () => {
        giftsFetched.value = false;
        gifts.value = [];

        const userController = useUserController();
        if (!userController.getToken()) {
            gifts.value = [...DEMO_GIFTS];
            giftsFetched.value = true;
            return;
        }

        try {
            let offset = 0;
            while (true) {
                const response = await $api.getUserGifts(offset, PAGE_SIZE);
                const page = Array.isArray(response) ? response : [];
                if (page.length) {
                    gifts.value = [...gifts.value, ...page];
                    offset += page.length;
                }
                if (page.length < PAGE_SIZE) break;
            }
        } catch (e) {
            console.warn('[useGifts] failed to fetch gifts', e);
        } finally {
            giftsFetched.value = true;
        }
    }

    return {
        fetchGifts,
        gifts,
        giftsFetched
    }
}
