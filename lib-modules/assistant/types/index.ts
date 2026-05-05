import { Role } from '~/lib-modules/conversations'

export interface AssistantMessage {
  id: string
  backendId?: number | string
  role: 'user' | 'assistant'
  text: string
  visibleText: string
  actions?: Action[]
  createdAt: number
  processing?: boolean
  error?: boolean
}

export type ActionType = 'save_as_idea' | 'open_in_editor'

export interface Action {
  type: ActionType
  title: string
  description: string
}

export { Role }
