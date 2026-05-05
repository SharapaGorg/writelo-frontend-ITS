<script setup lang="ts">
import { computed } from 'vue'
import { Type, MessageCircle, Eye } from 'lucide-vue-next'
import RawJsonViewer from '../RawJsonViewer.vue'
import { isHooksShape } from '../../helpers/sectionShape'
import type { HooksShape } from '../../types'

const props = defineProps<{
  value: unknown
}>()

const shape = computed<HooksShape | null>(() =>
  isHooksShape(props.value) ? props.value : null,
)

const cards = computed(() => {
  const s = shape.value
  if (!s) return []
  return [
    { key: 'text', label: 'Текстовый хук', icon: Type, text: s.text_hook_ru },
    { key: 'phrase', label: 'Произнесённая фраза', icon: MessageCircle, text: s.hook_phrase_ru },
    { key: 'visual', label: 'Визуальный хук', icon: Eye, text: s.visual_hook_ru },
  ].filter(c => c.text && c.text.trim())
})
</script>

<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Хуки</h3>

    <div v-if="cards.length" class="grid grid-cols-1 gap-2 md:grid-cols-3">
      <div
        v-for="c in cards"
        :key="c.key"
        class="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
      >
        <div class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <component :is="c.icon" class="h-3.5 w-3.5" />
          {{ c.label }}
        </div>
        <p class="text-sm leading-relaxed">{{ c.text }}</p>
      </div>
    </div>

    <RawJsonViewer v-else :value="value" />
  </section>
</template>
