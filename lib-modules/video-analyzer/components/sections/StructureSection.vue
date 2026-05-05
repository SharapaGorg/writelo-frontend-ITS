<script setup lang="ts">
import { computed } from 'vue'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isStructureShape, orderedStructureSteps } from '../../helpers/sectionShape'

const props = defineProps<{
  value: unknown
}>()

const steps = computed(() =>
  isStructureShape(props.value) ? orderedStructureSteps(props.value) : null,
)
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Структура</h3>

    <ol v-if="steps && steps.length" class="space-y-2">
      <li
        v-for="([key, step], i) in steps"
        :key="key"
        class="flex gap-3 rounded-md border border-border bg-card p-3"
      >
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {{ i + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-2">
            <h4 v-if="step.title_ru" class="text-sm font-semibold">{{ step.title_ru }}</h4>
            <span
              v-if="step.timing"
              class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >{{ step.timing }}</span>
          </div>
          <p
            v-if="step.details_ru"
            class="mt-1 text-sm leading-relaxed text-muted-foreground"
          >{{ step.details_ru }}</p>
        </div>
      </li>
    </ol>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
