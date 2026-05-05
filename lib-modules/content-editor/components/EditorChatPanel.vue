<script setup lang="ts">
import { Textarea } from '~/components/ui/textarea'
import { useContentEditor } from '../composables/useContentEditor'
import { BottomBar, AttachedFileArea, Message, Role } from '~/lib-modules/conversations'
import { PromptImproverWrapper } from '~/components/molecules/PromptImproverWrapper'
import { Button } from '~/components/ui/button'
import { Eraser } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { isMobile } from '~/scripts/features/utils'
import { ApiController } from '~/scripts/shared/api/controller'
import { eventBus } from '~/composables/eventBus'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { parseActionsTail, isMarkerLikely } from '~/lib-modules/assistant'

const props = withDefaults(defineProps<{
  showcaseMode?: boolean
}>(), {
  showcaseMode: false
})

const { t } = useI18n()
const apiController = new ApiController()

const {
  chatMessages,
  isChatProcessing,
  conversationId,
  addChatMessage,
  updateChatMessage,
  appendToChatMessage,
  setChatMessageError,
  updateChatMessageId,
  setChatProcessing,
  setConversationId,
  getLastMessage,
  clearChat
} = useContentEditor()

function stripMarker(uuid: string) {
  const target = chatMessages.value.find(m => m.id === uuid)
  if (!target) return
  if (!isMarkerLikely(target.text)) return
  const { visibleText } = parseActionsTail(target.text)
  if (visibleText !== target.text) updateChatMessage(uuid, visibleText)
}

const messagesContainer = ref<HTMLElement | null>(null)
const textarea = ref<InstanceType<typeof Textarea> | null>(null)
const promptImprover = ref<InstanceType<typeof PromptImproverWrapper> | null>(null)
const isStoppingGeneration = ref(false)

// Input state
const ROWS_LIMIT = 7
const newMessage = ref('')
const { hasAttachedFiles, detachAll } = useAttachMedia()

const rows = computed(() => {
  const lineCount = (newMessage.value.match(/\n/g) || []).length + 1
  return Math.min(lineCount, ROWS_LIMIT)
})

// Text statistics for input field
const countWords = (text: string): number => {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const countSentences = (text: string): number => {
  if (!text.trim()) return 0
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  return sentences.length
}

const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text || isChatProcessing.value) return

  // Showcase mode (landing): clear input and bail — there's no workspace/auth
  // to send against, and we don't want a fake API error toast on visitors.
  if (props.showcaseMode) {
    newMessage.value = ''
    return
  }

  newMessage.value = ''

  // Add user message
  const requestUuid = addChatMessage('user', text)

  // Add placeholder for assistant response
  const responseUuid = addChatMessage('assistant', '')
  setChatProcessing(true)

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  const {requireWorkspaceId} = useWorkspaceContext()
  const workspaceId = requireWorkspaceId()

  // Create conversation if not exists
  let convId = conversationId.value
  if (!convId) {
    try {
      const newConversation = await apiController.createWorkspaceConversation(workspaceId)
      convId = newConversation.id
      setConversationId(convId)
      // Editor chat is a scratch pad — conversation lives on the backend but is
      // never reflected in the URL, so the chat starts empty on every open.
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setChatMessageError(responseUuid, true)
      updateChatMessage(responseUuid, t('editor.chat.errors.createConversation'))
      setChatProcessing(false)
      return
    }
  }

  // Send message via API
  let streamResponse
  try {
    streamResponse = await apiController.sendWorkspaceMessage(workspaceId, convId, text)
    detachAll()
  } catch (error: any) {
    console.error('[EditorChat] Error sending message:', error)
    const errorDetail = error?.data?.detail || t('editor.chat.errors.sendMessage')
    updateChatMessage(responseUuid, errorDetail)
    setChatMessageError(responseUuid, true)
    setChatProcessing(false)
    return
  }

  if (!streamResponse) {
    updateChatMessage(responseUuid, t('editor.chat.errors.streamFailed'))
    setChatMessageError(responseUuid, true)
    setChatProcessing(false)
    return
  }

  // Process SSE stream
  const processStreamData = (parsed: any) => {
    const actions: Record<string, () => void> = {
      text_chunk: () => {
        appendToChatMessage(responseUuid, parsed.dt)
        stripMarker(responseUuid)
        scrollToBottom()
      },
      request_message_id: () => {
        updateChatMessageId(requestUuid, parsed.messageId)
      },
      response_message_id: () => {
        updateChatMessageId(responseUuid, parsed.messageId)
      },
      response_end: () => {
        setChatProcessing(false)
        if (!parsed.success && !isStoppingGeneration.value) {
          appendToChatMessage(responseUuid, parsed.message || '\n**Server is busy**')
          setChatMessageError(responseUuid, true)
        }
        stripMarker(responseUuid)
        isStoppingGeneration.value = false
        const lastMsg = getLastMessage()
        if (lastMsg) lastMsg.processing = false
      },
      // Legacy actions for backward compatibility
      process_response: () => {
        appendToChatMessage(responseUuid, parsed.dt)
        stripMarker(responseUuid)
        scrollToBottom()
      },
      finish_response: () => {
        setChatProcessing(false)
        if (!parsed.success && !isStoppingGeneration.value) {
          appendToChatMessage(responseUuid, parsed.error || '\n**Server is busy**')
          setChatMessageError(responseUuid, true)
        }
        stripMarker(responseUuid)
        isStoppingGeneration.value = false
        const lastMsg = getLastMessage()
        if (lastMsg) lastMsg.processing = false
      }
    }

    actions[parsed.action]?.()
  }

  const reader = streamResponse.getReader()
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
          processStreamData(JSON.parse(line.slice(6)))
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    }
  }
}

