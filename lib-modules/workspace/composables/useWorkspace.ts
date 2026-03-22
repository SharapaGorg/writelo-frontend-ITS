// lib-modules/workspace/composables/useWorkspace.ts

import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { PanelType } from '../types'

export function useWorkspace() {
  const store = useWorkspaceStore()
  const route = useRoute()
  const router = useRouter()

  const { panels, sizes, activePanelId, canAddPanel, canRemovePanel } = storeToRefs(store)

  function initFromRoute() {
    const panelsParam = route.query.panels as string | null
    const sizesParam = route.query.sizes as string | null
    store.initFromUrl(panelsParam, sizesParam)
  }

  function syncToUrl() {
    const { panels: panelsParam, sizes: sizesParam } = store.getUrlParams()
    router.replace({
      query: {
        ...route.query,
        panels: panelsParam,
        sizes: sizesParam
      }
    })
  }

  function addPanel(type: PanelType, chatId?: string) {
    store.addPanel(type, chatId)
    syncToUrl()
  }

  function removePanel(panelId: string) {
    store.removePanel(panelId)
    syncToUrl()
  }

  function splitPanel(panelId: string, type: PanelType = 'chat') {
    store.splitPanel(panelId, type)
    syncToUrl()
  }

  function updatePanelChat(panelId: string, chatId: string) {
    store.updatePanelChat(panelId, chatId)
    syncToUrl()
  }

  function setActivePanel(panelId: string) {
    store.setActivePanel(panelId)
  }

  function resizePanels(newSizes: number[]) {
    store.resizePanels(newSizes)
    syncToUrl()
  }

  function resetSizes() {
    store.redistributeSizes()
    syncToUrl()
  }

  return {
    panels,
    sizes,
    activePanelId,
    canAddPanel,
    canRemovePanel,
    initFromRoute,
    addPanel,
    removePanel,
    splitPanel,
    updatePanelChat,
    setActivePanel,
    resizePanels,
    resetSizes
  }
}
