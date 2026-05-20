<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AppSidebar from './AppSidebar.vue'
import MobileBottomTabBar from './MobileBottomTabBar.vue'
import { useUserController } from '~/composables/user'
import { useWorkspaces, useWorkspaceContext } from '~/lib-modules/workspaces'

// /me does not return primaryWorkspaceId in the current API — workspace context only gets bootstrapped
// when a page calls `useWorkspaces().initialize()` itself. That left sidebar widgets (LimitsPanel)
// stuck on skeleton whenever the landing page was the first hop into pages that don't fetch workspaces
// themselves (trends, profile, plans, settings, workspaces). Doing the fetch here covers every entry
// point. Calendar still calls `ensureCurrentProjectData()` in its own onMounted because watchers in
// contentProjectStore race with isDemo flips and can no-op silently.
const userController = useUserController()
const { initialize, workspaces } = useWorkspaces()
const { currentWorkspaceId } = useWorkspaceContext()

function bootstrapWorkspaces() {
  if (!userController.isAuthenticated()) return
  if (workspaces.value.length > 0 || currentWorkspaceId.value) return
  initialize()
}

onMounted(bootstrapWorkspaces)

// Auth may finish after mount (post-login redirect into /app/*); re-run once token appears.
watch(
  () => userController.isAuthenticated(),
  (auth) => { if (auth) bootstrapWorkspaces() },
)
</script>

<template>
  <div class="app-shell flex h-screen w-screen overflow-hidden bg-background">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 overflow-auto bg-background pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <slot />
      </main>
    </div>

    <MobileBottomTabBar />
  </div>
</template>
