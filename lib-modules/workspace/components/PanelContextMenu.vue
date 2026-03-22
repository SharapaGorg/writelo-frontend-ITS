<!-- lib-modules/workspace/components/PanelContextMenu.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '~/components/ui/context-menu'
import type { Panel, PanelType } from '../types'

const props = defineProps<{
  panel: Panel
  canSplit: boolean
  canClose: boolean
}>()

const emit = defineEmits<{
  splitRight: [type: PanelType]
  close: []
  openChat: []
}>()

const isOpen = ref(false)
</script>

<template>
  <ContextMenu v-model:open="isOpen">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>

    <ContextMenuContent class="w-48">
      <ContextMenuItem
        v-if="canSplit"
        @click="emit('splitRight', 'chat')"
      >
        Split Right (Chat)
      </ContextMenuItem>

      <ContextMenuItem
        v-if="canSplit"
        @click="emit('splitRight', 'image')"
      >
        Split Right (Image)
      </ContextMenuItem>

      <ContextMenuItem
        v-if="panel.type === 'chat'"
        @click="emit('openChat')"
      >
        Open Chat...
      </ContextMenuItem>

      <ContextMenuItem
        v-if="canClose"
        class="text-destructive"
        @click="emit('close')"
      >
        Close
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
