import { toast } from 'vue-sonner'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const opts = () => ({ position: getToasterPosition() } as const)

export const toastInviteSent = (email: string) =>
  toast(`Приглашение отправлено: ${email}`, { type: 'success', ...opts() })

export const toastInviteRevoked = () =>
  toast('Приглашение отозвано', { type: 'success', ...opts() })

export const toastMemberRemoved = () =>
  toast('Участник удалён', { type: 'success', ...opts() })

export const toastRoleChanged = () =>
  toast('Роль обновлена', { type: 'success', ...opts() })

export const toastOwnershipTransferred = () =>
  toast('Владение передано', { type: 'success', ...opts() })

export const toastInviteDuplicate = () =>
  toast('Этот email уже приглашён или участник', { type: 'error', ...opts() })

export const toastInviteAccepted = () =>
  toast('Приглашение принято', { type: 'success', ...opts() })

export const toastInviteDeclined = () =>
  toast('Приглашение отклонено', { ...opts() })

export const toastForbiddenLocal = () =>
  toast('Недостаточно прав', { type: 'error', ...opts() })
