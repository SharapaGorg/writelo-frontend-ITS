import {computed} from "vue";

export const isInTelegramApp = computed(() => {
    const token = useUserController().getToken()
    return token ? token.includes('hash=') : false
})