const stopGeneration = async () => {
  isStoppingGeneration.value = true
  setChatProcessing(false)

  const lastMsg = getLastMessage()
  if (lastMsg) {
    lastMsg.processing = false
  }

  if (conversationId.value) {
    const {requireWorkspaceId} = useWorkspaceContext()
    await apiController.stopWorkspaceGeneration(requireWorkspaceId(), conversationId.value)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (isMobile()) {
      if (event.shiftKey || event.ctrlKey) {
        event.preventDefault()
        sendMessage()
      }
    } else {
      if (!event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }
  }
}

const onSearchButtonClicked = () => {
  setTimeout(() => {
    textarea.value?.textarea?.focus()
  })
}

const onTemplateSelect = (text: string) => {
  newMessage.value = text
  nextTick(() => {
    textarea.value?.textarea?.focus()
    promptImprover.value?.markAsProcessed()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Convert string role to Role enum
const getRoleEnum = (role: 'user' | 'assistant'): Role => {
  return role === 'user' ? Role.user : Role.assistant
}

// Event bus listeners
onMounted(() => {
  eventBus.on('stopGeneration', stopGeneration)
})

onUnmounted(() => {
  eventBus.off('stopGeneration', stopGeneration)
})
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header: clear chat -->
    <div
      v-if="!props.showcaseMode"
      class="flex h-9 items-center justify-end border-b border-border px-3"
    >
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        title="Очистить чат"
        :disabled="chatMessages.length === 0 && !conversationId"
        @click="clearChat"
      >
        <Eraser class="h-4 w-4" />
      </Button>
    </div>

    <!-- Messages area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Empty state -->
      <div
        v-if="chatMessages.length === 0"
        class="flex h-full items-center justify-center"
      >
        <div class="text-center text-muted-foreground">
          <p class="text-sm">{{ $t('editor.chat.empty.title') }}</p>
          <p class="mt-1 text-xs">{{ $t('editor.chat.empty.subtitle') }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in chatMessages"
        :key="message.id"
      >
        <Message
          :id="message.id"
          :text="message.text"
          :role="getRoleEnum(message.role)"
          :created_at="message.createdAt"
          :processing="message.processing"
          :error="message.error"
          :is-last="index === chatMessages.length - 1"
        />
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-border">
      <Transition name="lazy-loading">
        <AttachedFileArea
          v-if="hasAttachedFiles"
          inline
        />
      </Transition>

      <div class="p-4">
        <div class="flex flex-col gap-x-2">
          <PromptImproverWrapper
            ref="promptImprover"
            v-model="newMessage"
            :disabled="isChatProcessing"
            :showcase-mode="props.showcaseMode"
            class="w-full"
          >
            <Textarea
              v-model="newMessage"
              class="resize-none border-none p-0 shadow-none focus-visible:ring-0"
              :placeholder="t('placeholder')"
              @keydown="handleKeydown"
              :rows="rows"
              :disabled="isChatProcessing"
              ref="textarea"
            />
          </PromptImproverWrapper>

          <!-- Text stats counter -->
          <div
            v-if="newMessage.length > 0"
            class="text-xs text-muted-foreground text-right mt-1 flex gap-3 justify-end"
          >
            <span>{{ newMessage.length }} {{ t('charCounter.chars') }}</span>
            <span>{{ countWords(newMessage) }} {{ t('charCounter.words') }}</span>
            <span>{{ countSentences(newMessage) }} {{ t('charCounter.sentences') }}</span>
          </div>
        </div>

        <BottomBar
          :generation-in-process="isChatProcessing"
          :message="newMessage"
          :showcase-mode="props.showcaseMode"
          @send="sendMessage"
          @searchButtonClicked="onSearchButtonClicked"
          @templateSelect="onTemplateSelect"
        />
      </div>
    </div>
  </div>
</template>
