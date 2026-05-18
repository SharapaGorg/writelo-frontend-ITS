<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { useContentCalendarApi } from '../helpers/api'
import type { SocialNetwork } from '../types'

const props = defineProps<{ workspaceId: string; platform: SocialNetwork }>()
const emit = defineEmits<{
  linked: [socialAccountId: string]
}>()

const api = useContentCalendarApi()

const POLL_INTERVAL_MS = 3000
const TIMEOUT_SEC = 120

type FlowState = 'starting' | 'waiting' | 'timed_out' | 'error'

interface PlatformCopy {
  openButton: string
  openButtonClass: string
  waitingHint: string
}

const COPY: Record<SocialNetwork, PlatformCopy> = {
  telegram: {
    openButton: 'Открыть бота в Telegram',
    openButtonClass: 'bg-sky-500 hover:bg-sky-600 text-white',
    waitingHint: 'Откройте бота и нажмите Start.',
  },
  instagram: {
    openButton: 'Авторизоваться в Instagram',
    openButtonClass: 'bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90 text-white',
    waitingHint: 'Завершите авторизацию во вкладке Instagram.',
  },
  vk: {
    openButton: 'Авторизоваться в ВКонтакте',
    openButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    waitingHint: 'Завершите авторизацию во вкладке ВКонтакте.',
  },
  youtube: {
    openButton: 'Авторизоваться в YouTube',
    openButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
    waitingHint: 'Завершите авторизацию во вкладке YouTube.',
  },
}

const copy = computed<PlatformCopy>(() => COPY[props.platform])

const state = ref<FlowState>('starting')
const linkUrl = ref<string | null>(null)
const errorText = ref<string | null>(null)
const remainingSec = ref(TIMEOUT_SEC)
const manualCheckPending = ref(false)
const manualCheckEmpty = ref(false)

let existingIds = new Set<string>()
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

function findNewAccountId(accounts: { id: string; network: string }[]): string | null {
  for (const a of accounts) {
    if (a.network === props.platform && !existingIds.has(a.id)) {
      return a.id
    }
  }
  return null
}

function tickCountdown() {
  remainingSec.value -= 1
  if (remainingSec.value <= 0) {
    stopTimers()
    state.value = 'timed_out'
  }
}

async function poll() {
  try {
    const accounts = await api.getSocialAccounts(props.workspaceId, true)
    const newId = findNewAccountId(accounts)
    if (newId) {
      stopTimers()
      emit('linked', newId)
    }
  } catch (e) {
    console.error('[SocialAccountLinkFlow] poll failed:', e)
    stopTimers()
    state.value = 'error'
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  }
}

async function start() {
  stopTimers()
  state.value = 'starting'
  errorText.value = null
  linkUrl.value = null
  remainingSec.value = TIMEOUT_SEC
  manualCheckEmpty.value = false
  manualCheckPending.value = false

  try {
    const accountsBefore = await api.getSocialAccounts(props.workspaceId, true)
    existingIds = new Set(
      accountsBefore.filter((a) => a.network === props.platform).map((a) => a.id),
    )

    const res = await api.startSocialAccountLink(props.workspaceId, props.platform)
    linkUrl.value = res.url
    state.value = 'waiting'
    pollTimer = setInterval(poll, POLL_INTERVAL_MS)
    countdownTimer = setInterval(tickCountdown, 1000)
  } catch (e) {
    console.error('[SocialAccountLinkFlow] start failed:', e)
    state.value = 'error'
    errorText.value = 'Не удалось начать привязку. Попробуй ещё раз.'
  }
}

async function manualCheck() {
  manualCheckPending.value = true
  manualCheckEmpty.value = false
  try {
    const accounts = await api.getSocialAccounts(props.workspaceId, true)
    const newId = findNewAccountId(accounts)
    if (newId) {
      emit('linked', newId)
    } else {
      manualCheckEmpty.value = true
    }
  } catch (e) {
    console.error('[SocialAccountLinkFlow] manual check failed:', e)
    state.value = 'error'
    errorText.value = 'Потеряли связь с сервером. Попробуй ещё раз.'
  } finally {
    manualCheckPending.value = false
  }
}

onMounted(start)
onBeforeUnmount(stopTimers)
</script>

<template>
  <div class="py-2 space-y-4">
    <div
      v-if="state === 'starting'"
      class="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2 class="h-4 w-4 animate-spin" />
      Готовим ссылку…
    </div>

    <template v-else-if="state === 'waiting' && linkUrl">
      <a
        :href="linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
          'w-full inline-flex items-center justify-center gap-2 rounded-md font-semibold px-4 py-2.5 transition',
          copy.openButtonClass,
        ]"
      >
        <ExternalLink class="h-4 w-4" />
        {{ copy.openButton }}
      </a>

      <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span>{{ copy.waitingHint }}</span>
        <span class="font-mono tabular-nums">{{ remainingLabel }}</span>
      </div>
    </template>

    <template v-else-if="state === 'timed_out'">
      <div class="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div class="font-medium text-foreground">Не дождались привязки</div>
          <div class="text-xs mt-1">
            Если уже подтвердил — нажми «Проверить». Иначе можно начать заново.
          </div>
          <div v-if="manualCheckEmpty" class="text-xs mt-2 text-red-600 dark:text-red-400">
            Аккаунт ещё не появился. Подожди немного и попробуй снова.
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <Button
          type="button"
          variant="default"
          class="flex-1"
          :disabled="manualCheckPending"
          @click="manualCheck"
        >
          <Loader2 v-if="manualCheckPending" class="h-4 w-4 animate-spin mr-2" />
          Проверить
        </Button>
        <Button type="button" variant="outline" class="flex-1" @click="start">
          Начать заново
        </Button>
      </div>
    </template>

    <template v-else-if="state === 'error'">
      <div class="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
        <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <div>{{ errorText }}</div>
          <Button type="button" variant="outline" size="sm" class="mt-2" @click="start">
            Попробовать снова
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
