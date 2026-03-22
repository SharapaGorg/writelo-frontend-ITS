<!-- pages/app/workspace.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  WorkspaceLayout,
  useWorkspace,
  ChatPanel,
  ImagePanel,
  type Panel,
  type PanelType
} from '~/lib-modules/workspace'
import { useCurrentConversationStore } from '~/lib-modules/conversations'
import { isMobile } from '~/scripts/features/utils'

definePageMeta({
  layout: 'default'
})

const isReady = ref(false)

const {
  panels,
  sizes,
  activePanelId,
  canAddPanel,
  canRemovePanel,
  initFromRoute,
  removePanel,
  splitPanel,
  setActivePanel,
  resizePanels,
  resetSizes
} = useWorkspace()

const conversationStore = useCurrentConversationStore()

onMounted(() => {
  if (isMobile()) {
    navigateTo('/app/conversations')
    return
  }
  initFromRoute()
  isReady.value = true
})

function getPanelTitle(panel: Panel): string | undefined {
  if (panel.type === 'chat') {
    return conversationStore.conversationTitle || undefined
  }
  return undefined
}

function handleSplitPanel(panelId: string, type: PanelType) {
  splitPanel(panelId, type)
}

function handleOpenChat(panelId: string) {
  // TODO: open chat selector dialog
  console.log('Open chat selector for panel:', panelId)
}
</script>

<template>
  <div class="h-[calc(100vh-var(--navbar-height,60px))]">
    <WorkspaceLayout
      v-if="isReady && panels.length > 0"
      :panels="panels"
      :sizes="sizes"
      :active-panel-id="activePanelId"
      :can-add-panel="canAddPanel"
      :can-remove-panel="canRemovePanel"
      :get-panel-title="getPanelTitle"
      @update:active-panel-id="setActivePanel"
      @remove-panel="removePanel"
      @split-panel="handleSplitPanel"
      @resize="resizePanels"
      @reset-sizes="resetSizes"
      @open-chat="handleOpenChat"
    >
      <template v-for="panel in panels" :key="panel.id" #[`panel-${panel.id}`]="{ panel: p }">
        <ChatPanel v-if="p.type === 'chat'" :chat-id="p.chatId" />
        <ImagePanel v-else-if="p.type === 'image'" />
      </template>
    </WorkspaceLayout>

    <!-- Loading state -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="text-muted-foreground">Loading workspace...</div>
    </div>
  </div>
</template>
