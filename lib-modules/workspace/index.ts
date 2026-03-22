// lib-modules/workspace/index.ts

export { default as WorkspaceLayout } from './components/WorkspaceLayout.vue'
export { default as WorkspacePanel } from './components/WorkspacePanel.vue'
export { default as ResizeHandle } from './components/ResizeHandle.vue'
export { default as PanelHeader } from './components/PanelHeader.vue'
export { default as PanelContextMenu } from './components/PanelContextMenu.vue'
export { default as WorkspaceNavbarButton } from './components/WorkspaceNavbarButton.vue'
export { default as ChatPanel } from './components/ChatPanel.vue'
export { default as ImagePanel } from './components/ImagePanel.vue'

export { useWorkspace } from './composables/useWorkspace'
export { useWorkspaceStore } from './stores/workspaceStore'

export * from './types'
