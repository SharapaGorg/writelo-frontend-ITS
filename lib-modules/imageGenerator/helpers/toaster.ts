import {toast} from "vue-sonner";
import {getToasterPosition} from "~/scripts/features/utils/toater";
import type {Composer} from "vue-i18n";

export const toastImageCopySuccess = (t_: Composer['t']) => {
    toast.success(t_("imageGenerator.copy.success"), {
        position: getToasterPosition()
    });
}

export const toastImageCopyError = (t_: Composer['t']) => {
    toast.error(t_("imageGenerator.copy.error"), {
        position: getToasterPosition()
    });
}

export const toastImageDownloadSuccess = (t_: Composer['t'], format: string) => {
    toast.success(t_("imageGenerator.download.success", { format }), {
        position: getToasterPosition()
    });
}

export const toastImageDownloadError = (t_: Composer['t']) => {
    toast.error(t_("imageGenerator.download.error"), {
        position: getToasterPosition()
    });
}

export const toastImageConvertError = (t_: Composer['t']) => {
    toast.error(t_("imageGenerator.download.convertError"), {
        position: getToasterPosition()
    });
}

export const toastImageLoadError = (t_: Composer['t']) => {
    toast.error(t_("imageGenerator.download.loadError"), {
        position: getToasterPosition()
    });
}