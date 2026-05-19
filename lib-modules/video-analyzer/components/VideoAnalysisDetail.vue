<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Languages,
  Gift,
  Lightbulb,
  ListOrdered,
  Gauge,
} from 'lucide-vue-next'
import { AppNavbar } from '~/lib-modules/app-layout'
import { Button } from '~/components/ui/button'
import { useWorkspaces, useWorkspaceContext } from '~/lib-modules/workspaces'
import PlatformIcon from './PlatformIcon.vue'
import AnalysisStatusBadge from './AnalysisStatusBadge.vue'
import SummarySection from './sections/SummarySection.vue'
import HooksSection from './sections/HooksSection.vue'
import StructureSection from './sections/StructureSection.vue'
import FunnelSection from './sections/FunnelSection.vue'
import TagsSection from './sections/TagsSection.vue'
import ImprovementsSection from './sections/ImprovementsSection.vue'
import TranscriptionSection from './sections/TranscriptionSection.vue'
import AxesSection from './sections/AxesSection.vue'
import ViralDriversSection from './sections/ViralDriversSection.vue'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useVideoAnalyzerStore } from '../stores/videoAnalyzerStore'
import { humanizeAnalysisError } from '../helpers/humanizeError'
import {
  isTranscriptionShape,
  isTranscriptionShapeV2,
  isFunnelShape,
  isFunnelShapeV2,
  isImprovementsShape,
  isImprovementsShapeV2,
  isStructureShape,
  isStructureShapeV2,
  isAxesShape,
  isViralDriversArray,
  orderedStructureSteps,
} from '../helpers/sectionShape'
import { computeReelScore, LEVEL_TONES, scoreToLevel } from '../helpers/aggregation'
import { V2_MOCK_DETAIL, V2_MOCK_HISTORY_ITEM } from '../helpers/v2MockFixture'
import type {
  ShortVideoAnalysisHistoryItemDto,
  ShortVideoAnalysisDto,
  ImprovementsShape,
  AxisLevel,
  AxesShape,
} from '../types'

