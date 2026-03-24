<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import type { DemoProject } from '../types'

const props = defineProps<{
  projects: DemoProject[]
  selectedProjectId: string
}>()

const emit = defineEmits<{
  'update:selectedProjectId': [value: string]
}>()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Writelo
      </span>
      <span class="text-zinc-500">/ Идеи</span>
    </div>

    <!-- Project selector -->
    <Select
      :model-value="selectedProjectId"
      @update:model-value="emit('update:selectedProjectId', $event)"
    >
      <SelectTrigger class="w-[220px] bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
        <SelectValue placeholder="Выберите проект" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Back to landing -->
    <NuxtLink to="/landing">
      <Button variant="ghost" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
        ← На главную
      </Button>
    </NuxtLink>
  </header>
</template>
