<script setup lang="ts">
import { computed } from 'vue'
import {
  Zap, FileText, Anchor, Filter, ListOrdered,
  AlertTriangle, TrendingUp, Sparkles,
} from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { cn } from '~/lib-modules/utils'
import {
  isImprovementsShape,
  isImprovementsShapeV2,
  sortedImprovementsV2,
} from '../../helpers/sectionShape'
import { AXIS_LABELS, LEVEL_TONES, scoreToLevel } from '../../helpers/aggregation'
import type {
  ImprovementsShape,
  ImprovementItemV2,
  ImprovementPriority,
  AxisKey,
  AxisLevel,
} from '../../types'

const props = defineProps<{
  value: unknown
}>()

// -------- v2 (flat, axis-tied) --------

const v2Items = computed<ImprovementItemV2[] | null>(() =>
  isImprovementsShapeV2(props.value) ? sortedImprovementsV2(props.value) : null,
)

const PRIORITY_META: Record<ImprovementPriority, {
  label: string
  icon: typeof AlertTriangle
  chip: string
  border: string
}> = {
  high: {
    label: 'Высокий приоритет',
    icon: AlertTriangle,
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    border: 'border-rose-300/70 dark:border-rose-900/60',
  },
  medium: {
    label: 'Средний приоритет',
    icon: TrendingUp,
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    border: 'border-amber-300/70 dark:border-amber-900/60',
  },
  low: {
    label: 'Низкий приоритет',
    icon: Sparkles,
    chip: 'bg-muted text-muted-foreground',
    border: 'border-border',
  },
}

function axisLabel(key: string): string {
  return AXIS_LABELS[key as AxisKey] ?? key
}

function levelTone(item: ImprovementItemV2) {
  const level = (item.current_level ?? scoreToLevel(item.current_score)) as AxisLevel | null
  if (!level) return null
  return LEVEL_TONES[level]
}

function priorityMeta(p: string) {
  return PRIORITY_META[p as ImprovementPriority] ?? PRIORITY_META.low
}

// -------- v1 (grouped lists) --------

interface V1Group {
  key: keyof ImprovementsShape
  label: string
  icon: typeof Zap
  items: string[]
}

const v1Groups = computed<V1Group[] | null>(() => {
  if (v2Items.value) return null
  if (!isImprovementsShape(props.value)) return null
  const s = props.value as ImprovementsShape
  const groups: V1Group[] = [
    { key: 'quick_fixes_ru', label: 'Быстрые фиксы', icon: Zap, items: s.quick_fixes_ru ?? [] },
    { key: 'hook_improvements_ru', label: 'Хуки', icon: Anchor, items: s.hook_improvements_ru ?? [] },
    { key: 'structure_improvements_ru', label: 'Структура', icon: ListOrdered, items: s.structure_improvements_ru ?? [] },
    { key: 'funnel_improvements_ru', label: 'Воронка', icon: Filter, items: s.funnel_improvements_ru ?? [] },
    { key: 'caption_ideas_ru', label: 'Идеи описаний', icon: FileText, items: s.caption_ideas_ru ?? [] },
  ]
  return groups.filter(g => g.items.length > 0)
})

const isEmpty = computed(() =>
  !v1Groups.value?.length && !v2Items.value?.length,
)

// Special-case: v2 may be a recognised empty array — render a friendly note
// instead of falling through to RawJsonViewer.
const v2Empty = computed(() => Array.isArray(v2Items.value) && v2Items.value.length === 0)
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Что улучшить</h3>

    <!-- v2: flat list, sorted high → low. -->
    <ul v-if="v2Items && v2Items.length" class="space-y-2">
      <li
        v-for="(item, i) in v2Items"
        :key="i"
        :class="cn(
          'space-y-2 rounded-lg border bg-card p-4',
          priorityMeta(item.priority).border,
        )"
      >
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span
            :class="cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium',
              priorityMeta(item.priority).chip,
            )"
          >
            <component :is="priorityMeta(item.priority).icon" class="h-3 w-3" />
            {{ priorityMeta(item.priority).label }}
          </span>
          <span class="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 font-medium">
            {{ axisLabel(item.axis) }}
          </span>
          <span
            v-if="item.current_score != null && levelTone(item)"
            :class="cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono',
              levelTone(item)!.bg,
              levelTone(item)!.text,
            )"
          >{{ item.current_score }} / 100</span>
        </div>

        <p class="text-sm leading-relaxed">{{ item.action_ru }}</p>

        <p v-if="item.expected_gain_ru" class="text-xs text-muted-foreground">
          <TrendingUp class="mr-1 inline h-3 w-3 align-[-1px]" />
          {{ item.expected_gain_ru }}
        </p>
      </li>
    </ul>

    <p
      v-else-if="v2Empty"
      class="rounded-lg border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground"
    >
      Анализатор не выдал точечных правок — ролик уже сбалансирован по большинству осей.
    </p>

    <!-- v1: grouped lists. -->
    <div v-else-if="v1Groups && v1Groups.length" class="space-y-3">
      <div
        v-for="g in v1Groups"
        :key="g.key"
        class="space-y-2 rounded-lg border border-border bg-card p-4"
      >
        <div class="flex items-center gap-2 text-sm font-semibold">
          <component :is="g.icon" class="h-4 w-4 text-brand" />
          {{ g.label }}
          <span class="text-xs font-normal text-muted-foreground">{{ g.items.length }}</span>
        </div>
        <ul class="space-y-1.5 pl-1">
          <li
            v-for="(text, i) in g.items"
            :key="i"
            class="flex gap-2 text-sm leading-relaxed"
          >
            <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            <span class="flex-1">{{ text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <RawJsonViewer v-else-if="isEmpty" :value="value" />
  </section>
</template>
