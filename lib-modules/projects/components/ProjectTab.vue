<template>
  <ContextMenu @update:open="handleContextMenuOpen">
    <ContextMenuTrigger as-child>
      <Button
          id="project-tab"
          variant="ghost"
          size="sm"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium transition-all relative select-none"
          :class="[
          isSelected
            ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50'
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50',
          isInAssignmentMode && 'assignment-mode-tab border-2 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer shadow-lg hover:shadow-xl'
        ]"
          @click="$emit('click')"
      >
        {{ project.title }}
      </Button>
    </ContextMenuTrigger>

    <ProjectContextMenu
        @rename="$emit('rename')"
        @delete="$emit('delete')"
        @edit-instructions="editInstructions"
    />
  </ContextMenu>
</template>

<script setup lang="ts">
import {Button} from '~/components/ui/button'
import {ContextMenu, ContextMenuTrigger} from '~/components/ui/context-menu'
import type {Project, StoreProject} from '../types'
import ProjectContextMenu from "./ProjectContextMenu.vue";
import {useOnboarding} from "~/lib-modules/onboarding";

const props = defineProps<{
  project: StoreProject
  isSelected: boolean
  isInAssignmentMode: boolean
}>()

const emit = defineEmits<{
  click: []
  rename: []
  delete: [],
  editInstructions: []
}>()

const $onboarding = useOnboarding();
let onboardingHandler: NodeJS.Timeout | null = null;

const editInstructions = () => {
  emit('editInstructions');
  setTimeout(() => {
    if (onboardingHandler) {
      clearTimeout(onboardingHandler);
      onboardingHandler = null;
    }
  })
}

const handleContextMenuOpen = (isOpen: boolean) => {
  if (isOpen) {
    // контекстное меню открыто
    if ($onboarding.isActive.value) {
      setTimeout(() => {
        $onboarding.next();
      })
    }
  } else {
    onboardingHandler = setTimeout(() => {
      $onboarding.finish()
    }, 100)
  }
}
</script>

<style scoped>
.assignment-mode-tab {
  animation: floatAndGlow 2s ease-in-out infinite;
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes floatAndGlow {
  0%, 100% {
    transform: translateY(0px);
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1);
  }
  50% {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px -2px rgba(59, 130, 246, 0.4), 0 4px 8px -2px rgba(59, 130, 246, 0.2);
  }
}

.assignment-mode-tab:hover {
  animation-play-state: paused;
  transform: translateY(-2px) scale(1.05);
}
</style>
