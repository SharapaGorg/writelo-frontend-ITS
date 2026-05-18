import { toast } from 'vue-sonner'
import { getToasterPosition } from '~/scripts/features/utils/toater'

type Translator = (key: string, params?: Record<string, unknown>) => string

const opts = () => ({ position: getToasterPosition() } as const)

export const toastInviteSent = (t: Translator, email: string) =>
  toast(t('team.toasts.inviteSent', { email }), { type: 'success', ...opts() })

export const toastInviteRevoked = (t: Translator) =>
  toast(t('team.toasts.inviteRevoked'), { type: 'success', ...opts() })

export const toastMemberRemoved = (t: Translator) =>
  toast(t('team.toasts.memberRemoved'), { type: 'success', ...opts() })

export const toastRoleChanged = (t: Translator) =>
  toast(t('team.toasts.roleChanged'), { type: 'success', ...opts() })

export const toastOwnershipTransferred = (t: Translator) =>
  toast(t('team.toasts.ownershipTransferred'), { type: 'success', ...opts() })

export const toastInviteDuplicate = (t: Translator) =>
  toast(t('team.toasts.inviteDuplicate'), { type: 'error', ...opts() })

export const toastInviteAccepted = (t: Translator) =>
  toast(t('team.toasts.inviteAccepted'), { type: 'success', ...opts() })

export const toastInviteDeclined = (t: Translator) =>
  toast(t('team.toasts.inviteDeclined'), { ...opts() })

export const toastForbiddenLocal = (t: Translator) =>
  toast(t('team.toasts.forbidden'), { type: 'error', ...opts() })
