<script setup lang="ts">
import { computed } from 'vue'
import { Zap, FileText, Anchor, Filter, ListOrdered } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isImprovementsShape } from '../../helpers/sectionShape'
import type { ImprovementsShape } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const shape = computed<ImprovementsShape | null>(() =>
  isImprovementsShape(props.value) ? props.value : null,
)

interface Group {
  key: keyof ImprovementsShape
  label: string
  icon: typeof Zap
  items: string[]
}

const groups = computed<Group[]>(() => {
  const s = shape.value
  if (!s) return []
  const all: Group[] = [
    { key: 'quick_fixes_ru', label: 'Быстрые фиксы', icon: Zap, items: s.quick_fixes_ru ?? [] },
    { key: 'hook_improvements_ru', label: 'Хуки', icon: Anchor, items: s.hook_improvements_ru ?? [] },
    { key: 'structure_improvements_ru', label: 'Структура', icon: ListOrdered, items: s.structure_improvements_ru ?? [] },
    { key: 'funnel_improvements_ru', label: 'Воронка', icon: Filter, items: s.funnel_improvements_ru ?? [] },
    { key: 'caption_ideas_ru', label: 'Идеи описаний', icon: FileText, items: s.caption_ideas_ru ?? [] },
  ]
  return all.filter(g => g.items.length > 0)
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Что улучшить</h3>

    <div v-if="groups.length" class="space-y-3">
      <div
        v-for="g in groups"
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

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
