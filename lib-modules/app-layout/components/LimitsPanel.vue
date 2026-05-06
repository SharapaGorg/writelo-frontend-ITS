<script setup lang="ts">
import { computed, watch } from 'vue'
import { Sparkles, Globe } from 'lucide-vue-next'
import { useWorkspaceContext, useWorkspaceLimits } from '~/lib-modules/workspaces'
import { useUserController } from '~/composables/user'
import { cn } from '~/lib-modules/utils'
import { useAppLayout } from '../composables/useAppLayout'

const { isCollapsed } = useAppLayout()
const { currentWorkspaceId } = useWorkspaceContext()
const userController = useUserController()
const isAuthenticated = computed(() => userController.isAuthenticated())

const wl = useWorkspaceLimits()

// Re-load whenever a workspace becomes available. Mounting alone isn't enough
// because the sidebar mounts before workspace context resolves.
watch(
  [currentWorkspaceId, isAuthenticated],
  ([wid, auth]) => { if (auth && wid) wl.load() },
  { immediate: true },
)

function asNum(v: number | string | undefined | null): number {
  return wl.asNumber(v)
}

interface Row {
  key: 'model' | 'search'
  label: string
  icon: typeof Sparkles
  bar: string
  text: string
  left: number
  total: number
}

const rows = computed<Row[]>(() => [
  {
    key: 'model',
    label: 'Запросы к модели',
    icon: Sparkles,
    bar: 'bg-brand',
    text: 'text-brand',
    left: asNum(wl.modelRequests.value?.left),
    total: asNum(wl.modelRequests.value?.total),
  },
  {
    key: 'search',
    label: 'Поиск в интернете',
    icon: Globe,
    bar: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    left: asNum(wl.searchRequests.value?.left),
    total: asNum(wl.searchRequests.value?.total),
  },
])

function leftPercent(left: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((left / total) * 100)))
}
</script>

<template>
  <div
    v-if="isAuthenticated"
    class="px-2 pt-2 pb-1 border-t border-border"
  >
    <!-- Loaded -->
    <ul v-if="wl.isLoaded.value" class="flex flex-col gap-1.5">
      <li
        v-for="row in rows"
        :key="row.key"
        :title="`${row.label}: ${row.left}/${row.total}`"
        :class="cn(
          'rounded-md',
          isCollapsed ? 'flex items-center justify-center p-1.5' : 'flex flex-col gap-1 px-2 py-1.5'
        )"
      >
        <template v-if="isCollapsed">
          <div class="relative flex flex-col items-center gap-1">
            <component :is="row.icon" :class="cn('h-4 w-4', row.text)" />
            <div class="h-1 w-6 overflow-hidden rounded-full bg-muted">
              <div
                :class="cn('h-full rounded-full transition-all duration-300', row.bar, row.total <= 0 && 'opacity-30')"
                :style="{ width: row.total > 0 ? `${leftPercent(row.left, row.total)}%` : '0%' }"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-between gap-2 text-[11px]">
            <span class="flex items-center gap-1.5 min-w-0">
              <component :is="row.icon" :class="cn('h-3.5 w-3.5 shrink-0', row.text)" />
              <span class="truncate text-muted-foreground">{{ row.label }}</span>
            </span>
            <span :class="cn('shrink-0 tabular-nums', row.text)">
              <template v-if="row.total > 0">{{ row.left }}/{{ row.total }}</template>
              <template v-else>—</template>
            </span>
          </div>
          <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              :class="cn('h-full rounded-full transition-all duration-300', row.bar, row.total <= 0 && 'opacity-30')"
              :style="{ width: row.total > 0 ? `${leftPercent(row.left, row.total)}%` : '0%' }"
            />
          </div>
        </template>
      </li>
    </ul>

    <!-- Skeleton — same row geometry so height doesn't jump when data arrives. -->
    <ul v-else class="flex flex-col gap-1.5">
      <li
        v-for="n in 2"
        :key="n"
        :class="cn(
          'rounded-md',
          isCollapsed ? 'flex items-center justify-center p-1.5' : 'flex flex-col gap-1 px-2 py-1.5'
        )"
      >
        <template v-if="isCollapsed">
          <div class="flex flex-col items-center gap-1">
            <span class="h-4 w-4 rounded-sm bg-muted animate-pulse" />
            <span class="h-1 w-6 rounded-full bg-muted animate-pulse" />
          </div>
        </template>
        <template v-else>
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 min-w-0">
              <span class="h-3.5 w-3.5 shrink-0 rounded-sm bg-muted animate-pulse" />
              <span class="h-3 w-24 rounded bg-muted animate-pulse" />
            </span>
            <span class="h-3 w-10 rounded bg-muted animate-pulse" />
          </div>
          <div class="h-1 w-full rounded-full bg-muted animate-pulse" />
        </template>
      </li>
    </ul>
  </div>
</template>
