<script setup lang="ts">
import { onMounted } from 'vue'
import {
  ContentEditorLayout,
  EditorChatPanel,
  ReelScriptPanel,
  useContentEditor
} from '~/lib-modules/content-editor'

definePageMeta({
  layout: 'app'
})

const {
  currentDraft,
  createNewDraft,
  editorMode
} = useContentEditor()

onMounted(() => {
  // Always create a reel draft for this page
  if (!currentDraft.value || currentDraft.value.type !== 'reel') {
    createNewDraft('reel', 'default-account')
  }
})
</script>

<template>
  <ContentEditorLayout>
    <template #left-panel>
      <EditorChatPanel v-if="editorMode === 'chat'" />
      <ReelScriptPanel v-else />
    </template>

    <template #right-panel>
      <ReelScriptPanel />
    </template>
  </ContentEditorLayout>
</template>
