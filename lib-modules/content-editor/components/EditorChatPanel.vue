<script setup lang="ts">
import { Send, Loader2, Copy } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'

const {
  chatMessages,
  isChatProcessing,
  addChatMessage,
  updateChatMessage,
  setChatProcessing,
  appendToDescription
} = useContentEditor()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isChatProcessing) return

  inputText.value = ''

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

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
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
    <div class="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div class="flex items-end gap-2">
        <textarea
          v-model="inputText"
          @keydown="handleKeydown"
          :disabled="isChatProcessing"
          placeholder="Ask AI for help with your post..."
          rows="1"
          class="flex-1 resize-none rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400"
        />
        <Button
          @click="sendMessage"
          :disabled="!inputText.trim() || isChatProcessing"
          size="icon"
          class="h-10 w-10 shrink-0"
        >
          <Loader2 v-if="isChatProcessing" class="h-4 w-4 animate-spin" />
          <Send v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
