<script setup lang="ts">
import { computed, watch } from 'vue'
import { Sparkles, Globe, Film, RefreshCw } from 'lucide-vue-next'
import { useWorkspaceContext, useWorkspaceLimits } from '~/lib-modules/workspaces'
import { useProfileI18n } from '../composables/useProfileI18n'
import ProfilePageBlock from './ProfilePageBlock.vue'
import { cn } from '~/lib-modules/utils'

const { currentWorkspaceId } = useWorkspaceContext()
const wl = useWorkspaceLimits()
const { t, locale } = useProfileI18n()

watch(
  currentWorkspaceId,
  (wid) => { if (wid) wl.load() },
  { immediate: true },
)

interface Row {
  key: 'model' | 'search' | 'video'
  label: string
  icon: typeof Sparkles
  bar: string
  text: string
  left: number
  total: number
}

function asNum(v: number | string | undefined | null): number {
  return wl.asNumber(v)
}

const rows = computed<Row[]>(() => [
  {
    key: 'model',
    label: t('usageLimits.rows.model'),
    icon: Sparkles,
    bar: 'bg-brand',
    text: 'text-brand',
    left: asNum(wl.modelRequests.value?.left),
    total: asNum(wl.modelRequests.value?.total),
  },
  {
    key: 'search',
    label: t('usageLimits.rows.search'),
    icon: Globe,
    bar: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    left: asNum(wl.searchRequests.value?.left),
    total: asNum(wl.searchRequests.value?.total),
  },
  {
    key: 'video',
    label: t('usageLimits.rows.video'),
    icon: Film,
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    left: asNum(wl.shortVideoAnalysisRequests.value?.left),
    total: asNum(wl.shortVideoAnalysisRequests.value?.total),
  },
])

function leftPercent(left: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((left / total) * 100)))
}

const overallPercent = computed<number>(() => {
  const ratios = rows.value
    .filter(r => r.total > 0)
    .map(r => r.left / r.total)
  if (ratios.length === 0) return 0
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length
  return Math.min(100, Math.max(0, Math.round(avg * 100)))
})

const moodComment = computed<string>(() => {
  const p = overallPercent.value
  if (p === 0) return t('usageLimits.mood.empty')
  if (p >= 80) return t('usageLimits.mood.low')
  if (p >= 40) return t('usageLimits.mood.mid')
  return t('usageLimits.mood.high')
})

const hasAnyLimit = computed<boolean>(() => rows.value.some(r => r.total > 0))

const resetAtText = computed(() => {
  const at =
    wl.modelRequests.value?.resetAt ||
    wl.searchRequests.value?.resetAt ||
    wl.shortVideoAnalysisRequests.value?.resetAt ||
    null
  if (!at) return ''
  try {
    const localeTag = locale.value === 'en' ? 'en-US' : 'ru-RU'
    return new Date(at).toLocaleString(localeTag, {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
})
</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('usageLimits.header') }}</template>
    <template #content>
      <!-- Skeleton: same row geometry so height doesn't shift on data arrival. -->
      <div v-if="!wl.isLoaded.value" class="flex flex-col gap-5">
        <div class="h-4 w-72 max-w-full rounded bg-muted animate-pulse" />
        <div v-for="n in 3" :key="n" class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 min-w-0">
              <span class="h-4 w-4 shrink-0 rounded-sm bg-muted animate-pulse" />
              <span class="h-3.5 w-36 rounded bg-muted animate-pulse" />
            </span>
            <span class="h-3.5 w-12 rounded bg-muted animate-pulse" />
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-muted animate-pulse" />
        </div>
        <div class="h-3 w-44 rounded bg-muted animate-pulse" />
      </div>

      <div v-else class="flex flex-col gap-5">
        <p v-if="hasAnyLimit" class="text-sm text-muted-foreground">
          {{ t('usageLimits.summaryPrefix') }}
          <span class="font-medium text-foreground tabular-nums">{{ overallPercent }}%</span>
          {{ t('usageLimits.summarySuffix') }} {{ moodComment }}
        </p>
        <div
          v-for="row in rows"
          :key="row.key"
          class="flex flex-col gap-1.5"
        >
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="flex items-center gap-2 min-w-0">
              <component :is="row.icon" :class="cn('h-4 w-4 shrink-0', row.text)" />
              <span class="truncate">{{ row.label }}</span>
            </span>
            <span :class="cn('shrink-0 font-medium tabular-nums', row.text)">
              <template v-if="row.total > 0">
                {{ row.left }} <span class="text-muted-foreground font-normal">/ {{ row.total }}</span>
              </template>
              <template v-else>
                <span class="text-muted-foreground font-normal">—</span>
              </template>
            </span>
          </div>

          <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              :class="cn('h-full rounded-full transition-all duration-300', row.bar, row.total <= 0 && 'opacity-30')"
              :style="{ width: row.total > 0 ? `${leftPercent(row.left, row.total)}%` : '0%' }"
            />
          </div>
        </div>

        <div
          v-if="resetAtText"
          class="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground"
        >
          <RefreshCw class="h-3 w-3" />
          {{ t('usageLimits.resetsAt') }} {{ resetAtText }}
        </div>
      </div>
    </template>
  </ProfilePageBlock>
</template>
