<!-- lib-modules/workspace/components/PanelHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Image, MessageSquare } from 'lucide-vue-next'
import type { Panel } from '../types'

const props = defineProps<{
  panel: Panel
  title?: string
  canClose: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  close: []
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

    <button
      v-if="canClose"
      class="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      @click="emit('close')"
    >
      <span class="text-lg leading-none">&times;</span>
    </button>
  </div>
</template>
