<script setup lang="ts">
import { Loader2, Copy } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import { BottomBar, AttachedFileArea } from '~/lib-modules/conversations'
import { PromptImproverWrapper } from '~/components/molecules/PromptImproverWrapper'
import { useI18n } from 'vue-i18n'
import { isMobile } from '~/scripts/features/utils'

const { t } = useI18n()

const {
  chatMessages,
  isChatProcessing,
  addChatMessage,
  updateChatMessage,
  setChatProcessing,
  appendToDescription
} = useContentEditor()

const messagesContainer = ref<HTMLElement | null>(null)
const textarea = ref<InstanceType<typeof Textarea> | null>(null)
const promptImprover = ref<InstanceType<typeof PromptImproverWrapper> | null>(null)

// Input state
const ROWS_LIMIT = 7
const newMessage = ref('')
const { hasAttachedFiles } = useAttachMedia()

const rows = computed(() => {
  const lineCount = (newMessage.value.match(/\n/g) || []).length + 1
  return Math.min(lineCount, ROWS_LIMIT)
})

// Text statistics helpers
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

  newMessage.value = ''

  // Add user message
  addChatMessage('user', text)

  // Add placeholder for assistant response
  const assistantId = addChatMessage('assistant', '')
  setChatProcessing(true)

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  // TODO: Replace with actual API call
  // Simulate AI response for now
  setTimeout(() => {
    const mockResponse = `This is a simulated AI response to: "${text}". In the actual implementation, this will be replaced with real AI-generated content for your social media post.`
    updateChatMessage(assistantId, mockResponse)
    setChatProcessing(false)
    scrollToBottom()
  }, 1500)
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

const copyToPost = (text: string) => {
  appendToDescription(text)
}
</script>

<template>
  <div class="flex h-full flex-col">
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
        <div class="text-center text-zinc-500 dark:text-zinc-400">
          <p class="text-sm">Start a conversation to get AI assistance</p>
          <p class="mt-1 text-xs">Ask for help with your post description, hashtags, or ideas</p>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="message in chatMessages"
        :key="message.id"
        :class="cn(
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        )"
      >
        <div
          :class="cn(
            'max-w-[85%] rounded-lg px-3 py-2',
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
          )"
        >
          <!-- Processing indicator -->
          <div v-if="message.processing" class="flex items-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" />
            <span class="text-sm">Thinking...</span>
          </div>

          <!-- Message text -->
          <p v-else class="text-sm whitespace-pre-wrap">{{ message.text }}</p>

          <!-- Quick actions for assistant messages -->
          <div
            v-if="message.role === 'assistant' && !message.processing && message.text"
            class="mt-2 flex items-center gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-700"
          >
            <Button
              variant="ghost"
              size="sm"
              class="h-7 px-2 text-xs"
              @click="copyToPost(message.text)"
            >
              <Copy class="mr-1 h-3 w-3" />
              Add to description
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-zinc-200 dark:border-zinc-800">
      <Transition name="lazy-loading">
        <AttachedFileArea
          v-if="hasAttachedFiles"
          :height="Math.max(rows, 3) * 20 + 90"
        />
      </Transition>

      <div class="p-4">
        <div class="flex flex-col gap-x-2">
          <PromptImproverWrapper
            ref="promptImprover"
            v-model="newMessage"
            :disabled="isChatProcessing"
            class="w-full"
          >
            <Textarea
              v-model="newMessage"
              class="resize-none border-none p-0"
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
          @send="sendMessage"
          @searchButtonClicked="onSearchButtonClicked"
          @templateSelect="onTemplateSelect"
        />
      </div>
    </div>
  </div>
</template>
