<script setup lang="ts">
import { onMounted } from 'vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces } from '~/lib-modules/workspaces'
import AssistantChat from './AssistantChat.vue'
import AssistantHistoryPanel from './AssistantHistoryPanel.vue'

const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: 'Ассистент' }]"
      :show-workspace-selector="true"
    />

    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1">
        <AssistantChat />
      </div>
      <AssistantHistoryPanel />
    </div>
  </div>
</template>
