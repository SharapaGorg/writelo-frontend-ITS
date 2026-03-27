<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  useContentEditor
} from '~/lib-modules/content-editor'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const { currentDraft, createNewDraft, editorMode } = useContentEditor()

onMounted(() => {
  const postId = route.params.postId as string | undefined
  if (postId) {
    // TODO: Load existing post via API
    console.log('Loading post:', postId)
  } else if (!currentDraft) {
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
      <div class="flex h-full items-center justify-center p-4 text-zinc-400">
        <p class="text-sm">Post preview coming soon</p>
      </div>
    </template>
  </ContentEditorLayout>
</template>
