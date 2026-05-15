<script setup lang="ts">
import { computed } from 'vue'
import RawJsonViewer from '../RawJsonViewer.vue'
import {
  isStructureShape,
  isStructureShapeV2,
  orderedStructureSteps,
} from '../../helpers/sectionShape'

const props = defineProps<{
  value: unknown
}>()

interface Step {
  key: string
  index: number
  title?: string
  timing?: string
  details?: string
}

const steps = computed<Step[] | null>(() => {
  if (isStructureShapeV2(props.value)) {
    return props.value.map((step, i): Step => ({
      key: `v2-${i}`,
      index: i + 1,
      timing: step.label ?? undefined,
      details: step.step_ru ?? undefined,
    })).filter(s => s.timing || s.details)
  }
  if (isStructureShape(props.value)) {
    return orderedStructureSteps(props.value).map(([key, step], i): Step => ({
      key,
      index: i + 1,
      title: step.title_ru ?? undefined,
      timing: step.timing ?? undefined,
      details: step.details_ru ?? undefined,
    }))
  }
  return null
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Структура</h3>

    <ol v-if="steps && steps.length" class="space-y-2">
      <li
        v-for="s in steps"
        :key="s.key"
        class="flex gap-3 rounded-md border border-border bg-card p-3"
      >
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {{ s.index }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-2">
            <h4 v-if="s.title" class="text-sm font-semibold">{{ s.title }}</h4>
            <span
              v-if="s.timing"
              class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >{{ s.timing }}</span>
          </div>
          <p
            v-if="s.details"
            class="mt-1 text-sm leading-relaxed text-muted-foreground"
          >{{ s.details }}</p>
        </div>
      </li>
    </ol>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
