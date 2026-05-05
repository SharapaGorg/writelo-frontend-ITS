<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ScanSearch, Loader2, AlertCircle } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useAnalysisLimits } from '../composables/useAnalysisLimits'

const props = defineProps<{
  canRun?: boolean
}>()

const url = ref('')
const router = useRouter()

const analyzer = useVideoAnalyzer()
const limits = useAnalysisLimits()

// Light-touch validation. Backend remains the source of truth.
const SUPPORTED_HOST_RE = /(youtu\.be|youtube\.com|tiktok\.com|instagram\.com)/i

const isValidUrl = computed(() => {
  const value = url.value.trim()
  if (!value) return false
  try {
    const u = new URL(value)
    return SUPPORTED_HOST_RE.test(u.hostname)
  } catch {
    return false
  }
})

const isDisabled = computed(() => {
  if (props.canRun === false) return true
  if (analyzer.isSubmitting.value) return true
  if (limits.isLoaded.value && limits.isExhausted.value) return true
  return !isValidUrl.value
})

const limitsChipClass = computed(() => {
  if (!limits.isLoaded.value) return 'border-border bg-muted/40 text-muted-foreground'
  if (limits.left.value === 0) return 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
  if (limits.left.value <= 3) return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
  return 'border-border bg-muted/40 text-muted-foreground'
})

const resetText = computed(() => {
  const at = limits.resetAt.value
  if (!at) return ''
  try {
    const d = new Date(at)
    return d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

async function onSubmit() {
  if (isDisabled.value) return
  const value = url.value.trim()
  const result = await analyzer.submit(value)
  if (result) {
    url.value = ''
    router.push(`/app/video-analyzer/${result.analysisId}`)
  }
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
    <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <ScanSearch class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="url"
          type="url"
          placeholder="Вставь ссылку на YouTube Shorts, TikTok или Instagram Reels"
          class="h-11 pl-9"
          :disabled="canRun === false || analyzer.isSubmitting.value"
          @keydown.enter.prevent="onSubmit"
        />
      </div>
      <Button
        class="h-11 shrink-0 px-5"
        :disabled="isDisabled"
        @click="onSubmit"
      >
        <Loader2 v-if="analyzer.isSubmitting.value" class="mr-1 h-4 w-4 animate-spin" />
        Анализировать
      </Button>
    </div>

    <div class="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      <span :class="cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium', limitsChipClass)">
        <span v-if="!limits.isLoaded.value">Загрузка лимита…</span>
        <template v-else>
          <span v-if="limits.left.value === 0">Лимит исчерпан</span>
          <span v-else>Осталось {{ limits.left.value }} анализов</span>
        </template>
      </span>
      <button
        v-if="limits.isLoaded.value && limits.isExhausted.value"
        type="button"
        class="inline-flex items-center gap-1 text-xs text-brand hover:underline"
        @click="router.push('/app/plans')"
      >
        <AlertCircle class="h-3 w-3" />
        Перейти к тарифам<span v-if="resetText"> · обновится {{ resetText }}</span>
      </button>
      <p
        v-else-if="canRun === false"
        class="text-xs text-muted-foreground sm:text-right"
      >Только владелец, админ или редактор могут запускать анализ.</p>
    </div>
  </div>
</template>
