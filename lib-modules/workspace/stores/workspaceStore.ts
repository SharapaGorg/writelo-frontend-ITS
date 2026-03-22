import { defineStore } from 'pinia'
import type { Panel, PanelType, WorkspaceState } from '../types'
import { MAX_PANELS, MIN_PANEL_WIDTH_PERCENT } from '../types'
import { generateUUID } from '~/scripts/features/utils'
import {
  parsePanelsFromUrl,
  parseSizesFromUrl,
  serializePanelsToUrl,
  serializeSizesToUrl
} from '../helpers/urlParser'

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    panels: [],
    sizes: [],
    activePanelId: ''
  }),

  getters: {
    panelCount: (state) => state.panels.length,
    canAddPanel: (state) => state.panels.length < MAX_PANELS,
    canRemovePanel: (state) => state.panels.length > 1,
    activePanel: (state) => state.panels.find((p) => p.id === state.activePanelId)
  },

  actions: {
    initFromUrl(panelsParam: string | null, sizesParam: string | null) {
      this.panels = parsePanelsFromUrl(panelsParam)
      this.sizes = parseSizesFromUrl(sizesParam, this.panels.length)
      this.activePanelId = this.panels[0]?.id || ''
    },

    addPanel(type: PanelType, chatId?: string, afterPanelId?: string) {
      if (!this.canAddPanel) return

      const newPanel: Panel = {
        id: generateUUID(),
        type,
        chatId: type === 'chat' ? chatId : undefined
      }

      const insertIndex = afterPanelId
        ? this.panels.findIndex((p) => p.id === afterPanelId) + 1
        : this.panels.length

      this.panels.splice(insertIndex, 0, newPanel)
      this.redistributeSizes()
      this.activePanelId = newPanel.id
    },

    removePanel(panelId: string) {
      if (!this.canRemovePanel) return

      const index = this.panels.findIndex((p) => p.id === panelId)
      if (index === -1) return

      this.panels.splice(index, 1)
      this.redistributeSizes()

      if (this.activePanelId === panelId) {
        this.activePanelId = this.panels[Math.min(index, this.panels.length - 1)]?.id || ''
      }
    },

    splitPanel(panelId: string, type: PanelType = 'chat') {
      this.addPanel(type, undefined, panelId)
    },

    updatePanelChat(panelId: string, chatId: string) {
      const panel = this.panels.find((p) => p.id === panelId)
      if (panel && panel.type === 'chat') {
        panel.chatId = chatId
      }
    },

    setActivePanel(panelId: string) {
      if (this.panels.some((p) => p.id === panelId)) {
        this.activePanelId = panelId
      }
    },

    resizePanels(newSizes: number[]) {
      if (newSizes.length !== this.panels.length) return

      const clampedSizes = newSizes.map((s) =>
        Math.max(MIN_PANEL_WIDTH_PERCENT, Math.min(100 - MIN_PANEL_WIDTH_PERCENT * (this.panels.length - 1), s))
      )

      const total = clampedSizes.reduce((a, b) => a + b, 0)
      this.sizes = clampedSizes.map((s) => (s / total) * 100)
    },

    redistributeSizes() {
      const count = this.panels.length
      const base = Math.floor(100 / count)
      const remainder = 100 - base * count
      this.sizes = Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
    },

    getUrlParams(): { panels: string; sizes: string } {
      return {
        panels: serializePanelsToUrl(this.panels),
        sizes: serializeSizesToUrl(this.sizes)
      }
    }
  }
})
