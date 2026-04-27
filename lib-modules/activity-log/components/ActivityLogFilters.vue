<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import DateTimePicker from '~/components/molecules/DateTimePicker.vue'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useWorkspaceMembersApi } from '~/lib-modules/team'
import type { WorkspaceMemberDto } from '~/lib-modules/team'
import type { ActivityLogFilters } from '../types'

const props = defineProps<{ filters: ActivityLogFilters }>()
const emit = defineEmits<{
  (e: 'change', f: Partial<ActivityLogFilters>): void
  (e: 'reset'): void
}>()

const { currentWorkspaceId, requireWorkspaceId } = useWorkspaceContext()
const membersApi = useWorkspaceMembersApi()
const members = ref<WorkspaceMemberDto[]>([])

watchEffect(async () => {
  if (!currentWorkspaceId.value) {
    members.value = []
    return
  }
  try {
    const r = await membersApi.getMembers(requireWorkspaceId())
    members.value = r.items ?? []
  } catch {
    members.value = []
  }
})

const isActive = computed(() =>
  Boolean(props.filters.userId || props.filters.from || props.filters.to),
)

function onUser(v: string) {
  emit('change', { userId: v === '__all__' ? undefined : v })
}

// DateTimePicker emits 'YYYY-MM-DDTHH:MM' (без timezone) — нормализуем в ISO UTC.
function pickerToIso(v: string | null): string | undefined {
  if (!v) return undefined
  const sec = v.length === 16 ? `${v}:00` : v
  return new Date(sec).toISOString()
}

function onFrom(v: string | null) {
  emit('change', { from: pickerToIso(v) })
}

function onTo(v: string | null) {
  emit('change', { to: pickerToIso(v) })
}

// Обратная конвертация ISO -> формат пикера 'YYYY-MM-DDTHH:MM' (локальное).
function isoToPicker(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromValue = computed(() => isoToPicker(props.filters.from))
const toValue = computed(() => isoToPicker(props.filters.to))
</script>

<template>
  <div class="flex items-end gap-3 flex-wrap">
    <div class="space-y-1 min-w-[200px]">
      <Label class="text-xs">Участник</Label>
      <Select :model-value="filters.userId ?? '__all__'" @update:model-value="onUser">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Все</SelectItem>
          <SelectItem v-for="m in members" :key="m.userId" :value="m.userId">
            {{ m.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="space-y-1 min-w-[180px]">
      <Label class="text-xs">С</Label>
      <DateTimePicker
        :model-value="fromValue"
        :show-presets="false"
        placeholder="Не задано"
        @update:model-value="onFrom"
      />
    </div>
    <div class="space-y-1 min-w-[180px]">
      <Label class="text-xs">По</Label>
      <DateTimePicker
        :model-value="toValue"
        :show-presets="false"
        placeholder="Не задано"
        @update:model-value="onTo"
      />
    </div>
    <Button v-if="isActive" variant="ghost" size="sm" @click="emit('reset')">
      Сбросить
    </Button>
  </div>
</template>
