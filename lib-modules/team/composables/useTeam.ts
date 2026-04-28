import { ref, computed } from 'vue'
import { useWorkspaceContext, useWorkspacePermissions } from '~/lib-modules/workspaces'
import { useWorkspaceMembersApi, useWorkspaceInvitesApi } from '../helpers/api'
import {
  toastInviteSent,
  toastInviteRevoked,
  toastMemberRemoved,
  toastRoleChanged,
  toastOwnershipTransferred,
  toastInviteDuplicate,
  toastForbiddenLocal,
} from '../helpers/toasts'
import type {
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInviteRole,
  WorkspaceRole,
} from '../types'

export function useTeam() {
  const ctx = useWorkspaceContext()
  const membersApi = useWorkspaceMembersApi()
  const invitesApi = useWorkspaceInvitesApi()

  const members = ref<WorkspaceMemberDto[]>([])
  const invites = ref<WorkspaceInviteDto[]>([])
  const loading = ref(false)

  const permissions = useWorkspacePermissions()
  const currentRole = permissions.currentRole
  const canManageInvites = permissions.canManageInvites
  // canManageMembers означает: «есть какие-то management-affordances для членов
  // в этом воркспейсе» — admin или owner.
  const canManageMembers = computed(
    () => permissions.canManageInvites.value || permissions.canManageAdmins.value,
  )
  const canManageAdmins = permissions.canManageAdmins

  async function loadAll() {
    let workspaceId: string
    try {
      workspaceId = ctx.requireWorkspaceId()
    } catch {
      members.value = []
      invites.value = []
      return
    }

    loading.value = true
    try {
      const [m, i] = await Promise.all([
        membersApi.getMembers(workspaceId),
        invitesApi.getInvites(workspaceId, { status: 'pending' }),
      ])
      members.value = m.items ?? []
      invites.value = i.items ?? []
    } finally {
      loading.value = false
    }
  }

  async function inviteMember(email: string, role: WorkspaceInviteRole): Promise<boolean> {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await invitesApi.createInvite(workspaceId, { email, role })
      toastInviteSent(email)
      await refetchInvites(workspaceId)
      return true
    } catch (e: any) {
      if (e?.status === 409 || e?.statusCode === 409) {
        toastInviteDuplicate()
      }
      // 400 / 401 / 5xx тосты делает controller-уровень (не silent).
      return false
    }
  }

  async function revokeInvite(inviteId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await invitesApi.revokeInvite(workspaceId, inviteId)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = invites.value.find(i => i.id === inviteId)
      await refetchInvites(workspaceId)
      const after = invites.value.find(i => i.id === inviteId)
      if (before && !after) toastInviteRevoked()
    }
  }

  async function updateMemberRole(userId: string, role: WorkspaceRole) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.updateMemberRole(workspaceId, userId, role)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = members.value.find(m => m.userId === userId)?.role
      await refetchMembers(workspaceId)
      const after = members.value.find(m => m.userId === userId)?.role
      if (before !== after && after === role) toastRoleChanged()
    }
  }

  async function removeMember(userId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.removeMember(workspaceId, userId)
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      const before = members.value.find(m => m.userId === userId)
      await refetchMembers(workspaceId)
      const after = members.value.find(m => m.userId === userId)
      if (before && !after) toastMemberRemoved()
    }
  }

  async function transferOwnership(userId: string) {
    const workspaceId = ctx.requireWorkspaceId()
    try {
      await membersApi.updateMemberRole(workspaceId, userId, 'owner')
    } catch (e: any) {
      if (e?.status === 403 || e?.statusCode === 403) toastForbiddenLocal()
    } finally {
      await refetchMembers(workspaceId)
      const newOwner = members.value.find(m => m.userId === userId)
      if (newOwner?.role === 'owner') toastOwnershipTransferred()
    }
  }

  async function refetchMembers(workspaceId: string) {
    const r = await membersApi.getMembers(workspaceId)
    members.value = r.items ?? []
  }

  async function refetchInvites(workspaceId: string) {
    const r = await invitesApi.getInvites(workspaceId, { status: 'pending' })
    invites.value = r.items ?? []
  }

  return {
    members,
    invites,
    loading,
    currentRole,
    canManageMembers,
    canManageInvites,
    canManageAdmins,
    loadAll,
    inviteMember,
    revokeInvite,
    updateMemberRole,
    removeMember,
    transferOwnership,
  }
}
