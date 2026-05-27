<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Share2, Copy, Check, Loader2, Trash2, AlertCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useVideoAnalyzerStore } from '../stores/videoAnalyzerStore'

const props = defineProps<{
  analysisId: string
}>()

const { t } = useI18n()
const analyzer = useVideoAnalyzer()
const store = useVideoAnalyzerStore()

const open = ref(false)
const sharing = ref(false)
const revoking = ref(false)
const failed = ref(false)
const justCopied = ref(false)

const share = computed(() => store.getShare(props.analysisId))

// Public-facing URL — backend hands us a relative `publicPath` for the API,
// but the user wants the frontend viewer route. Compose against current origin
// so staging/prod share links Just Work without env wiring.
const shareUrl = computed(() => {
  const s = share.value
  if (!s) return ''
  if (typeof window === 'undefined') return `/r/${s.token}`
  return `${window.location.origin}/r/${s.token}`
})

async function ensureShared() {
  if (share.value || sharing.value) return
  sharing.value = true
  failed.value = false
  const result = await analyzer.share(props.analysisId)
  sharing.value = false
  if (!result) failed.value = true
}

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    justCopied.value = true
    setTimeout(() => { justCopied.value = false }, 1500)
  } catch {
    // Clipboard API can be blocked (insecure context / Safari permissions).
    // Fall through silently — the input is selectable as a manual fallback.
  }
}

async function revoke() {
  if (revoking.value) return
  revoking.value = true
  const ok = await analyzer.unshare(props.analysisId)
  revoking.value = false
  if (ok) open.value = false
}

// Eager POST on first open. Subsequent opens reuse the cached token.
watch(open, (v) => {
  if (v) ensureShared()
  else justCopied.value = false
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1.5">
        <Share2 class="h-3.5 w-3.5" />
        {{ t('videoAnalyzer.share.button') }}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-80 p-4">
      <div class="space-y-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold">{{ t('videoAnalyzer.share.title') }}</p>
          <p class="text-xs text-muted-foreground">
            {{ t('videoAnalyzer.share.subtitle') }}
          </p>
        </div>

        <div v-if="sharing" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin" />
          {{ t('videoAnalyzer.share.generating') }}
        </div>

        <div v-else-if="failed" class="flex items-start gap-2 rounded-md bg-destructive/10 px-2 py-2 text-xs text-destructive">
          <AlertCircle class="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div class="flex-1">
            <p>{{ t('videoAnalyzer.share.failed') }}</p>
            <button class="mt-1 underline" type="button" @click="ensureShared">
              {{ t('videoAnalyzer.share.retry') }}
            </button>
          </div>
        </div>

        <template v-else-if="share">
          <div class="flex gap-1.5">
            <Input
              :model-value="shareUrl"
              readonly
              class="h-9 flex-1 text-xs font-mono"
              @focus="($event.target as HTMLInputElement).select()"
            />
            <Button
              variant="outline"
              size="icon"
              class="h-9 w-9 shrink-0"
              :aria-label="t('videoAnalyzer.share.copy')"
              @click="copyLink"
            >
              <Check v-if="justCopied" class="h-3.5 w-3.5 text-emerald-600" />
              <Copy v-else class="h-3.5 w-3.5" />
            </Button>
          </div>

          <div class="border-t border-border pt-2">
            <Button
              variant="ghost"
              size="sm"
              class="h-8 w-full justify-start gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              :disabled="revoking"
              @click="revoke"
            >
              <Loader2 v-if="revoking" class="h-3.5 w-3.5 animate-spin" />
              <Trash2 v-else class="h-3.5 w-3.5" />
              {{ t('videoAnalyzer.share.revoke') }}
            </Button>
          </div>
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>
