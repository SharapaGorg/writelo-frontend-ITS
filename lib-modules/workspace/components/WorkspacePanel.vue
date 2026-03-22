<script setup lang="ts">
import { computed } from 'vue'
import type { Panel, PanelType } from '../types'
import PanelHeader from './PanelHeader.vue'
import PanelContextMenu from './PanelContextMenu.vue'

const props = defineProps<{
  panel: Panel
  title?: string
  widthPercent: number
  isActive: boolean
  canSplit: boolean
  canClose: boolean
}>()

const emit = defineEmits<{
  click: []
  close: []
  splitRight: [type: PanelType]
  openChat: []
}>()

const style = computed(() => ({
  width: `${props.widthPercent}%`,
  minWidth: '20%'
}))
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden border-r last:border-r-0"
    :class="{ 'ring-1 ring-primary/30': isActive }"
    :style="style"
    @click="emit('click')"
  >
    <PanelContextMenu
      :panel="panel"
      :can-split="canSplit"
      :can-close="canClose"
      @split-right="(type) => emit('splitRight', type)"
      @close="emit('close')"
      @open-chat="emit('openChat')"
    >
      <PanelHeader
        :panel="panel"
        :title="title"
        :can-close="canClose"
        :can-split="canSplit"
        :is-active="isActive"
        @close="emit('close')"
        @split-right="(type) => emit('splitRight', type)"
      />
    </PanelContextMenu>

    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
