<script setup lang="ts" generic="T extends string">
import { cn } from '~/lib-modules/utils'

interface Tab<TId extends string> {
  id: TId
  label: string
}

const props = defineProps<{
  tabs: readonly Tab<T>[]
  modelValue: T
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function selectTab(id: T) {
  if (id !== props.modelValue) emit('update:modelValue', id)
}
</script>

<template>
  <div
    role="tablist"
    class="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      :class="cn(
        'flex-1 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
        modelValue === tab.id
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )"
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
