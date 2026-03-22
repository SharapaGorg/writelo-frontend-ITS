<!-- lib-modules/workspace/components/ChatPanel.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessagesSection } from '~/lib-modules/conversations'
import type { MessageType } from '~/lib-modules/conversations'
import { ApiController } from '~/scripts/shared/api/controller'
import Loader from '~/components/atoms/Loader.vue'
import WorkspaceChatInput from './WorkspaceChatInput.vue'

const props = defineProps<{
  chatId?: string
}>()

const emit = defineEmits<{
  titleUpdate: [title: string]
}>()

const apiController = new ApiController()

// Local state for this panel only
const loading = ref(false)
const fieldDisabled = ref(false)
const messages = ref<MessageType[]>([])
const conversationTitle = ref<string | null>(null)

onMounted(async () => {
  if (props.chatId && props.chatId !== 'new') {
    loading.value = true
    try {
      const response = await apiController.getConversation(props.chatId)
      if (response?.messages?.length) {
        messages.value = response.messages
      }
      if (response?.title) {
        conversationTitle.value = response.title
        emit('titleUpdate', response.title)
      }
    } catch (e) {
      console.error('Failed to load conversation:', e)
    } finally {
      loading.value = false
    }
  }
})

async function handleSend(messageText: string) {
  if (!messageText.trim()) return

  // Add user message locally
  const userMessage: MessageType = {
    id: crypto.randomUUID(),
    text: messageText,
    role: 'user',
    created_at: new Date().toISOString()
  }
  messages.value = [...messages.value, userMessage]

  // Add placeholder for assistant response
  const assistantMessage: MessageType = {
    id: crypto.randomUUID(),
    text: '',
    role: 'assistant',
    created_at: new Date().toISOString(),
    processing: true
  }
  messages.value = [...messages.value, assistantMessage]

  fieldDisabled.value = true

  try {
    // For new chats, create conversation first
    let chatId = props.chatId
    if (!chatId || chatId === 'new') {
      const newConv = await apiController.createConversation()
      chatId = newConv.privateId
    }

    // Send message and handle stream
    const stream = await apiController.sendMessage(
      chatId,
      messageText,
      userMessage.id,
      assistantMessage.id
    )

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      while (true) {
        const lineEnd = buffer.indexOf('\n')
        if (lineEnd === -1) break

        const line = buffer.slice(0, lineEnd).trim()
        buffer = buffer.slice(lineEnd + 1)

        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6))

            if (parsed.action === 'text_chunk' || parsed.action === 'process_response') {
              const lastMsg = messages.value[messages.value.length - 1]
              lastMsg.text += parsed.dt
              messages.value = [...messages.value]
            } else if (parsed.action === 'response_end' || parsed.action === 'finish_response') {
              const lastMsg = messages.value[messages.value.length - 1]
              lastMsg.processing = false
              if (!parsed.success) {
                lastMsg.error = true
              }
              messages.value = [...messages.value]
              fieldDisabled.value = false
            } else if (parsed.action === 'set_title') {
              conversationTitle.value = parsed.title
              emit('titleUpdate', parsed.title)
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to send message:', e)
    // Mark last message as error
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg) {
      lastMsg.text = 'Failed to send message. Please try again.'
      lastMsg.error = true
      lastMsg.processing = false
      messages.value = [...messages.value]
    }
    fieldDisabled.value = false
  }
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

      <WorkspaceChatInput
        :disabled="fieldDisabled"
        :loading="fieldDisabled"
        @send="handleSend"
      />
    </template>
  </div>
</template>
