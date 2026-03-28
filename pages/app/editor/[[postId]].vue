<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  ReelScriptPanel,
  PostPreviewPanel,
  useContentEditor
} from '~/lib-modules/content-editor'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { currentDraft, createNewDraft, editorMode, isReel } = useContentEditor()

onMounted(() => {
  const postId = route.params.postId as string | undefined
  if (postId) {
    // TODO: Load existing post via API
    console.log('Loading post:', postId)
  } else if (!currentDraft.value) {
    createNewDraft('post', 'default-account')
  }
})
</script>

<template>
  <ContentEditorLayout>
    <template #left-panel>
      <EditorChatPanel v-if="editorMode === 'chat'" />
      <EditorImagesPanel v-else />
    </template>

    <template #right-panel>
      <ReelScriptPanel v-if="isReel" />
      <PostPreviewPanel v-else />
    </template>
  </ContentEditorLayout>
</template>
