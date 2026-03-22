<!-- pages/app/workspace.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { WorkspaceLayout, useWorkspace, type Panel, type PanelType } from '~/lib-modules/workspace'
import { MessagesSection, SendMessageSection } from '~/lib-modules/conversations'
import { ImageGeneratorInput, ImageGeneratorOutput } from '~/lib-modules/imageGenerator'
import { useCurrentConversationStore } from '~/lib-modules/conversations'
import { isMobile } from '~/scripts/features/utils'

definePageMeta({
  layout: 'default'
})

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
  resetSizes,
  updatePanelChat
} = useWorkspace()

const conversationStore = useCurrentConversationStore()

onMounted(() => {
  if (isMobile()) {
    navigateTo('/app/conversations')
    return
  }
  initFromRoute()
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
        <div v-if="p.type === 'chat'" class="flex flex-col h-full">
          <div class="flex-1 overflow-auto">
            <MessagesSection />
          </div>
          <SendMessageSection />
        </div>

        <div v-else-if="p.type === 'image'" class="flex flex-col h-full p-4 gap-4 overflow-auto">
          <ImageGeneratorInput />
          <ImageGeneratorOutput />
        </div>
      </template>
    </WorkspaceLayout>
  </div>
</template>
