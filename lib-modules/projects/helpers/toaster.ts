import {toast} from "vue-sonner";
import {getToasterPosition} from "~/scripts/features/utils/toater";
import type {Composer} from "vue-i18n";


export const toastProjectRemoved = (t_: Composer['t']) => {
    toast.success(t_("removeProject.success"), {
        position: getToasterPosition()
    })
}
