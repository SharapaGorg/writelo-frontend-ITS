<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2 } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { cn } from '~/lib-modules/utils'
import { isTranscriptionShape } from '../../helpers/sectionShape'
import type { TranscriptionShape } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const shape = computed<TranscriptionShape | null>(() =>
  isTranscriptionShape(props.value) ? props.value : null,
)

interface Tab {
  key: 'ru' | 'original' | 'on_screen'
  label: string
  text: string
}

const tabs = computed<Tab[]>(() => {
  const s = shape.value
  if (!s) return []
  const all: Tab[] = [
    { key: 'ru', label: 'На русском', text: s.text_ru ?? '' },
    { key: 'original', label: 'Оригинал', text: s.text_original ?? '' },
    { key: 'on_screen', label: 'На экране', text: s.on_screen_text ?? '' },
  ]
  return all.filter(t => t.text.trim())
})

const activeKey = ref<Tab['key']>('ru')
const activeTab = computed(() => tabs.value.find(t => t.key === activeKey.value) ?? tabs.value[0])

// "null" literal from the backend means "no unclear parts".
const hasUnclear = computed(() => {
  const u = shape.value?.unclear_parts
  if (!u) return false
  const norm = String(u).trim().toLowerCase()
  return norm !== '' && norm !== 'null'
})
</script>

<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Транскрипция</h3>
      <div class="flex items-center gap-2 text-xs">
        <span v-if="shape?.language" class="text-muted-foreground">
          Язык: <span class="font-medium text-foreground uppercase">{{ shape.language }}</span>
        </span>
        <span
          v-if="shape && !hasUnclear"
          class="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
        >
          <CheckCircle2 class="h-3 w-3" />
          Без неясных мест
        </span>
      </div>
    </div>

    <template v-if="tabs.length">
      <div v-if="tabs.length > 1" class="inline-flex rounded-md border border-border bg-card p-0.5">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :class="cn(
            'rounded px-2.5 py-1 text-xs transition-colors',
            activeKey === t.key
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )"
          @click="activeKey = t.key"
        >{{ t.label }}</button>
      </div>

      <p
        v-if="activeTab"
        class="whitespace-pre-line rounded-lg border border-border bg-card p-4 text-sm leading-relaxed"
      >{{ activeTab.text }}</p>

      <p v-if="hasUnclear" class="text-xs text-muted-foreground">
        <span class="font-medium">Неясные места:</span> {{ shape?.unclear_parts }}
      </p>
    </template>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
