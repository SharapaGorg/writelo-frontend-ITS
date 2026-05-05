<script setup lang="ts">
import { computed } from 'vue'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isTagsShape } from '../../helpers/sectionShape'
import { humanizeNiche, humanizeFormat } from '../../helpers/humanizeCode'
import type { TagsShape } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const shape = computed<TagsShape | null>(() =>
  isTagsShape(props.value) ? props.value : null,
)

const niches = computed(() =>
  (shape.value?.niches ?? []).map(code => ({ code, label: humanizeNiche(code) })),
)
const formats = computed(() =>
  (shape.value?.formats ?? []).map(code => ({ code, label: humanizeFormat(code) })),
)
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Теги</h3>

    <div v-if="shape" class="space-y-3">
      <div v-if="niches.length" class="space-y-1.5">
        <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Ниши</div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in niches"
            :key="t.code"
            class="rounded-md border border-border bg-card px-2 py-0.5 text-xs"
          >{{ t.label }}</span>
        </div>
      </div>

      <div v-if="formats.length" class="space-y-1.5">
        <div class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Форматы</div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in formats"
            :key="t.code"
            class="rounded-md border border-border bg-card px-2 py-0.5 text-xs"
          >{{ t.label }}</span>
        </div>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
