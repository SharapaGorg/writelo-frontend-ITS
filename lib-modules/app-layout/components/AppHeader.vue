<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, User } from 'lucide-vue-next'
import { cn } from '~/lib-modules/utils'
import { Button } from '~/components/ui/button'
import { useProjects } from '~/lib-modules/projects'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const { projects, selectedProjectId, selectProject } = useProjects()

const selectedProject = computed(() => {
  if (!selectedProjectId.value) return null
  return projects.value.find(p => p.id === selectedProjectId.value) || null
})

const displayProjectName = computed(() => {
  return selectedProject.value?.title || 'Выбрать проект'
})

function handleProjectSelect(projectId: string | null) {
  selectProject(projectId)
}
</script>

<template>
  <header
    class="flex items-center justify-between h-14 px-4 border-b border-border bg-background"
  >
    <!-- Project Selector -->
    <div class="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="gap-2">
            <span class="max-w-[200px] truncate">{{ displayProjectName }}</span>
            <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-56">
          <DropdownMenuItem
            :class="cn(!selectedProjectId && 'bg-accent')"
            @click="handleProjectSelect(null)"
          >
            Все проекты
          </DropdownMenuItem>
          <DropdownMenuItem
            v-for="project in projects"
            :key="project.id"
            :class="cn(selectedProjectId === project.id && 'bg-accent')"
            @click="handleProjectSelect(project.id)"
          >
            {{ project.title }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Right Section: Subscription + Profile -->
    <div class="flex items-center gap-3">
      <!-- Subscription Badge placeholder -->
      <div class="hidden sm:flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        Pro
      </div>

      <!-- Profile Button -->
      <NuxtLink to="/app/profile">
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <User class="h-5 w-5" />
        </Button>
      </NuxtLink>
    </div>
  </header>
</template>
