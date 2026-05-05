<script setup lang="ts">
import { computed } from 'vue'
import { Gift, Quote, ArrowRight, X } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isFunnelShape } from '../../helpers/sectionShape'
import { humanizeTrafficDestination } from '../../helpers/humanizeCode'
import type { FunnelShape } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const shape = computed<FunnelShape | null>(() =>
  isFunnelShape(props.value) ? props.value : null,
)

const trafficLabel = computed(() => {
  const code = shape.value?.traffic_destination
  return code ? humanizeTrafficDestination(code) : ''
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Воронка</h3>

    <div v-if="shape" class="space-y-2 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="shape.lead_magnet === true"
          class="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
        >
          <Gift class="h-3 w-3" />
          Есть лид-магнит
        </span>
        <span
          v-else-if="shape.lead_magnet === false"
          class="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          <X class="h-3 w-3" />
          Без лид-магнита
        </span>

        <span
          v-if="trafficLabel"
          class="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"
        >
          <ArrowRight class="h-3 w-3" />
          {{ trafficLabel }}
        </span>
      </div>

      <div v-if="shape.cta_voice_visual_ru" class="flex gap-2 rounded-md bg-muted/40 p-3">
        <Quote class="h-4 w-4 shrink-0 text-muted-foreground" />
        <p class="text-sm leading-relaxed italic">{{ shape.cta_voice_visual_ru }}</p>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
