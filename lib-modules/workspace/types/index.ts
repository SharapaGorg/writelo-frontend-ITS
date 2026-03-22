// lib-modules/workspace/types/index.ts

export type PanelType = 'chat' | 'image'

export interface Panel {
  id: string
  type: PanelType
  chatId?: string
}

export interface WorkspaceState {
  panels: Panel[]
  sizes: number[]
  activePanelId: string
}

export const MIN_PANEL_WIDTH_PERCENT = 20
export const MAX_PANELS = 3
export const DEFAULT_PANEL_TYPE: PanelType = 'chat'
