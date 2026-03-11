import {ApiController} from "~/scripts/shared/api/controller";
import type {UserGift} from "~/lib-modules/profile/types";

const $api = new ApiController();
const gifts = ref<UserGift[]>([]);
const giftsFetched = ref<boolean>(false);

export const useGifts = () => {
    const fetchGifts = async () => {
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