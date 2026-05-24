<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

export interface BreadcrumbItem {
  label: string
  to?: string
}

const props = defineProps<{
  breadcrumbs: BreadcrumbItem[]
}>()
</script>

<template>
  <header
    class="flex items-center h-14 md:h-16 px-3 md:px-6 border-b border-border bg-background gap-2"
  >
    <!-- Mobile: page title (last breadcrumb segment) -->
    <div class="flex-1 min-w-0 md:hidden">
      <h1 class="text-base font-semibold truncate">
        {{ props.breadcrumbs[props.breadcrumbs.length - 1]?.label }}
      </h1>
    </div>

    <!-- Desktop: full breadcrumbs -->
    <nav class="hidden md:flex flex-1 items-center gap-1.5 text-sm min-w-0">
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

    <!-- Right-side actions -->
    <div class="flex items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
