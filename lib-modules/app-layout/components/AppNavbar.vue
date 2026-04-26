<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useWorkspaces } from '~/lib-modules/workspaces'

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

const selectedWorkspaceId = computed<string>({
  get: () => currentWorkspaceId.value ?? '',
  set: (value) => {
    if (value) selectWorkspace(value)
  },
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
          class="w-[220px] bg-card border-border"
        >
          <SelectValue placeholder="Выберите бренд" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="ws in workspaces" :key="ws.id" :value="ws.id">
            {{ ws.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Right-side actions -->
    <div class="flex items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
