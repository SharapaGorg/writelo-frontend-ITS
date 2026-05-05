<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AttachedFileArea,
  BottomBar,
  Message,
  Role,
} from '~/lib-modules/conversations'
import { Textarea } from '~/components/ui/textarea'
import { PromptImproverWrapper } from '~/components/molecules/PromptImproverWrapper'
import { isMobile } from '~/scripts/features/utils'
import { eventBus } from '~/composables/eventBus'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useAssistantChat } from '../composables/useAssistantChat'
import { useAssistantStore } from '../stores/assistantStore'
import AssistantChatSkeleton from './AssistantChatSkeleton.vue'
import EmptyStateHero from './EmptyStateHero.vue'

const route = useRoute()
const router = useRouter()
const { currentWorkspace } = useWorkspaceContext()
const store = useAssistantStore()
const { messages, isProcessing, isLoadingHistory, send, stop, setActiveConversation } = useAssistantChat()

const ROWS_LIMIT = 7
const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textarea = ref<InstanceType<typeof Textarea> | null>(null)
const promptImprover = ref<InstanceType<typeof PromptImproverWrapper> | null>(null)
const { hasAttachedFiles } = useAttachMedia()

const rows = computed(() => {
  const lineCount = (input.value.match(/\n/g) || []).length + 1
  return Math.min(lineCount, ROWS_LIMIT)
})

function getRoleEnum(role: 'user' | 'assistant'): Role {
  return role === 'user' ? Role.user : Role.assistant
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, () => nextTick(scrollToBottom))
watch(
  () => messages.value[messages.value.length - 1]?.visibleText,
  () => nextTick(scrollToBottom),
)

async function onSend() {
  const text = input.value.trim()
  if (!text || isProcessing.value) return
  input.value = ''
  await send(text)
}

function onPrompt(text: string) {
  input.value = text
  nextTick(() => {
    textarea.value?.textarea?.focus()
    promptImprover.value?.markAsProcessed()
  })
}

function onTemplateSelect(text: string) {
  input.value = text
  nextTick(() => {
    textarea.value?.textarea?.focus()
    promptImprover.value?.markAsProcessed()
  })
}

function onSearchButtonClicked() {
  setTimeout(() => textarea.value?.textarea?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  if (isMobile()) {
    if (e.shiftKey || e.ctrlKey) {
      e.preventDefault()
      onSend()
    }
  } else {
    if (!e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }
}

// Keep active conversation in sync with URL. Tied to currentWorkspace.id so
// workspace-init race (immediate=true firing before workspace is ready) can't
// throw out of requireWorkspaceId().
watch(
  [() => route.query.conv, () => currentWorkspace.value?.id],
  ([convQuery, wid]) => {
    if (!wid) return
    const convId = typeof convQuery === 'string' ? convQuery : null
    setActiveConversation(convId)
  },
  { immediate: true },
)

// One-shot last-active restore: runs only on first mount when workspace becomes
// available and the URL has no ?conv. Stops itself after firing so that a later
// "+ Новый чат" click (which clears ?conv) is not undone by the restore.
const stopRestoreLastActive = watch(
  () => currentWorkspace.value?.id,
  (wid) => {
    if (!wid) return
    stopRestoreLastActive()
    if (typeof route.query.conv === 'string') return
    const lastId = store.getLastActive(wid)
    if (lastId) router.replace({ query: { ...route.query, conv: lastId } })
  },
  { immediate: true },
)

onMounted(() => {
  eventBus.on('stopGeneration', stop)
})

onUnmounted(() => {
  eventBus.off('stopGeneration', stop)
})
</script>

<template>
  <div class="relative flex h-full flex-col">
    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
    >
      <template v-if="isLoadingHistory && messages.length === 0">
        <AssistantChatSkeleton />
      </template>
      <template v-else-if="messages.length === 0">
        <EmptyStateHero @pick="onPrompt" />
      </template>
      <template v-else>
        <div class="mx-auto max-w-[760px] space-y-4 px-4 py-6">
          <Message
            v-for="(m, i) in messages"
            :id="m.id"
            :key="m.id"
            :text="m.visibleText ?? m.text"
            :role="getRoleEnum(m.role)"
            :created_at="String(m.createdAt)"
            :processing="m.processing"
            :error="m.error"
            :is-last="i === messages.length - 1"
          />
        </div>
      </template>
    </div>

    <!-- Floating composer island -->
    <div class="shrink-0 px-4 pb-4 pt-2">
      <Transition name="lazy-loading">
        <AttachedFileArea v-if="hasAttachedFiles" inline />
      </Transition>

      <div class="mx-auto w-full max-w-[760px] rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
        <PromptImproverWrapper
          ref="promptImprover"
          v-model="input"
          :disabled="isProcessing"
          class="w-full"
        >
          <Textarea
            ref="textarea"
            v-model="input"
            :rows="rows"
            :disabled="isProcessing"
            class="min-h-[40px] resize-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
            placeholder="Напиши сообщение..."
            @keydown="onKeydown"
          />
        </PromptImproverWrapper>

        <BottomBar
          :generation-in-process="isProcessing"
          :message="input"
          @send="onSend"
          @search-button-clicked="onSearchButtonClicked"
          @template-select="onTemplateSelect"
        />
      </div>
    </div>
  </div>
</template>
