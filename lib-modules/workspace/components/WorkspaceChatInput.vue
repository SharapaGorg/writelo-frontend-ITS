<!-- lib-modules/workspace/components/WorkspaceChatInput.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Send, Loader2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const { t } = useI18n()

const message = ref('')

const ROWS_LIMIT = 5

const rows = computed(() => {
  const lineCount = (message.value.match(/\n/g) || []).length + 1
  return Math.min(lineCount, ROWS_LIMIT)
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && !props.disabled && !props.loading
})

function handleSend() {
  if (!canSend.value) return
  emit('send', message.value)
  message.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="border-t bg-background p-3">
    <div class="flex gap-2 items-end">
      <Textarea
        v-model="message"
        :rows="rows"
        :disabled="disabled || loading"
        :placeholder="t('placeholder')"
        class="resize-none flex-1 min-h-[40px] max-h-[120px]"
        @keydown="handleKeydown"
      />
      <Button
        size="icon"
        :disabled="!canSend"
        @click="handleSend"
        class="shrink-0 h-10 w-10"
      >
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <Send v-else class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
