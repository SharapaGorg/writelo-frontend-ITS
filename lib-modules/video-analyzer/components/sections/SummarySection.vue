<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isSummaryShape, isSummaryShapeV2 } from '../../helpers/sectionShape'
import type { SummaryShape, SummaryShapeV2 } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const { t } = useI18n()

interface Row {
  label: string
  text: string | null | undefined
}

const rows = computed<Row[]>(() => {
  if (isSummaryShapeV2(props.value)) {
    const s = props.value as SummaryShapeV2
    return [
      { label: t('videoAnalyzer.summary.rows.topic'), text: s.topic_ru },
      { label: t('videoAnalyzer.summary.rows.essence'), text: s.essence_ru },
      { label: t('videoAnalyzer.summary.rows.screen'), text: s.short_description_ru },
    ].filter(r => r.text && r.text.trim())
  }
  if (isSummaryShape(props.value)) {
    const s = props.value as SummaryShape
    return [
      { label: t('videoAnalyzer.summary.rows.topic'), text: s.video_topic_ru },
      { label: t('videoAnalyzer.summary.rows.essence'), text: s.essence_ru },
      { label: t('videoAnalyzer.summary.rows.description'), text: s.video_description_ru },
    ].filter(r => r.text && r.text.trim())
  }
  return []
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ t('videoAnalyzer.summary.header') }}</h3>

    <div v-if="rows.length" class="space-y-3 rounded-lg border border-border bg-card p-4">
      <div v-for="r in rows" :key="r.label" class="space-y-1">
        <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{{ r.label }}</div>
        <p class="text-sm leading-relaxed text-foreground whitespace-pre-line">{{ r.text }}</p>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
