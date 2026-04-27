import { ApiController } from '~/scripts/shared/api/controller'
import { ApiAliases, RequestMethod, buildUrl } from '~/scripts/shared/types'
import type {
  PagedResponse,
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInvitePreviewDto,
  WorkspaceInviteStatus,
  CreateWorkspaceInviteRequest,
  UpdateWorkspaceMemberRequest,
  WorkspaceRole,
} from '~/scripts/shared/types/workspace'

/**
 * Members API. Composition over inheritance — см. WorkspacesApiController.
 */
export class WorkspaceMembersApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getMembers(workspaceId: string, q?: string, offset = 0, limit = 50): Promise<PagedResponse<WorkspaceMemberDto>> {
    const url = buildUrl(ApiAliases.workspaceMembers, { workspaceId })
    return this.api.request(url, RequestMethod.GET, { q, offset, limit, _t: Date.now() })
  }

  /** Silent — verify-by-refetch на caller'е. */
  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceMember, { workspaceId, userId })
    const body: UpdateWorkspaceMemberRequest = { role }
    return this.api.request(url, RequestMethod.PATCH, body, false, true)
  }

  /** Silent — verify-by-refetch на caller'е. */
  removeMember(workspaceId: string, userId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceMember, { workspaceId, userId })
    return this.api.request(url, RequestMethod.DELETE, {}, false, true)
  }
}

/**
 * Invites API — workspace-scoped + token-based (анонимный preview).
 */
export class WorkspaceInvitesApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  getInvites(
    workspaceId: string,
    opts: { status?: WorkspaceInviteStatus; q?: string; offset?: number; limit?: number } = {},
  ): Promise<PagedResponse<WorkspaceInviteDto>> {
    const url = buildUrl(ApiAliases.workspaceInvites, { workspaceId })
    const { status, q, offset = 0, limit = 50 } = opts
    return this.api.request(url, RequestMethod.GET, { status, q, offset, limit, _t: Date.now() })
  }

  createInvite(
    workspaceId: string,
    payload: CreateWorkspaceInviteRequest,
  ): Promise<WorkspaceInviteDto> {
    const url = buildUrl(ApiAliases.workspaceInvites, { workspaceId })
    // Не silent: ошибки валидации/409 должны звучать через стандартный канал;
    // дублируем доменно-точный тост на caller'е (createInvite выкидывает throw'ом).
    return this.api.request(url, RequestMethod.POST, payload)
  }

  /** Silent — verify-by-refetch. */
  revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteRevoke, { workspaceId, inviteId })
    return this.api.request(url, RequestMethod.POST, {}, false, true)
  }

  // === Token-based (public preview / accept-decline) ===

  getInvitePreview(token: string): Promise<WorkspaceInvitePreviewDto> {
    const url = buildUrl(ApiAliases.workspaceInvitePreview, { token })
    return this.api.request(url, RequestMethod.GET)
  }

  acceptInvite(token: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteAccept, { token })
    return this.api.request(url, RequestMethod.POST)
  }

  declineInvite(token: string): Promise<void> {
    const url = buildUrl(ApiAliases.workspaceInviteDecline, { token })
    return this.api.request(url, RequestMethod.POST)
  }
}

let membersInstance: WorkspaceMembersApiController | null = null
let invitesInstance: WorkspaceInvitesApiController | null = null

export function useWorkspaceMembersApi(): WorkspaceMembersApiController {
  if (!membersInstance) membersInstance = new WorkspaceMembersApiController()
  return membersInstance
}

export function useWorkspaceInvitesApi(): WorkspaceInvitesApiController {
  if (!invitesInstance) invitesInstance = new WorkspaceInvitesApiController()
  return invitesInstance
}
