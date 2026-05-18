<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ScanSearch, Loader2, AlertCircle } from 'lucide-vue-next'

const { t, locale } = useI18n()
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useAnalysisLimits } from '../composables/useAnalysisLimits'

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
  if (analyzer.isSubmitting.value) return true
  if (limits.isLoaded.value && limits.isExhausted.value) return true
  return !isValidUrl.value
})

const limitsTextClass = computed(() => {
  if (!limits.isLoaded.value) return 'text-muted-foreground'
  if (limits.left.value === 0) return 'text-rose-600 dark:text-rose-300'
  if (limits.left.value <= 3) return 'text-amber-700 dark:text-amber-300'
  return 'text-muted-foreground'
})

const limitsDotClass = computed(() => {
  if (!limits.isLoaded.value) return 'bg-muted-foreground/40'
  if (limits.left.value === 0) return 'bg-rose-500'
  if (limits.left.value <= 3) return 'bg-amber-500'
  return 'bg-emerald-500'
})

const resetText = computed(() => {
  const at = limits.resetAt.value
  if (!at) return ''
  try {
    const d = new Date(at)
    const tag = locale.value === 'en' ? 'en-US' : 'ru-RU'
    return d.toLocaleString(tag, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

function leftKey(n: number): string {
  if (locale.value === 'en') return n === 1 ? 'videoAnalyzer.input.leftCountOne' : 'videoAnalyzer.input.leftCountMany'
  // Russian pluralization
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'videoAnalyzer.input.leftCountOne'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'videoAnalyzer.input.leftCountFew'
  return 'videoAnalyzer.input.leftCountMany'
}

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
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <ScanSearch class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="url"
          type="url"
          :placeholder="t('videoAnalyzer.input.placeholder')"
          class="h-11 pl-9"
          :disabled="analyzer.isSubmitting.value"
          @keydown.enter.prevent="onSubmit"
        />
      </div>
      <Button
        class="h-11 shrink-0 px-5"
        :disabled="isDisabled"
        @click="onSubmit"
      >
        <Loader2 v-if="analyzer.isSubmitting.value" class="mr-1 h-4 w-4 animate-spin" />
        {{ t('videoAnalyzer.input.analyze') }}
      </Button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-xs">
      <span :class="cn('inline-flex items-center gap-1.5', limitsTextClass)">
        <span :class="cn('h-1.5 w-1.5 rounded-full', limitsDotClass)" />
        <span v-if="!limits.isLoaded.value">{{ t('videoAnalyzer.input.limitsLoading') }}</span>
        <template v-else>
          <span v-if="limits.left.value === 0">{{ t('videoAnalyzer.input.limitExhausted') }}</span>
          <span v-else>{{ t(leftKey(limits.left.value), { n: limits.left.value }) }}</span>
        </template>
      </span>
      <button
        v-if="limits.isLoaded.value && limits.isExhausted.value"
        type="button"
        class="inline-flex items-center gap-1 text-brand hover:underline"
        @click="router.push('/app/plans')"
      >
        <AlertCircle class="h-3 w-3" />
        {{ t('videoAnalyzer.input.goToPlans') }}<span v-if="resetText">{{ t('videoAnalyzer.input.resetsAt', { date: resetText }) }}</span>
      </button>
    </div>
  </div>
</template>
