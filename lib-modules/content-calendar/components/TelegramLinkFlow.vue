<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2, Copy, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useContentCalendarApi } from '../helpers/api'
import type { TelegramLinkStartResponse, TelegramLinkStatus } from '../types'
import { getToasterPosition } from '~/scripts/features/utils/toater'

const props = defineProps<{ workspaceId: string }>()
const emit = defineEmits<{
  linked: [socialAccountId: string]
}>()

const api = useContentCalendarApi()

const POLL_INTERVAL_MS = 2000
const COUNTDOWN_SEC = 60

const starting = ref(false)
const session = ref<TelegramLinkStartResponse | null>(null)
const status = ref<TelegramLinkStatus>('pending')
const failureReason = ref<string | null>(null)
const errorText = ref<string | null>(null)
const remainingSec = ref(COUNTDOWN_SEC)

let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const remainingLabel = computed(() => {
  const s = Math.max(0, remainingSec.value)
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${ss.toString().padStart(2, '0')}`
})

function stopTimers() {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function tickCountdown() {
  remainingSec.value -= 1
  if (remainingSec.value <= 0) {
    stopTimers()
    status.value = 'expired'
  }
}

async function start() {
  stopTimers()
  starting.value = true
  status.value = 'pending'
  failureReason.value = null
  errorText.value = null
  session.value = null
  remainingSec.value = COUNTDOWN_SEC
  try {
    session.value = await api.startTelegramLink(props.workspaceId)
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
    countdownTimer = setInterval(tickCountdown, 1000)
  } catch (e) {
    console.error('[TelegramLinkFlow] start failed:', e)
    errorText.value = 'Не удалось начать привязку. Попробуй ещё раз.'
  } finally {
    starting.value = false
  }
}

async function poll() {
  if (!session.value) return
  try {
    const res = await api.getTelegramLinkStatus(
      props.workspaceId,
      session.value.verificationCode,
    )
    status.value = res.status
    failureReason.value = res.failureReason ?? null

    if (res.status === 'completed') {
      stopTimers()
      if (res.socialAccountId) emit('linked', res.socialAccountId)
    } else if (res.status === 'failed' || res.status === 'expired') {
      stopTimers()
    }
  } catch (e) {
    console.error('[TelegramLinkFlow] poll failed:', e)
    stopTimers()
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  }
}

async function copyCode() {
  if (!session.value) return
  try {
    await navigator.clipboard.writeText(session.value.verificationCode)
    toast.success('Код скопирован', { position: getToasterPosition() })
  } catch {
    /* clipboard can fail in non-secure contexts — silently ignore */
  }
}

onMounted(start)
onBeforeUnmount(stopTimers)
</script>

<template>
  <div class="py-2 space-y-4">
    <div v-if="starting || !session" class="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" />
      Готовим ссылку…
    </div>

    <template v-else-if="status === 'pending' || status === 'user_started'">
      <a
        :href="session.deepLink"
        target="_blank"
        rel="noopener noreferrer"
        class="w-full inline-flex items-center justify-center gap-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 transition"
      >
        <ExternalLink class="h-4 w-4" />
        Открыть бота в Telegram
      </a>

      <div class="space-y-1.5">
        <div class="text-xs text-muted-foreground">Код верификации</div>
        <div class="flex items-center gap-2">
          <code class="flex-1 font-mono text-sm bg-muted rounded px-3 py-2 select-all">
            {{ session.verificationCode }}
          </code>
          <Button type="button" variant="outline" size="icon" aria-label="Скопировать код" @click="copyCode">
            <Copy class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span v-if="status === 'user_started'">Пользователь открыл бота, ждём подтверждения…</span>
        <span v-else>Откройте бота и нажмите Start.</span>
        <span class="font-mono tabular-nums">{{ remainingLabel }}</span>
      </div>
    </template>

    <template v-else-if="status === 'failed' || status === 'expired'">
      <div class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-medium">
            {{ status === 'expired' ? 'Время вышло' : 'Не получилось привязать канал' }}
          </div>
          <div v-if="failureReason" class="text-xs text-muted-foreground mt-1">
            {{ failureReason }}
          </div>
        </div>
      </div>
      <Button type="button" class="w-full" @click="start">Начать заново</Button>
    </template>

    <div v-if="errorText" class="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
      <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div class="flex-1">
        <div>{{ errorText }}</div>
        <Button type="button" variant="outline" size="sm" class="mt-2" @click="start">
          Попробовать снова
        </Button>
      </div>
    </div>
  </div>
</template>
