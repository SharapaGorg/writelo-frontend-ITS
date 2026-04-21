<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ContentEditorLayout,
  EditorChatPanel,
  EditorImagesPanel,
  PostPreviewPanel,
  useContentEditor
} from '~/lib-modules/content-editor'
import { useContentProjectStore } from '~/lib-modules/content-calendar'
import { ApiController } from '~/scripts/shared/api/controller'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

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

const projectStore = useContentProjectStore()
const { currentProjectAccounts } = storeToRefs(projectStore)

onMounted(async () => {
  const postId = route.params.postId as string | undefined
  const chatId = route.query.chat as string | undefined

  if (postId) {
    // TODO: Load existing post via API
    console.log('Loading post:', postId)
  } else if (!currentDraft.value) {
    const defaultAccountId = currentProjectAccounts.value[0]?.id || ''
    createNewDraft('post', defaultAccountId)
  }

  // Load existing chat if chat ID in URL
  if (chatId && chatId !== conversationId.value) {
    try {
      const {requireWorkspaceId} = useWorkspaceContext()
      const conversation = await apiController.getWorkspaceConversation(requireWorkspaceId(), chatId)
      if (conversation?.messages?.length) {
        setConversationId(chatId)
        loadChatMessages(conversation.messages.map(m => ({
          id: m.id,
          role: m.role === 'assistant' ? 0 : 1,
          text: m.text ?? '',
          createdAt: m.createdAt,
        })))
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
