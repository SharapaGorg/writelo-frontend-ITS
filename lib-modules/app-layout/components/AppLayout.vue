<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import MobileBottomTabBar from './MobileBottomTabBar.vue'
import { useUserController } from '~/composables/user'
import { useWorkspaces, useWorkspaceContext } from '~/lib-modules/workspaces'
import { useContentProjectStore } from '~/lib-modules/content-calendar'
import { FeedbackForm } from '~/lib-modules/feedback'

// Single app-shell bootstrap covering every /app/* entry:
//   - flip out of demo mode immediately (sync, before child setup) so pages that read
//     contentProjectStore in their own setup (e.g. /app/editor pulling currentProjectAccounts)
//     never see landing-showcase demo data.
//   - fetch workspaces so sidebar widgets (LimitsPanel) and any consumer of currentWorkspaceId
//     work regardless of which page triggered the entry.
//   - explicitly ensure project data is loaded — the store's watchers race with the isDemo flip
//     and can no-op silently.
const userController = useUserController()
const projectStore = useContentProjectStore()
const { initialize, workspaces } = useWorkspaces()
const { currentWorkspaceId } = useWorkspaceContext()

const isAuthenticated = computed(() => userController.isAuthenticated())

if (userController.isAuthenticated()) {
  projectStore.disableDemoMode()
}

async function bootstrap() {
  if (!userController.isAuthenticated()) return
  projectStore.disableDemoMode()
  if (workspaces.value.length === 0 && !currentWorkspaceId.value) {
    await initialize()
  }
  projectStore.ensureCurrentProjectData()
}

onMounted(bootstrap)
</script>

<template>
  <div class="app-shell flex h-dvh w-screen overflow-hidden bg-background">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 overflow-auto bg-background">
        <slot />
      </main>
      <MobileBottomTabBar />
    </div>

    <div
      v-if="isAuthenticated"
      class="hidden md:block fixed bottom-4 right-4 z-40"
    >
      <FeedbackForm source="site" compact collapsible />
    </div>
  </div>
</template>
