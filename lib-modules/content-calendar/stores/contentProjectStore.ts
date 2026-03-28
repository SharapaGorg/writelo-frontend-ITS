// lib-modules/content-calendar/stores/contentProjectStore.ts
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { SocialAccount } from '../types'
import { demoProjects as initialDemoProjects } from '../data/demoData'

export const useContentProjectStore = defineStore('contentProject', () => {
  // State
  const projects = reactive([...initialDemoProjects])
  const selectedProjectId = ref<string>('coffee-shop')

  // Computed
  const currentProject = computed(() =>
    projects.find(p => p.id === selectedProjectId.value) ?? projects[0]
  )

  const currentProjectAccounts = computed<SocialAccount[]>(() =>
    currentProject.value?.accounts ?? []
  )

  // Actions
  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
  }

  return {
    projects,
    selectedProjectId,
    currentProject,
    currentProjectAccounts,
    selectProject
  }
})
