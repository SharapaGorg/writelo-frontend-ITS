<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityLogItemDto } from '../types'
import { mapAction, entityCaption } from '../helpers/formatting'

const props = defineProps<{ item: ActivityLogItemDto }>()

const actorName = computed(() => props.item.actor?.name ?? 'Система')

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-3">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
      {{ initials(actorName) }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="text-sm">
        <span class="font-medium">{{ actorName }}</span>
        <span class="text-muted-foreground"> · {{ mapAction(item) }}</span>
      </div>
      <div class="text-xs text-muted-foreground">
        <template v-if="entityCaption(item)">
          {{ entityCaption(item) }} ·
        </template>
        {{ timeOf(item.createdAt) }}
      </div>
    </div>
  </div>
</template>
