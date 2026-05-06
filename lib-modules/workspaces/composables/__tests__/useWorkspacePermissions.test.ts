import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import type { WorkspaceMemberDto, WorkspaceDto } from '../../types'

const currentWorkspace = ref<WorkspaceDto | null>(null)
const currentUser = ref<{ id: string } | null>(null)

vi.mock('../useWorkspaceContext', () => ({
  useWorkspaceContext: () => ({ currentWorkspace }),
}))

// useWorkspacePermissions reads the current user via useSettings().getUser()?.id
// (composables/user.ts has no userId getter — see settings.ts state.user).
vi.mock('~/composables/settings', () => ({
  useSettings: () => ({
    getUser: () => currentUser.value,
  }),
}))

import { useWorkspacePermissions } from '../useWorkspacePermissions'

function setRole(role: WorkspaceDto['role'] | null, selfId = 'me') {
  currentWorkspace.value = role ? ({ id: 'w1', role } as WorkspaceDto) : null
  currentUser.value = { id: selfId }
}

function makeMember(userId: string, role: WorkspaceMemberDto['role']): WorkspaceMemberDto {
  return { userId, name: userId, email: null, role, joinedAt: '' }
}

describe('useWorkspacePermissions — flag matrix', () => {
  it('viewer: only read', () => {
    setRole('viewer')
    const p = useWorkspacePermissions()
    expect(p.canViewActivityLog.value).toBe(false)
    expect(p.canManageInvites.value).toBe(false)
    expect(p.canDeleteWorkspace.value).toBe(false)
  })

  it('editor: no team/log/settings', () => {
    setRole('editor')
    const p = useWorkspacePermissions()
    expect(p.canRenameWorkspace.value).toBe(false)
    expect(p.canViewActivityLog.value).toBe(false)
    expect(p.canManageInvites.value).toBe(false)
  })

  it('admin: full except owner-only', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.canRenameWorkspace.value).toBe(true)
    expect(p.canManageInvites.value).toBe(true)
    expect(p.canViewActivityLog.value).toBe(true)
    expect(p.canManageAdmins.value).toBe(false)
    expect(p.canDeleteWorkspace.value).toBe(false)
  })

  it('owner: everything', () => {
    setRole('owner')
    const p = useWorkspacePermissions()
    expect(p.canManageAdmins.value).toBe(true)
    expect(p.canDeleteWorkspace.value).toBe(true)
  })

  it('null role: nothing', () => {
    setRole(null)
    const p = useWorkspacePermissions()
    expect(p.canViewActivityLog.value).toBe(false)
    expect(p.canManageInvites.value).toBe(false)
  })
})

describe('useWorkspacePermissions — getAssignableRoles', () => {
  it('owner can assign viewer/editor/admin to any non-owner non-self', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('other', 'editor'))).toEqual(['viewer', 'editor', 'admin'])
  })

  it('owner cannot assign roles to themselves', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('me', 'owner'))).toEqual([])
  })

  it('owner cannot assign roles to another owner', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('other', 'owner'))).toEqual([])
  })

  it('admin can assign viewer/editor to non-admin members', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual(['viewer', 'editor'])
    expect(p.getAssignableRoles(makeMember('x', 'editor'))).toEqual(['viewer', 'editor'])
  })

  it('admin cannot touch other admins or owner', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'admin'))).toEqual([])
    expect(p.getAssignableRoles(makeMember('x', 'owner'))).toEqual([])
  })

  it('editor/viewer cannot assign anything', () => {
    setRole('editor')
    let p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual([])
    setRole('viewer')
    p = useWorkspacePermissions()
    expect(p.getAssignableRoles(makeMember('x', 'viewer'))).toEqual([])
  })
})

describe('useWorkspacePermissions — canRemoveMember', () => {
  it('owner can remove anyone except self and owner', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('me', 'owner'))).toBe(false)
    expect(p.canRemoveMember(makeMember('other', 'owner'))).toBe(false)
    expect(p.canRemoveMember(makeMember('other', 'admin'))).toBe(true)
    expect(p.canRemoveMember(makeMember('other', 'editor'))).toBe(true)
  })

  it('admin can remove only viewer/editor', () => {
    setRole('admin')
    const p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(true)
    expect(p.canRemoveMember(makeMember('x', 'editor'))).toBe(true)
    expect(p.canRemoveMember(makeMember('x', 'admin'))).toBe(false)
    expect(p.canRemoveMember(makeMember('x', 'owner'))).toBe(false)
  })

  it('editor/viewer cannot remove anyone', () => {
    setRole('editor')
    let p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(false)
    setRole('viewer')
    p = useWorkspacePermissions()
    expect(p.canRemoveMember(makeMember('x', 'viewer'))).toBe(false)
  })
})

describe('useWorkspacePermissions — canTransferOwnershipTo', () => {
  it('owner can transfer to non-self non-owner members', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.canTransferOwnershipTo(makeMember('other', 'admin'))).toBe(true)
    expect(p.canTransferOwnershipTo(makeMember('other', 'editor'))).toBe(true)
    expect(p.canTransferOwnershipTo(makeMember('other', 'viewer'))).toBe(true)
  })

  it('owner cannot transfer to themselves or another owner', () => {
    setRole('owner', 'me')
    const p = useWorkspacePermissions()
    expect(p.canTransferOwnershipTo(makeMember('me', 'owner'))).toBe(false)
    expect(p.canTransferOwnershipTo(makeMember('other', 'owner'))).toBe(false)
  })

  it('admin / editor / viewer cannot transfer ownership', () => {
    for (const role of ['admin', 'editor', 'viewer'] as const) {
      setRole(role)
      const p = useWorkspacePermissions()
      expect(p.canTransferOwnershipTo(makeMember('x', 'editor'))).toBe(false)
    }
  })
})
