<script setup lang="ts">
import { computed } from 'vue'
import { Gift, Quote, ArrowRight, X, Mic, Eye } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isFunnelShape, isFunnelShapeV2 } from '../../helpers/sectionShape'
import { humanizeTrafficDestination } from '../../helpers/humanizeCode'
import type { FunnelShape, FunnelShapeV2 } from '../../types'

const props = defineProps<{
  value: unknown
}>()

interface CtaBlock {
  key: string
  label: string
  icon: typeof Quote
  text: string
}

interface Model {
  leadMagnet: boolean | null | undefined
  trafficCode: string | null | undefined
  ctaBlocks: CtaBlock[]
}

const model = computed<Model | null>(() => {
  if (isFunnelShapeV2(props.value)) {
    const s = props.value as FunnelShapeV2
    const ctaBlocks: CtaBlock[] = []
    if (s.cta_voice_ru && s.cta_voice_ru.trim()) {
      ctaBlocks.push({ key: 'voice', label: 'Голосовой CTA', icon: Mic, text: s.cta_voice_ru })
    }
    if (s.cta_visual_ru && s.cta_visual_ru.trim()) {
      ctaBlocks.push({ key: 'visual', label: 'Визуальный CTA', icon: Eye, text: s.cta_visual_ru })
    }
    return {
      leadMagnet: s.lead_magnet,
      trafficCode: s.traffic_destination,
      ctaBlocks,
    }
  }
  if (isFunnelShape(props.value)) {
    const s = props.value as FunnelShape
    const ctaBlocks: CtaBlock[] = []
    if (s.cta_voice_visual_ru && s.cta_voice_visual_ru.trim()) {
      ctaBlocks.push({ key: 'combined', label: 'CTA', icon: Quote, text: s.cta_voice_visual_ru })
    }
    return {
      leadMagnet: s.lead_magnet,
      trafficCode: s.traffic_destination,
      ctaBlocks,
    }
  }
  return null
})

const trafficLabel = computed(() => {
  const code = model.value?.trafficCode
  return code ? humanizeTrafficDestination(code) : ''
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Воронка</h3>

    <div v-if="model" class="space-y-2 rounded-lg border border-border bg-card p-4">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="model.leadMagnet === true"
          class="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
        >
          <Gift class="h-3 w-3" />
          Есть лид-магнит
        </span>
        <span
          v-else-if="model.leadMagnet === false"
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

      <div
        v-for="block in model.ctaBlocks"
        :key="block.key"
        class="flex gap-2 rounded-md bg-muted/40 p-3"
      >
        <component :is="block.icon" class="h-4 w-4 shrink-0 text-muted-foreground" />
        <div class="space-y-0.5">
          <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{{ block.label }}</div>
          <p class="text-sm leading-relaxed italic">{{ block.text }}</p>
        </div>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
