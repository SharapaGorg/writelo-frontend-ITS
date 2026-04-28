<script setup lang="ts">
import { computed } from 'vue'
import { Crown, ShieldCheck, PencilLine, Eye } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import type { WorkspaceRole } from '../types'

const props = defineProps<{
  role: WorkspaceRole | null | undefined
  class?: string
}>()

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Владелец',
  admin: 'Админ',
  editor: 'Редактор',
  viewer: 'Зритель',
}

const ROLE_ICONS = {
  owner: Crown,
  admin: ShieldCheck,
  editor: PencilLine,
  viewer: Eye,
} as const

const meta = computed(() => {
  if (!props.role) return null
  return {
    label: ROLE_LABELS[props.role],
    icon: ROLE_ICONS[props.role],
  }
})
</script>

<template>
  <span
    v-if="meta"
    :class="cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-border text-[11px] leading-none text-muted-foreground',
      props.class,
    )"
  >
    <component :is="meta.icon" class="h-3 w-3" />
    {{ meta.label }}
  </span>
</template>
