<script setup lang="ts">
import { computed } from 'vue'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isSummaryShape, isSummaryShapeV2 } from '../../helpers/sectionShape'
import type { SummaryShape, SummaryShapeV2 } from '../../types'

const props = defineProps<{
  value: unknown
}>()

interface Row {
  label: string
  text: string | null | undefined
}

const rows = computed<Row[]>(() => {
  if (isSummaryShapeV2(props.value)) {
    const s = props.value as SummaryShapeV2
    return [
      { label: 'Тема', text: s.topic_ru },
      { label: 'Суть', text: s.essence_ru },
      { label: 'Что на экране', text: s.short_description_ru },
    ].filter(r => r.text && r.text.trim())
  }
  if (isSummaryShape(props.value)) {
    const s = props.value as SummaryShape
    return [
      { label: 'Тема', text: s.video_topic_ru },
      { label: 'Суть', text: s.essence_ru },
      { label: 'Описание', text: s.video_description_ru },
    ].filter(r => r.text && r.text.trim())
  }
  return []
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Краткое описание</h3>

    <div v-if="rows.length" class="space-y-3 rounded-lg border border-border bg-card p-4">
      <div v-for="r in rows" :key="r.label" class="space-y-1">
        <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{{ r.label }}</div>
        <p class="text-sm leading-relaxed text-foreground whitespace-pre-line">{{ r.text }}</p>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
