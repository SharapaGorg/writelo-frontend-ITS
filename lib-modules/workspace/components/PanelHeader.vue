<!-- lib-modules/workspace/components/PanelHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Image, MessageSquare, Plus, X } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import type { Panel, PanelType } from '../types'

const props = defineProps<{
  panel: Panel
  title?: string
  canClose: boolean
  canSplit: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  close: []
  splitRight: [type: PanelType]
  contextmenu: [event: MouseEvent]
}>()

const displayTitle = computed(() => {
  if (props.panel.type === 'image') {
    return 'Image Generator'
  }
  return props.title || 'New Chat'
})

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  emit('contextmenu', e)
}
</script>

<template>
  <div
    class="flex items-center justify-between h-10 px-3 border-b bg-muted/50 shrink-0"
    :class="{ 'border-l-2 border-l-primary': isActive }"
    @contextmenu="onContextMenu"
  >
    <div class="flex items-center gap-2 min-w-0">
      <Image v-if="panel.type === 'image'" class="w-4 h-4 shrink-0 text-muted-foreground" />
      <MessageSquare v-else class="w-4 h-4 shrink-0 text-muted-foreground" />
      <span class="text-sm truncate">{{ displayTitle }}</span>
    </div>

    <div class="flex items-center gap-1">
      <!-- Add panel button -->
      <DropdownMenu v-if="canSplit">
        <DropdownMenuTrigger as-child>
          <button
            class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Add panel"
          >
            <Plus class="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="emit('splitRight', 'chat')">
            <MessageSquare class="w-4 h-4 mr-2" />
            Add Chat
          </DropdownMenuItem>
          <DropdownMenuItem @click="emit('splitRight', 'image')">
            <Image class="w-4 h-4 mr-2" />
            Add Image Generator
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Close button -->
      <button
        v-if="canClose"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title="Close panel"
        @click="emit('close')"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
