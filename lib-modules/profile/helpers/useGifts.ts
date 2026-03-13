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

export const useGifts = () => {
    const fetchGifts = async () => {
        // In demo mode, use static gifts
        const userController = useUserController();
        if (!userController.getToken()) {
            gifts.value = [...DEMO_GIFTS];
            giftsFetched.value = true;
            return;
        }

        let init = 0;
        const step = 3;

        while (true) {
            let response = await $api.getUserGifts(init, step);

            gifts.value = [...gifts.value, ...response]
            init += step;

            if (!response.length) {
                giftsFetched.value = true;
                break;
            }
        }
    }

    return {
        fetchGifts,
        gifts,
        giftsFetched
    }
}