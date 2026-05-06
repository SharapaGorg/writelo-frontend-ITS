<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Plus } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { useWorkspaces, RoleBadge, useWorkspacePermissions } from '~/lib-modules/workspaces'
import { usePlans } from '~/lib-modules/plans'

export interface BreadcrumbItem {
  label: string
  to?: string
}

const props = withDefaults(
  defineProps<{
    breadcrumbs: BreadcrumbItem[]
    showWorkspaceSelector?: boolean
  }>(),
  { showWorkspaceSelector: false }
)

const { workspaces, currentWorkspaceId, selectWorkspace } = useWorkspaces()
const { currentRole } = useWorkspacePermissions()
const { isBusinessPlan } = usePlans()

const selectedWorkspaceId = computed<string>({
  get: () => currentWorkspaceId.value ?? '',
  set: (value) => {
    if (value) selectWorkspace(value)
  },
})

const currentWorkspaceName = computed(() => {
  const id = currentWorkspaceId.value
  if (!id) return ''
  return workspaces.value.find(w => w.id === id)?.name ?? ''
})
</script>

<template>
  <header
    class="grid grid-cols-3 items-center h-16 px-6 border-b border-border bg-background"
  >
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-1.5 text-sm min-w-0">
      <template v-for="(item, index) in props.breadcrumbs" :key="index">
        <ChevronRight
          v-if="index > 0"
          class="h-4 w-4 text-muted-foreground shrink-0"
        />
        <NuxtLink
          v-if="item.to && index < props.breadcrumbs.length - 1"
          :to="item.to"
          class="text-muted-foreground hover:text-foreground truncate transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else-if="index < props.breadcrumbs.length - 1"
          class="text-muted-foreground truncate"
        >
          {{ item.label }}
        </span>
        <span
          v-else
          class="text-foreground font-medium truncate"
        >
          {{ item.label }}
        </span>
      </template>
    </nav>

    <!-- Workspace selector (centered) -->
    <div class="flex justify-center">
      <Select
        v-if="props.showWorkspaceSelector && workspaces.length > 0"
        v-model="selectedWorkspaceId"
      >
        <SelectTrigger
          class="w-[260px] bg-card border-border"
        >
          <span class="flex items-center gap-2 min-w-0 w-full">
            <span class="truncate">{{ currentWorkspaceName || 'Выберите бренд' }}</span>
            <RoleBadge v-if="isBusinessPlan" :role="currentRole" class="shrink-0" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="ws in workspaces"
            :key="ws.id"
            :value="ws.id"
            class="cursor-pointer"
          >
            <span class="flex items-center justify-between gap-2 w-full min-w-0">
              <span class="truncate">{{ ws.name }}</span>
              <RoleBadge v-if="isBusinessPlan" :role="ws.role" class="shrink-0" />
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <NuxtLink
        v-else-if="props.showWorkspaceSelector"
        to="/app/workspaces"
        class="inline-flex"
      >
        <Button
          variant="default"
          class="h-9 gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Plus class="h-4 w-4" />
          Создать бренд
        </Button>
      </NuxtLink>
    </div>

    <!-- Right-side actions -->
    <div class="flex items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
