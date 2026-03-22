<!-- lib-modules/workspace/components/PanelHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
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

const icon = computed(() => {
  return props.panel.type === 'image' ? 'image' : 'message-square'
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
      <component
        :is="icon === 'image' ? 'svg' : 'svg'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
      >
        <use v-if="icon === 'image'" href="/icons/image.svg#icon" />
        <use v-else href="/icons/chats.svg#icon" />
      </component>
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
