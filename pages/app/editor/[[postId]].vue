<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  PostPreviewPanel,
  useContentEditor
} from '~/lib-modules/content-editor'
import { ApiController } from '~/scripts/shared/api/controller'

definePageMeta({
  layout: 'app'
})

const route = useRoute()
const router = useRouter()
const apiController = new ApiController()
const {
  currentDraft,
  createNewDraft,
  editorMode,
  conversationId,
  setConversationId,
  loadChatMessages
} = useContentEditor()

onMounted(async () => {
  const postId = route.params.postId as string | undefined
  const chatId = route.query.chat as string | undefined

  if (postId) {
    // TODO: Load existing post via API
    console.log('Loading post:', postId)
  } else if (!currentDraft.value) {
    createNewDraft('post', 'default-account')
  }

  // Load existing chat if chat ID in URL
  if (chatId && chatId !== conversationId.value) {
    try {
      const conversation = await apiController.getConversation(chatId)
      if (conversation?.messages?.length) {
        setConversationId(chatId)
        loadChatMessages(conversation.messages)
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
      // Remove invalid chat ID from URL
      router.replace({ query: { ...route.query, chat: undefined } })
    }
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
      <PostPreviewPanel />
    </template>
  </ContentEditorLayout>
</template>
