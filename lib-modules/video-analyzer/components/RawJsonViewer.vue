<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  value: unknown
  defaultOpen?: boolean
  label?: string
}>(), {
  defaultOpen: false,
  label: 'Сырой JSON',
})

const open = ref(props.defaultOpen)

const formatted = computed(() => {
  try {
    return JSON.stringify(props.value, null, 2)
  } catch {
    return String(props.value)
  }
})
</script>

<template>
  <div class="rounded-md border border-border bg-muted/40">
    <button
      type="button"
      class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground"
      @click="open = !open"
    >
      <component :is="open ? ChevronDown : ChevronRight" class="h-3.5 w-3.5" />
      {{ label }}
    </button>
    <pre
      v-if="open"
      class="max-h-96 overflow-auto px-3 pb-3 text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono"
    >{{ formatted }}</pre>
  </div>
</template>
