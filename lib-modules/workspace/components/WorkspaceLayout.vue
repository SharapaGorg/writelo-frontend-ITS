<!-- lib-modules/workspace/components/WorkspaceLayout.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Panel, PanelType } from '../types'
import WorkspacePanel from './WorkspacePanel.vue'
import ResizeHandle from './ResizeHandle.vue'

const props = defineProps<{
  panels: Panel[]
  sizes: number[]
  activePanelId: string
  canAddPanel: boolean
  canRemovePanel: boolean
  getPanelTitle?: (panel: Panel) => string | undefined
}>()

const emit = defineEmits<{
  'update:activePanelId': [id: string]
  removePanel: [id: string]
  splitPanel: [panelId: string, type: PanelType]
  resize: [sizes: number[]]
  resetSizes: []
  openChat: [panelId: string]
}>()

const localSizes = ref<number[]>([])

function startResize() {
  localSizes.value = [...props.sizes]
}

function handleResize(index: number, deltaPercent: number) {
  if (localSizes.value.length === 0) {
    localSizes.value = [...props.sizes]
  }

  const newSizes = [...localSizes.value]
  newSizes[index] += deltaPercent
  newSizes[index + 1] -= deltaPercent
  localSizes.value = newSizes
}

function handleResizeEnd() {
  if (localSizes.value.length > 0) {
    emit('resize', localSizes.value)
    localSizes.value = []
  }
}

const displaySizes = computed(() =>
  localSizes.value.length > 0 ? localSizes.value : props.sizes
)
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-background">
    <template v-for="(panel, index) in panels" :key="panel.id">
      <WorkspacePanel
        :panel="panel"
        :title="getPanelTitle?.(panel)"
        :width-percent="displaySizes[index]"
        :is-active="activePanelId === panel.id"
        :can-split="canAddPanel"
        :can-close="canRemovePanel"
        @click="emit('update:activePanelId', panel.id)"
        @close="emit('removePanel', panel.id)"
        @split-right="(type) => emit('splitPanel', panel.id, type)"
        @open-chat="emit('openChat', panel.id)"
      >
        <slot :name="`panel-${panel.id}`" :panel="panel" />
      </WorkspacePanel>

      <ResizeHandle
        v-if="index < panels.length - 1"
        @resize="(delta) => handleResize(index, delta)"
        @resize-end="handleResizeEnd"
        @reset-sizes="emit('resetSizes')"
        @mousedown="startResize"
      />
    </template>
  </div>
</template>