const props = defineProps<{
  analysisId: string
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { currentWorkspaceId } = useWorkspaceContext()
const analyzer = useVideoAnalyzer()
const store = useVideoAnalyzerStore()

const notFound = ref(false)
const loading = ref(true)
const stopPoll = ref<(() => void) | null>(null)
const retrying = ref(false)

// Dev-only override: `?mock=v2` swaps the detail for a hand-crafted v2
// fixture so designers can see the new layout before the backend ships it.
// The real network calls are skipped — see ensureLoaded() below. Gated by
// `import.meta.env.DEV` so a stray `?mock=v2` in prod has no effect (Vite
// inlines the flag at build time → dead-code-elim drops the branch).
const mockMode = computed(() => import.meta.env.DEV && route.query.mock === 'v2')

const detail = computed(() => {
  if (mockMode.value) return V2_MOCK_DETAIL
  return store.getDetail(props.analysisId)
})

const historyItem = computed<ShortVideoAnalysisHistoryItemDto | null>(() => {
  if (mockMode.value) return V2_MOCK_HISTORY_ITEM
  if (!currentWorkspaceId.value) return null
  return store.findHistoryByAnalysisId(currentWorkspaceId.value, props.analysisId)
})

const status = computed(() => historyItem.value?.status ?? detail.value?.status ?? null)

const platform = computed(() => detail.value?.platform ?? historyItem.value?.platform ?? null)
const originalUrl = computed(() => detail.value?.originalUrl ?? historyItem.value?.originalUrl ?? '')

const analyzedAtHuman = computed(() => {
  const at = detail.value?.analyzedAt
  if (!at) return ''
  try {
    return new Date(at).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
})

const errorText = computed(() =>
  humanizeAnalysisError(t, historyItem.value?.errorCode, historyItem.value?.errorMessage),
)

// Backend field-name uncertainty: the v2 schema isn't yet in v1-4.05.json.
// Try the camelCase DTO field first; fall back to the snake_case shape
// straight from the analyzer JSON. Both paths are safe to call on a v1 dto.
function pickField<T>(d: ShortVideoAnalysisDto | null, ...keys: string[]): T | null {
  if (!d) return null
  for (const key of keys) {
    const value = (d as unknown as Record<string, unknown>)[key]
    if (value !== undefined && value !== null) return value as T
  }
  return null
}

const axesValue = computed(() =>
  pickField<unknown>(detail.value ?? null, 'contentAxes', 'content_axes', 'axes'),
)
const viralDriversValue = computed(() =>
  pickField<unknown>(detail.value ?? null, 'viralDrivers', 'viral_drivers'),
)
const viralitySummary = computed(() =>
  pickField<string>(detail.value ?? null, 'viralitySummary', 'viralitySummaryRu', 'virality_summary_ru'),
)
const analyzerVersion = computed(() =>
  pickField<number | string>(detail.value ?? null, 'analyzerVersion', 'analyzer_version'),
)

const hasAxes = computed(() => isAxesShape(axesValue.value))
const hasViral = computed(
  () => isViralDriversArray(viralDriversValue.value) || !!(viralitySummary.value && viralitySummary.value.trim()),
)

// Reel Score chip (v2 only).
const reelScore = computed(() => {
  if (!hasAxes.value) return null
  return computeReelScore(axesValue.value as AxesShape)
})

interface Stat {
  key: string
  icon: typeof Languages
  label: string
  value: string
  tone?: 'brand' | 'success' | 'muted' | 'reel'
  reelLevel?: AxisLevel | null
}

const stats = computed<Stat[]>(() => {
  const d = detail.value
  if (!d) return []
  const out: Stat[] = []

  // Reel Score (v2): show first, it's the headline number.
  if (reelScore.value && reelScore.value.overall !== null) {
    out.push({
      key: 'reel',
      icon: Gauge,
      label: 'Reel Score',
      value: `${reelScore.value.overall} / 100${reelScore.value.capped ? ' (cap)' : ''}`,
      tone: 'reel',
      reelLevel: scoreToLevel(reelScore.value.overall),
    })
  }

  // Language: works for both v1 and v2 transcriptions.
  let lang: string | undefined
  if (isTranscriptionShapeV2(d.transcription)) lang = d.transcription.source_language ?? undefined
  else if (isTranscriptionShape(d.transcription)) lang = d.transcription.language ?? undefined
  if (lang) {
    out.push({ key: 'lang', icon: Languages, label: 'Язык', value: lang.toUpperCase() })
  }

  // Lead magnet: shape-agnostic boolean.
  const funnel = d.funnel
  let leadMagnet: boolean | null | undefined
  if (isFunnelShapeV2(funnel)) leadMagnet = funnel.lead_magnet
  else if (isFunnelShape(funnel)) leadMagnet = funnel.lead_magnet
  if (leadMagnet === true) {
    out.push({ key: 'lm', icon: Gift, label: 'Лид-магнит', value: 'есть', tone: 'success' })
  } else if (leadMagnet === false) {
    out.push({ key: 'lm', icon: Gift, label: 'Лид-магнит', value: 'нет', tone: 'muted' })
  }

  // Step count (only meaningful for v1; v2 is always 3 by spec).
  if (isStructureShape(d.structure)) {
    const count = orderedStructureSteps(d.structure).length
    if (count > 0) {
      out.push({ key: 'steps', icon: ListOrdered, label: 'Шагов', value: String(count) })
    }
  } else if (isStructureShapeV2(d.structure)) {
    out.push({ key: 'steps', icon: ListOrdered, label: 'Блоков', value: String(d.structure.length) })
  }

  // Improvements count: v1 sums grouped lists, v2 is the array length.
  let impCount = 0
  if (isImprovementsShapeV2(d.improvements)) {
    impCount = d.improvements.length
  } else if (isImprovementsShape(d.improvements)) {
    const keys: (keyof ImprovementsShape)[] = [
      'quick_fixes_ru',
      'caption_ideas_ru',
      'hook_improvements_ru',
      'funnel_improvements_ru',
      'structure_improvements_ru',
    ]
    const imp = d.improvements as ImprovementsShape
    impCount = keys.reduce((sum, k) => sum + (imp[k]?.length ?? 0), 0)
  }
  if (impCount > 0) {
    out.push({
      key: 'imp',
      icon: Lightbulb,
      label: 'Идей улучшений',
      value: String(impCount),
      tone: 'brand',
    })
  }

  return out
})

function statClass(s: Stat): string {
  if (s.tone === 'reel' && s.reelLevel) {
    const t = LEVEL_TONES[s.reelLevel]
    return `${t.bg} ${t.text}`
  }
  switch (s.tone) {
    case 'brand': return 'bg-brand/10 text-brand'
    case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'muted': return 'bg-muted text-muted-foreground'
    default: return 'bg-muted/50 text-foreground'
  }
}

async function ensureLoaded() {
  loading.value = true
  notFound.value = false
  try {
    // Mock mode: skip network, render fixture immediately.
    if (mockMode.value) return
    if (!currentWorkspaceId.value) return
    // Always have history before deciding what to do.
    if (analyzer.history.value.length === 0) {
      await analyzer.loadHistory(true)
    }
    const item = store.findHistoryByAnalysisId(currentWorkspaceId.value, props.analysisId)
    if (!item) {
      notFound.value = true
      return
    }
    if (item.status === 'completed') {
      const ok = await analyzer.loadDetail(props.analysisId)
      if (!ok) notFound.value = true
    }
    // For processing / failed we don't need detail; the page renders from history.
  } finally {
    loading.value = false
  }
}

function teardownPoll() {
  if (stopPoll.value) {
    stopPoll.value()
    stopPoll.value = null
  }
}

watch(status, (s) => {
  // Start polling on entry into `processing` and tear down on exit.
  if (s === 'processing') {
    if (!stopPoll.value) stopPoll.value = analyzer.pollIfProcessing(props.analysisId)
  } else {
    teardownPoll()
  }
})

async function retry() {
  if (!historyItem.value) return
  retrying.value = true
  try {
    const result = await analyzer.submit(historyItem.value.originalUrl)
    if (result && result.analysisId !== props.analysisId) {
      router.replace(`/app/video-analyzer/${result.analysisId}`)
    }
  } finally {
    retrying.value = false
  }
}

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
  await ensureLoaded()
})

