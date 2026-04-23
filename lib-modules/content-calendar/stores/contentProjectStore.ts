// lib-modules/content-calendar/stores/contentProjectStore.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { SocialAccount, DemoProject, ContentTag, CalendarPost } from '../types'
import { demoProjects as initialDemoProjects } from '../data/demoData'
import { useWorkspaceContext } from '~/lib-modules/workspaces/composables/useWorkspaceContext'
import { useWorkspacesStore } from '~/lib-modules/workspaces/stores/workspacesStore'
import { useContentCalendarApi } from '../helpers/api'

function emptyProjectFromWorkspace(id: string, name: string): DemoProject {
  return {
    id,
    name,
    accounts: [],
    tags: [],
    posts: [],
    infoEvents: [],
    news: [],
    trends: [],
  }
}

/**
 * Store is "demo" only when explicitly switched via `enableDemoMode()` — called by
 * showcase renders (landing page, /ideas). The main app (/app/calendar) never
 * triggers demo; it always uses real workspace data from the API.
 */
export const useContentProjectStore = defineStore('contentProject', () => {
  const context = useWorkspaceContext()
  const workspacesStore = useWorkspacesStore()
  const api = useContentCalendarApi()

  const isDemo = ref(false)
  const projects = ref<DemoProject[]>([])
  const selectedProjectId = ref<string>('')
  const loading = ref(false)

  const currentProject = computed(() =>
    projects.value.find(p => p.id === selectedProjectId.value) ?? projects.value[0] ?? null
  )

  const currentProjectAccounts = computed<SocialAccount[]>(() =>
    currentProject.value?.accounts ?? []
  )

  function enableDemoMode() {
    isDemo.value = true
    projects.value = [...initialDemoProjects]
    selectedProjectId.value = initialDemoProjects[0]?.id ?? ''
  }

  function disableDemoMode() {
    if (!isDemo.value) return
    isDemo.value = false
    projects.value = []
    selectedProjectId.value = context.currentWorkspaceId.value ?? ''
    syncProjects()
  }

  function ensureProjectSkeleton(workspaceId: string, name: string) {
    if (!projects.value.some(p => p.id === workspaceId)) {
      projects.value.push(emptyProjectFromWorkspace(workspaceId, name))
    }
  }

  async function fetchProjectData(workspaceId: string): Promise<void> {
    if (isDemo.value) return

    loading.value = true
    try {
      const [accounts, tags, posts, infoEvents] = await Promise.all([
        api.getSocialAccounts(workspaceId).catch(() => []),
        api.getTags(workspaceId).catch(() => []),
        api.getPosts(workspaceId).catch(() => []),
        api.getCalendarEvents(workspaceId).catch(() => []),
      ])

      const project = projects.value.find(p => p.id === workspaceId)
      if (!project) return

      project.accounts = accounts
      project.tags = tags
      project.posts = posts
      project.infoEvents = infoEvents
    } finally {
      loading.value = false
    }
  }

  function syncProjects() {
    if (isDemo.value) return

    const workspaceIds = new Set(workspacesStore.workspaces.map(w => w.id))
    projects.value = projects.value.filter(p => workspaceIds.has(p.id))

    for (const ws of workspacesStore.workspaces) {
      ensureProjectSkeleton(ws.id, ws.name)
    }

    for (const p of projects.value) {
      const ws = workspacesStore.workspaces.find(w => w.id === p.id)
      if (ws && p.name !== ws.name) p.name = ws.name
    }
  }

  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
    if (!isDemo.value && projectId !== context.currentWorkspaceId.value) {
      context.setCurrentWorkspace(projectId)
    }
  }

  watch(() => context.currentWorkspaceId.value, (newId) => {
    if (isDemo.value || !newId) return
    if (selectedProjectId.value !== newId) {
      selectedProjectId.value = newId
    }
    const project = projects.value.find(p => p.id === newId)
    if (project && project.accounts.length === 0 && project.posts.length === 0) {
      fetchProjectData(newId)
    }
  })

  watch(() => workspacesStore.workspaces.slice(), () => {
    if (isDemo.value) return
    syncProjects()
    const currentId = context.currentWorkspaceId.value
    if (currentId) {
      if (selectedProjectId.value !== currentId) selectedProjectId.value = currentId
      const project = projects.value.find(p => p.id === currentId)
      if (project && project.accounts.length === 0 && project.posts.length === 0) {
        fetchProjectData(currentId)
      }
    }
  }, { immediate: true })

  // === Local mutations + API dispatch ===

  function updatePostLocal(postId: string, updates: Partial<CalendarPost>) {
    const project = currentProject.value
    if (!project) return
    const idx = project.posts.findIndex(p => p.id === postId)
    if (idx === -1) return
    Object.assign(project.posts[idx], updates)
  }

  async function updatePost(postId: string, updates: Partial<CalendarPost>) {
    updatePostLocal(postId, updates)
    if (isDemo.value) return
    const workspaceId = context.currentWorkspaceId.value
    if (!workspaceId) return
    try {
      await api.updatePost(workspaceId, postId, updates)
    } catch (e) {
      console.error('[contentProjectStore] updatePost failed:', e)
    }
  }

  async function createPost(post: Omit<CalendarPost, 'id'>): Promise<CalendarPost | null> {
    if (isDemo.value) {
      const project = currentProject.value
      if (!project) {
        console.warn('[contentProjectStore] createPost: no current project (demo)')
        return null
      }
      const newPost: CalendarPost = { ...post, id: `post-${Date.now()}` }
      project.posts.push(newPost)
      return newPost
    }

    const workspaceId = context.currentWorkspaceId.value
    if (!workspaceId) {
      console.warn('[contentProjectStore] createPost: no workspace — are you signed in?')
      return null
    }

    // Ensure skeleton project exists for the current workspace (user may not have workspaces synced yet)
    let project = projects.value.find(p => p.id === workspaceId)
    if (!project) {
      const ws = workspacesStore.workspaces.find(w => w.id === workspaceId)
      ensureProjectSkeleton(workspaceId, ws?.name ?? 'Workspace')
      project = projects.value.find(p => p.id === workspaceId)!
    }

    const tempId = `post-tmp-${Date.now()}`
    const optimistic: CalendarPost = { ...post, id: tempId }
    project.posts.push(optimistic)

    try {
      const created = await api.createPost(workspaceId, post)
      const idx = project.posts.findIndex(p => p.id === tempId)
      if (idx !== -1) project.posts[idx] = created
      return created
    } catch (e) {
      console.error('[contentProjectStore] createPost failed:', e)
      const idx = project.posts.findIndex(p => p.id === tempId)
      if (idx !== -1) project.posts.splice(idx, 1)
      return null
    }
  }

  async function deletePost(postId: string): Promise<boolean> {
    const project = currentProject.value
    if (!project) return false
    const idx = project.posts.findIndex(p => p.id === postId)
    if (idx === -1) return false
    const [removed] = project.posts.splice(idx, 1)

    if (isDemo.value) return true

    const workspaceId = context.currentWorkspaceId.value
    if (!workspaceId) return true

    try {
      await api.deletePost(workspaceId, postId)
      return true
    } catch (e) {
      console.error('[contentProjectStore] deletePost failed:', e)
      project.posts.splice(idx, 0, removed)
      return false
    }
  }

  async function createTag(name: string, color: string): Promise<ContentTag | null> {
    const project = currentProject.value
    if (!project) return null

    const existing = project.tags.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    if (isDemo.value) {
      const newTag: ContentTag = { id: `tag-${Date.now()}`, name: name.trim(), color }
      project.tags.push(newTag)
      return newTag
    }

    const workspaceId = context.currentWorkspaceId.value
    if (!workspaceId) return null

    try {
      const created = await api.createTag(workspaceId, { name: name.trim(), color })
      project.tags.push(created)
      return created
    } catch (e) {
      console.error('[contentProjectStore] createTag failed:', e)
      return null
    }
  }

  return {
    // State
    projects,
    selectedProjectId,
    loading,
    isDemo,
    // Computed
    currentProject,
    currentProjectAccounts,
    // Actions
    enableDemoMode,
    disableDemoMode,
    selectProject,
    fetchProjectData,
    updatePost,
    updatePostLocal,
    createPost,
    deletePost,
    createTag,
  }
})
