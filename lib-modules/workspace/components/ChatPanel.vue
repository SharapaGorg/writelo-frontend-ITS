<!-- lib-modules/workspace/components/ChatPanel.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MessagesSection, SendMessageSection, useCurrentConversationStore } from '~/lib-modules/conversations'
import type { MessageType } from '~/lib-modules/conversations'
import { ApiController } from '~/scripts/shared/api/controller'
import Loader from '~/components/atoms/Loader.vue'

const props = defineProps<{
  chatId?: string
}>()

const conversationStore = useCurrentConversationStore()
const apiController = new ApiController()

const loading = ref(false)
const fieldDisabled = ref(false)

const messages = computed({
  get: () => conversationStore.messages,
  set: (value: MessageType[]) => conversationStore.setMessages(value)
})

const isConversationEmpty = computed(() => messages.value.length === 0)

onMounted(async () => {
  if (props.chatId && props.chatId !== 'new') {
    loading.value = true
    try {
      const response = await apiController.getConversation(props.chatId)
      if (response?.messages?.length) {
        messages.value = response.messages
      }
      if (response?.title) {
        conversationStore.setTitle(response.title)
      }
    } catch (e) {
      console.error('Failed to load conversation:', e)
    } finally {
      loading.value = false
    }
  }
})

async function handleSend(messageText: string) {
  // Simplified message handling for workspace
  // TODO: implement full message handling with streaming
  console.log('Send message:', messageText, 'to chat:', props.chatId)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <Loader type="conversation" />
    </div>

    <template v-else>
      <div class="flex-1 overflow-auto">
        <MessagesSection :messages="messages" />
      </div>

      <SendMessageSection
        :field-disabled="fieldDisabled"
        :generation-in-process="fieldDisabled"
        @send="handleSend"
      />
    </template>
  </div>
</template>
