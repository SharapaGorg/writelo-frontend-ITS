import { computed, type ComputedRef } from 'vue'
import { useWorkspaceContext } from './useWorkspaceContext'
import { useSettings } from '~/composables/settings'
import type { WorkspaceRole, WorkspaceMemberDto } from '../types'

/**
 * Build a helper that returns a computed boolean: true iff the current
 * workspace role is one of `allowed`.
 */
function isAtLeastFactory(roleRef: ComputedRef<WorkspaceRole | null>) {
  return (...allowed: WorkspaceRole[]) =>
    computed(() => roleRef.value !== null && allowed.includes(roleRef.value))
}

/**
 * Central source of truth for permissions in the *current* workspace.
 *
 * Reads the role from `useWorkspaceContext().currentWorkspace`. Returns a
 * bag of computed booleans (`canManagePosts`, `canRenameWorkspace`, …) plus
 * member-level helpers (`getAssignableRoles`, `canChangeMemberRole`,
 * `canRemoveMember`).
 *
 * For per-workspace (i.e. not necessarily the current one) checks on the
 * /app/workspaces page, see the matching `*In` getters on
 * `useWorkspacesStore()`.
 */
export function useWorkspacePermissions() {
  const ctx = useWorkspaceContext()
  const $settings = useSettings()

  const currentRole = computed<WorkspaceRole | null>(
    () => ctx.currentWorkspace.value?.role ?? null,
  )

  // `useSettings().getUser()` is typed as `any` upstream — narrow at the
  // boundary so a future shape drift surfaces as a TS error here.
  const selfId = (): string | null =>
    ($settings.getUser() as { id?: string } | null)?.id ?? null

  const isAtLeast = isAtLeastFactory(currentRole)

  // Content / brand brief — editor and above
  const canManagePosts = isAtLeast('editor', 'admin', 'owner')
  const canEditBrandBrief = isAtLeast('editor', 'admin', 'owner')

  // Workspace settings / team — admin and above
  const canRenameWorkspace = isAtLeast('admin', 'owner')
  const canManageSocialAccounts = isAtLeast('admin', 'owner')
  const canViewActivityLog = isAtLeast('admin', 'owner')
  const canManageInvites = isAtLeast('admin', 'owner')

  // Owner-only
  const canManageAdmins = isAtLeast('owner')
  const canDeleteWorkspace = isAtLeast('owner')

  /**
   * Which roles can the current user assign *to* the given member?
   *
   * - owner: viewer/editor/admin to any non-self non-owner; nothing to self or another owner
   * - admin: viewer/editor to viewers and editors only; nothing to admins or owner
   * - editor / viewer: nothing
   */
  function getAssignableRoles(member: WorkspaceMemberDto): WorkspaceRole[] {
    const role = currentRole.value
    const me = selfId()

    if (role === 'owner') {
      if (member.userId === me) return []
      if (member.role === 'owner') return []
      return ['viewer', 'editor', 'admin']
    }
    if (role === 'admin') {
      if (member.role === 'viewer' || member.role === 'editor') {
        return ['viewer', 'editor']
      }
      return []
    }
    return []
  }

  function canChangeMemberRole(member: WorkspaceMemberDto): boolean {
    return getAssignableRoles(member).length > 0
  }

  /**
   * Can the current user remove this member from the workspace?
   *
   * - owner: anyone except self and other owners
   * - admin: only viewers and editors
   * - editor / viewer: no
   */
  function canRemoveMember(member: WorkspaceMemberDto): boolean {
    const role = currentRole.value
    const me = selfId()

    if (role === 'owner') {
      return member.userId !== me && member.role !== 'owner'
    }
    if (role === 'admin') {
      return member.role === 'viewer' || member.role === 'editor'
    }
    return false
  }

  return {
    currentRole,
    canManagePosts,
    canEditBrandBrief,
    canRenameWorkspace,
    canManageSocialAccounts,
    canViewActivityLog,
    canManageInvites,
    canManageAdmins,
    canDeleteWorkspace,
    getAssignableRoles,
    canChangeMemberRole,
    canRemoveMember,
  }
}

export type WorkspacePermissions = ReturnType<typeof useWorkspacePermissions>
