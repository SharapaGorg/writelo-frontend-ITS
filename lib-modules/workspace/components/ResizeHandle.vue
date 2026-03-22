<!-- lib-modules/workspace/components/ResizeHandle.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  resize: [deltaPercent: number]
  resizeEnd: []
  resetSizes: []
}>()

const isDragging = ref(false)
const startX = ref(0)
const containerWidth = ref(0)

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  startX.value = e.clientX
  containerWidth.value = (e.target as HTMLElement).parentElement?.parentElement?.offsetWidth || 1

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value
  const deltaPercent = (deltaX / containerWidth.value) * 100

  emit('resize', deltaPercent)
  startX.value = e.clientX
}

function onMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  emit('resizeEnd')
}

function onDoubleClick() {
  emit('resetSizes')
}
</script>

<template>
  <div
    class="w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/50 transition-colors"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
  />
</template>
