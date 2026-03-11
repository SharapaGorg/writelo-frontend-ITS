/**
 * Scripts related to toaster - warnings, info messages, etc.
 */

import {toast} from "vue-sonner";
import {getScreenSize} from "~/scripts/features/utils/index";
import {ScreenSize} from "~/scripts/features/utils/types";
import i18n from "~/scripts/shared/i18n";

export const getToasterPosition = () => {
    return getScreenSize() === ScreenSize.sm ? 'top-center' : 'bottom-right';
}

export const toastError = (message: string) => {
    toast(message, {
        type: "error",
        position: getToasterPosition()
    })
}

export const toastFeatureUnavailable = (t_) => {
    toast(t_("toaster-restricted"), {
        type: "error",
        position: getToasterPosition()
    })
}

export const toastForbidden = () => {
    const message = i18n.global.t('toaster-restricted')
    toast(message, {
        type: "error",
        position: getToasterPosition()
    })
}

export const toastRateLimit = () => {
    const message = i18n.global.t('toaster-rate-limit')
    toast(message, {
        type: "error",
        position: getToasterPosition()
    })
}

export const toastGenericError = () => {
    const message = i18n.global.t('toaster-generic-error')
    toast(message, {
        type: "error",
        position: getToasterPosition()
    })
}

export const toastCopyCodeClipboard = (t_) => {
    toast(t_('toaster-copy-code'), {
        // type: 'info'
        position: getToasterPosition()
    })
}

export const toastCopyClipboard = (t_) => {
    toast(t_('toaster-copy-text'), {
        // type: 'info'
        position: getToasterPosition()
    })
}

export const toastAlreadyNewChat = (t_) => {
    toast(t_('toaster-new-chat'), {
        type: 'warning',
        position: getToasterPosition()
    })
}

export const toastConversationRemoved = (t_) => {
    toast(t_('toaster.conversation-removed'), {
        // type: 'info'
        position: getToasterPosition()
    })
}

export const toastShareSuccess = (t_) => {
    toast(t_('toaster-share-success'), {
        type: 'success',
        position: getToasterPosition()
    })
}

export const toastShareError = (t_) => {
    toast(t_('toaster-share-error'), {
        type: 'error',
        position: getToasterPosition()
    })
}

export const toastDeleteSuccess = (t_) => {
    toast(t_('toaster-delete-success'), {
        type: 'success',
        position: getToasterPosition()
    })
}

export const toastDeleteError = (t_) => {
    toast(t_('toaster-delete-error'), {
        type: 'error',
        position: getToasterPosition()
    })
}

export const toastUnshareSuccess = (t_) => {
    toast(t_('toaster-unshare-success'), {
        type: 'success',
        position: getToasterPosition()
    })
}

export const toastUnshareError = (t_) => {
    toast(t_('toaster-unshare-error'), {
        type: 'error',
        position: getToasterPosition()
    })
}

export const toastChangesSavedSuccess = (t_) => {
    toast(t_('changes-saved'), {
        type: 'success',
        position: getToasterPosition()
    })
}

export const toastSomeError = (t_) => {
    toast(t_('something-went-wrong'), {
        type: 'error',
        position: getToasterPosition()
    })
}

export const toastOnboardingComplete = (t_) => {
    toast(t_('toaster.onboarding-complete'), {
        type: 'success',
        position: getToasterPosition()
    })
}