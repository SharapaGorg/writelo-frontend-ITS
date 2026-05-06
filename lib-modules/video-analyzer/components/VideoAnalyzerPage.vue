<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces, useWorkspaceContext } from '~/lib-modules/workspaces'
import AnalysisInputBar from './AnalysisInputBar.vue'
import AnalysisHistoryGrid from './AnalysisHistoryGrid.vue'
import { useVideoAnalyzer } from '../composables/useVideoAnalyzer'
import { useAnalysisLimits } from '../composables/useAnalysisLimits'

const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { currentWorkspaceId } = useWorkspaceContext()

const analyzer = useVideoAnalyzer()
const limits = useAnalysisLimits()

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
  if (currentWorkspaceId.value) {
    analyzer.loadHistory(true)
    limits.load()
  }
})

// Reload when the workspace switches via the navbar selector.
watch(currentWorkspaceId, (id) => {
  if (!id) return
  analyzer.loadHistory(true)
  limits.load()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: 'Анализ видео' }]"
      :show-workspace-selector="true"
    />

    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-7xl space-y-6 p-6">
        <AnalysisInputBar />
        <AnalysisHistoryGrid
          :items="analyzer.history.value"
          :is-loading="analyzer.isHistoryLoading.value"
        />
      </div>
    </div>
  </div>
</template>
