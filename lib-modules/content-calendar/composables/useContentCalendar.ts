import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { CalendarPost, InfoEvent, PostStatus, ContentTag, SocialAccount } from '../types'
import { useContentProjectStore } from '../stores/contentProjectStore'

export function useContentCalendar() {
  const projectStore = useContentProjectStore()
  const { projects, selectedProjectId, currentProject, loading } = storeToRefs(projectStore)

  // State
  const selectedDate = ref<string | null>(null)
  const selectedPostId = ref<string | null>(null)
  const activeAccountIds = ref<string[]>([])
  const activeStatuses = ref<PostStatus[]>(['idea', 'draft', 'ready', 'publishing', 'published', 'failed'])
  const activeTags = ref<string[]>([])
  // Lazy init on client to avoid SSR/CSR mismatch on month boundary:
  // pre-rendered HTML must not bake in build-time `new Date()`.
  const currentMonth = ref<Date | null>(null)
  onMounted(() => {
    if (!currentMonth.value) currentMonth.value = new Date()
  })

  const usedNews = ref<Record<string, string>>({})
  const usedTrends = ref<Record<string, string>>({})

  // Reset tags, usedNews, and initialize activeAccountIds when project changes
  watch(selectedProjectId, () => {
    activeTags.value = []
    usedNews.value = {}
    usedTrends.value = {}
    const project = currentProject.value
    if (project) {
      activeAccountIds.value = project.accounts.map(a => a.id)
    } else {
      activeAccountIds.value = []
    }
  }, { immediate: true })

  // Sync activeAccountIds with the project's accounts list as it evolves
  // (async fetch, accounts linked/unlinked): newly-appeared accounts become
  // active by default; removed accounts are pruned.
  watch(() => currentProject.value?.accounts.map(a => a.id).join(','), () => {
    const allIds = currentProject.value?.accounts.map(a => a.id) ?? []
    const current = new Set(activeAccountIds.value)
    for (const id of allIds) {
      if (!current.has(id)) activeAccountIds.value.push(id)
    }
    activeAccountIds.value = activeAccountIds.value.filter(id => allIds.includes(id))
  })

  const filteredPosts = computed(() => {
    const posts = currentProject.value?.posts ?? []
    return posts.filter(post => {
      const matchesAccount = activeAccountIds.value.includes(post.accountId)
      const matchesStatus = activeStatuses.value.includes(post.status)
      const matchesTags = activeTags.value.length === 0 ||
        post.tags.some(t => activeTags.value.includes(t))
      return matchesAccount && matchesStatus && matchesTags
    })
  })

  const postsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return filteredPosts.value.filter(p => p.date === selectedDate.value)
  })

  const infoEventsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return (currentProject.value?.infoEvents ?? []).filter(e => e.date === selectedDate.value)
  })

  const selectedPost = computed(() => {
    if (!selectedPostId.value) return null
    return (currentProject.value?.posts ?? []).find(p => p.id === selectedPostId.value) ?? null
  })

  function getPostsForDate(date: string): CalendarPost[] {
    return filteredPosts.value.filter(p => p.date === date)
  }

  function hasInfoEvent(date: string): boolean {
    return (currentProject.value?.infoEvents ?? []).some(e => e.date === date)
  }

  function getInfoEvent(date: string): InfoEvent | undefined {
    return (currentProject.value?.infoEvents ?? []).find(e => e.date === date)
  }

  function selectProject(projectId: string) {
    projectStore.selectProject(projectId)
    selectedDate.value = null
    selectedPostId.value = null
  }

  function selectDate(date: string | null) {
    selectedDate.value = date
    selectedPostId.value = null
  }

  function selectPost(postId: string | null) {
    selectedPostId.value = postId
  }

  function toggleAccount(accountId: string) {
    const index = activeAccountIds.value.indexOf(accountId)
    if (index === -1) {
      activeAccountIds.value.push(accountId)
    } else if (activeAccountIds.value.length > 1) {
      activeAccountIds.value.splice(index, 1)
    }
  }

  function getAccountById(accountId: string): SocialAccount | undefined {
    return (currentProject.value?.accounts ?? []).find(a => a.id === accountId)
  }

  function toggleStatus(status: PostStatus) {
    const index = activeStatuses.value.indexOf(status)
    if (index === -1) {
      activeStatuses.value.push(status)
    } else if (activeStatuses.value.length > 1) {
      activeStatuses.value.splice(index, 1)
    }
  }

  function toggleTag(tagId: string) {
    const index = activeTags.value.indexOf(tagId)
    if (index === -1) {
      activeTags.value.push(tagId)
    } else {
      activeTags.value.splice(index, 1)
    }
  }

  function getTagById(tagId: string): ContentTag | undefined {
    return (currentProject.value?.tags ?? []).find(t => t.id === tagId)
  }

  function updatePost(postId: string, updates: Partial<CalendarPost>) {
    return projectStore.updatePost(postId, updates)
  }

  function createPost(
    post: Omit<CalendarPost, 'id'>,
    options?: { optimistic?: boolean }
  ): Promise<CalendarPost | null> {
    return projectStore.createPost(post, options)
  }

  function deletePost(postId: string): Promise<boolean> {
    return projectStore.deletePost(postId)
  }

  function markNewsAsUsed(newsId: string, date: string) {
    usedNews.value[newsId] = date
  }

  function getNewsUsedDate(newsId: string): string | null {
    return usedNews.value[newsId] || null
  }

  function markTrendAsUsed(trendId: string, date: string) {
    usedTrends.value[trendId] = date
  }

  function getTrendUsedDate(trendId: string): string | null {
    return usedTrends.value[trendId] || null
  }

  const tagColors = [
    'bg-emerald-500', 'bg-indigo-500', 'bg-orange-500', 'bg-rose-500',
    'bg-cyan-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500',
    'bg-teal-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500'
  ]

  async function createTag(name: string): Promise<string> {
    const color = tagColors[Math.floor(Math.random() * tagColors.length)]
    const tag = await projectStore.createTag(name, color)
    return tag?.id ?? ''
  }

  function nextMonth() {
    if (!currentMonth.value) return
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + 1)
    currentMonth.value = next
  }

  function prevMonth() {
    if (!currentMonth.value) return
    const prev = new Date(currentMonth.value)
    prev.setMonth(prev.getMonth() - 1)
    currentMonth.value = prev
  }

  return {
    // State
    selectedProjectId,
    selectedDate,
    selectedPostId,
    activeAccountIds,
    activeStatuses,
    activeTags,
    currentMonth,
    loading,
    // Computed
    currentProject,
    filteredPosts,
    postsForSelectedDate,
    infoEventsForSelectedDate,
    selectedPost,
    // Methods
    getPostsForDate,
    hasInfoEvent,
    getInfoEvent,
    getTagById,
    getAccountById,
    selectProject,
    selectDate,
    selectPost,
    toggleAccount,
    toggleStatus,
    toggleTag,
    nextMonth,
    prevMonth,
    updatePost,
    createPost,
    deletePost,
    createTag,
    markNewsAsUsed,
    getNewsUsedDate,
    markTrendAsUsed,
    getTrendUsedDate,
    // Data
    projects,
    usedNews,
    usedTrends
  }
}
