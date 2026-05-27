<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ExternalLink,
  Loader2,
  Languages,
  Gift,
  Lightbulb,
  ListOrdered,
  Gauge,
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import PlatformIcon from './PlatformIcon.vue'
import SummarySection from './sections/SummarySection.vue'
import HooksSection from './sections/HooksSection.vue'
import StructureSection from './sections/StructureSection.vue'
import FunnelSection from './sections/FunnelSection.vue'
import TagsSection from './sections/TagsSection.vue'
import ImprovementsSection from './sections/ImprovementsSection.vue'
import TranscriptionSection from './sections/TranscriptionSection.vue'
import AxesSection from './sections/AxesSection.vue'
import ViralDriversSection from './sections/ViralDriversSection.vue'
import { useVideoAnalyzerApi } from '../helpers/api'
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
import type {
  ShortVideoAnalysisDto,
  ImprovementsShape,
  AxisLevel,
  AxesShape,
} from '../types'

const props = defineProps<{
  token: string
}>()

const { t } = useI18n()
const api = useVideoAnalyzerApi()

const loading = ref(true)
const notFound = ref(false)
const detail = ref<ShortVideoAnalysisDto | null>(null)

// Same field-tolerant reader as VideoAnalysisDetail: the v2 schema mixes
// camelCase DTO fields with snake_case raw-JSON blocks, so try both forms.
function pickField<T>(d: ShortVideoAnalysisDto | null, ...keys: string[]): T | null {
  if (!d) return null
  for (const key of keys) {
    const value = (d as unknown as Record<string, unknown>)[key]
    if (value !== undefined && value !== null) return value as T
  }
  return null
}

const axesValue = computed(() =>
  pickField<unknown>(detail.value, 'contentAxes', 'content_axes', 'axes'),
)
const viralDriversValue = computed(() =>
  pickField<unknown>(detail.value, 'viralDrivers', 'viral_drivers'),
)
const viralitySummary = computed(() =>
  pickField<string>(detail.value, 'viralitySummary', 'viralitySummaryRu', 'virality_summary_ru'),
)
const analyzerVersion = computed(() =>
  pickField<number | string>(detail.value, 'analyzerVersion', 'analyzer_version'),
)

const hasAxes = computed(() => isAxesShape(axesValue.value))
const hasViral = computed(
  () => isViralDriversArray(viralDriversValue.value) || !!(viralitySummary.value && viralitySummary.value.trim()),
)
const reelScore = computed(() => {
  if (!hasAxes.value) return null
  return computeReelScore(axesValue.value as AxesShape)
})

const platform = computed(() => detail.value?.platform ?? null)
const originalUrl = computed(() => detail.value?.originalUrl ?? '')

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

  let lang: string | undefined
  if (isTranscriptionShapeV2(d.transcription)) lang = d.transcription.source_language ?? undefined
  else if (isTranscriptionShape(d.transcription)) lang = d.transcription.language ?? undefined
  if (lang) {
    out.push({ key: 'lang', icon: Languages, label: 'Язык', value: lang.toUpperCase() })
  }

  const funnel = d.funnel
  let leadMagnet: boolean | null | undefined
  if (isFunnelShapeV2(funnel)) leadMagnet = funnel.lead_magnet
  else if (isFunnelShape(funnel)) leadMagnet = funnel.lead_magnet
  if (leadMagnet === true) {
    out.push({ key: 'lm', icon: Gift, label: 'Лид-магнит', value: 'есть', tone: 'success' })
  } else if (leadMagnet === false) {
    out.push({ key: 'lm', icon: Gift, label: 'Лид-магнит', value: 'нет', tone: 'muted' })
  }

  if (isStructureShape(d.structure)) {
    const count = orderedStructureSteps(d.structure).length
    if (count > 0) {
      out.push({ key: 'steps', icon: ListOrdered, label: 'Шагов', value: String(count) })
    }
  } else if (isStructureShapeV2(d.structure)) {
    out.push({ key: 'steps', icon: ListOrdered, label: 'Блоков', value: String(d.structure.length) })
  }

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
    const tone = LEVEL_TONES[s.reelLevel]
    return `${tone.bg} ${tone.text}`
  }
  switch (s.tone) {
    case 'brand': return 'bg-brand/10 text-brand'
    case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'muted': return 'bg-muted text-muted-foreground'
    default: return 'bg-muted/50 text-foreground'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const dto = await api.getSharedAnalysis(props.token)
    if (!dto) notFound.value = true
    else detail.value = dto
  } catch (e) {
    console.warn('[SharedReel] load failed', e)
    notFound.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="thin-scrollbar h-dvh overflow-y-auto overflow-x-hidden bg-background text-foreground">
    <!-- Minimal public header: brand + CTA to try Writelo. -->
    <header class="border-b border-border bg-card/30">
      <div class="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <NuxtLink to="/" class="flex items-baseline gap-1.5">
          <span class="text-lg font-semibold">Writelo</span>
          <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none text-primary">
            beta
          </span>
        </NuxtLink>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/ai-razbor-reels">{{ t('videoAnalyzer.shared.tryCta') }}</NuxtLink>
        </Button>
      </div>
    </header>

    <main class="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 class="h-4 w-4 animate-spin" />
        {{ t('videoAnalyzer.shared.loading') }}
      </div>

      <!-- 404 / revoked -->
      <div
        v-else-if="notFound"
        class="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center"
      >
        <h1 class="mb-1 text-lg font-semibold">{{ t('videoAnalyzer.shared.unavailableTitle') }}</h1>
        <p class="mb-4 text-sm text-muted-foreground">
          {{ t('videoAnalyzer.shared.unavailableDesc') }}
        </p>
        <Button variant="outline" as-child>
          <NuxtLink to="/ai-razbor-reels">{{ t('videoAnalyzer.shared.runYourOwn') }}</NuxtLink>
        </Button>
      </div>

      <template v-else-if="detail">
        <!-- Meta header -->
        <section class="space-y-3 rounded-lg border border-border bg-card p-4">
          <div class="flex items-start gap-3">
            <PlatformIcon :platform="platform" size="lg" tinted />
            <div class="min-w-0 flex-1">
              <a
                :href="originalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 break-all text-sm font-medium text-foreground hover:underline"
              >
                {{ originalUrl }}
                <ExternalLink class="h-3 w-3 shrink-0 text-muted-foreground" />
              </a>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span v-if="analyzedAtHuman">{{ analyzedAtHuman }}</span>
                <span
                  v-if="analyzerVersion"
                  class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono"
                >v{{ analyzerVersion }}</span>
                <span class="ml-auto text-[11px] uppercase tracking-wide text-muted-foreground/70">
                  {{ t('videoAnalyzer.shared.publicView') }}
                </span>
              </div>
            </div>
          </div>
        </section>

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

        <!-- Soft footer CTA -->
        <section class="rounded-lg border border-dashed border-border bg-card/50 p-5 text-center">
          <p class="text-sm font-medium">{{ t('videoAnalyzer.shared.ctaTitle') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ t('videoAnalyzer.shared.ctaDesc') }}
          </p>
          <Button class="mt-3" as-child>
            <NuxtLink to="/ai-razbor-reels">{{ t('videoAnalyzer.shared.ctaButton') }}</NuxtLink>
          </Button>
        </section>
      </template>
    </main>
  </div>
</template>