onUnmounted(() => {
  teardownPoll()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[
        { label: t('videoAnalyzer.breadcrumb'), to: '/app/video-analyzer' },
        { label: t('videoAnalyzer.breadcrumbDetail') },
      ]"
      :show-workspace-selector="true"
    />

    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-4xl space-y-6 p-6">
        <Button
          variant="ghost"
          class="-ml-2 h-8 gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground"
          @click="router.push('/app/video-analyzer')"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          {{ t('videoAnalyzer.backToList') }}
        </Button>

        <div
          v-if="mockMode"
          class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-brand/40 bg-brand/5 px-3 py-2 text-xs text-brand"
        >
          <span class="font-medium">
            {{ t('videoAnalyzer.mockBadge') }}
          </span>
          <Button
            variant="ghost"
            class="h-6 px-2 text-xs text-brand hover:bg-brand/10 hover:text-brand"
            @click="router.push('/app/video-analyzer')"
          >
            {{ t('videoAnalyzer.exitMock') }}
          </Button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="h-4 w-4 animate-spin" />
          {{ t('videoAnalyzer.loadingDetail') }}
        </div>

        <!-- Not found -->
        <div
          v-else-if="notFound"
          class="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center"
        >
          <h2 class="mb-1 text-lg font-semibold">{{ t('videoAnalyzer.notFoundTitle') }}</h2>
          <p class="mb-4 text-sm text-muted-foreground">
            {{ t('videoAnalyzer.notFoundDesc') }}
          </p>
          <Button variant="outline" @click="router.push('/app/video-analyzer')">
            {{ t('videoAnalyzer.returnToList') }}
          </Button>
        </div>

        <template v-else>
          <!-- Meta header (always present) -->
          <header class="space-y-3 rounded-lg border border-border bg-card p-4">
            <div class="flex items-start gap-3">
              <PlatformIcon :platform="platform" size="lg" tinted />
              <div class="min-w-0 flex-1">
                <a
                  :href="originalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline break-all"
                >
                  {{ originalUrl }}
                  <ExternalLink class="h-3 w-3 shrink-0 text-muted-foreground" />
                </a>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <AnalysisStatusBadge v-if="status" :status="status" />
                  <span v-if="analyzedAtHuman">· {{ analyzedAtHuman }}</span>
                  <span
                    v-if="analyzerVersion"
                    class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono"
                  >v{{ analyzerVersion }}</span>
                </div>
              </div>
            </div>
          </header>

          <!-- Processing -->
          <div
            v-if="status === 'processing'"
            class="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 md:p-12 text-center"
          >
            <Loader2 class="h-8 w-8 animate-spin text-brand" />
            <div>
              <p class="font-medium">{{ t('videoAnalyzer.processingTitle') }}</p>
              <p class="text-sm text-muted-foreground">
                {{ t('videoAnalyzer.processingDesc') }}
              </p>
            </div>
          </div>

          <!-- Failed -->
          <div
            v-else-if="status === 'failed'"
            class="space-y-3 rounded-lg border border-rose-300 bg-rose-50 p-6 dark:border-rose-800 dark:bg-rose-950/30"
          >
            <div class="flex items-start gap-3">
              <AlertTriangle class="h-5 w-5 shrink-0 text-rose-500" />
              <div class="flex-1">
                <h3 class="font-semibold text-rose-900 dark:text-rose-100">{{ t('videoAnalyzer.failedTitle') }}</h3>
                <p class="mt-1 text-sm text-rose-800 dark:text-rose-200">{{ errorText }}</p>
              </div>
            </div>
            <Button
              variant="outline"
              :disabled="retrying || analyzer.isSubmitting.value"
              @click="retry"
            >
              <RefreshCw :class="['mr-1 h-4 w-4', retrying && 'animate-spin']" />
              {{ t('videoAnalyzer.retry') }}
            </Button>
          </div>

          <!-- Completed -->
          <template v-else-if="status === 'completed' && detail">
            <div v-if="stats.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="s in stats"
                :key="s.key"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
                  statClass(s),
                ]"
              >
                <component :is="s.icon" class="h-3.5 w-3.5" />
                <span class="text-muted-foreground/80">{{ s.label }}:</span>
                <span>{{ s.value }}</span>
              </span>
            </div>

            <SummarySection :value="detail.summary" />
            <AxesSection
              v-if="hasAxes"
              :value="axesValue"
              :improvements="detail.improvements"
            />
            <ViralDriversSection
              v-if="hasViral"
              :drivers="viralDriversValue"
              :summary="viralitySummary"
            />
            <HooksSection :value="detail.hooks" />
            <StructureSection :value="detail.structure" />
            <FunnelSection :value="detail.funnel" />
            <TagsSection :value="detail.tags" />
            <ImprovementsSection :value="detail.improvements" />
            <TranscriptionSection :value="detail.transcription" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
