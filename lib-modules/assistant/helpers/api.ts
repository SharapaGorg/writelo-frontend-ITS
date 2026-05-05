import { ApiController } from '~/scripts/shared/api/controller'
import type {
  ConversationDetailDto,
  ConversationListItemDto,
  PagedResponse,
} from '~/scripts/shared/types/workspace'

export class AssistantApiController {
  private api: ApiController

  constructor() {
    this.api = new ApiController()
  }

  async listConversations(workspaceId: string): Promise<ConversationListItemDto[]> {
    const page: PagedResponse<ConversationListItemDto> = await this.api.getWorkspaceConversations(
      workspaceId,
      0,
      50,
    )
    return page.items ?? []
  }

  createConversation(workspaceId: string): Promise<ConversationDetailDto> {
    return this.api.createWorkspaceConversation(workspaceId)
  }

  getConversation(workspaceId: string, conversationId: string): Promise<ConversationDetailDto> {
    return this.api.getWorkspaceConversation(workspaceId, conversationId)
  }

  sendMessage(
    workspaceId: string,
    conversationId: string,
    text: string,
  ): Promise<ReadableStream<Uint8Array>> {
    return this.api.sendWorkspaceMessage(workspaceId, conversationId, text)
  }

  // No backend stop endpoint in v1-4.05 — stop is implemented client-side
  // by cancelling the SSE reader; backend tears down generation on disconnect.

  renameConversation(
    workspaceId: string,
    conversationId: string,
    title: string,
  ): Promise<ConversationListItemDto> {
    return this.api.updateWorkspaceConversation(workspaceId, conversationId, title)
  }

  deleteConversation(workspaceId: string, conversationId: string): Promise<void> {
    return this.api.deleteWorkspaceConversation(workspaceId, conversationId)
  }
}

let instance: AssistantApiController | null = null

export function useAssistantApi(): AssistantApiController {
  if (!instance) {
    instance = new AssistantApiController()
  }
  return instance
}
