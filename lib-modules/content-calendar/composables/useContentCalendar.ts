import { ref, computed, watch } from 'vue'
import type { SocialNetwork, CalendarPost, InfoEvent, PostStatus, ContentTag } from '../types'
import { demoProjects } from '../data/demoData'

export function useContentCalendar() {
  // State
  const selectedProjectId = ref<string>('coffee-shop')
  const selectedDate = ref<string | null>(null)
  const selectedPostId = ref<string | null>(null)
  const activeNetworks = ref<SocialNetwork[]>(['vk', 'youtube', 'telegram', 'instagram'])
  const activeStatuses = ref<PostStatus[]>(['idea', 'draft', 'ready', 'published'])
  const activeTags = ref<string[]>([]) // Empty = show all, non-empty = filter
  const currentMonth = ref<Date>(new Date())

  // Current project
  const currentProject = computed(() =>
    demoProjects.find(p => p.id === selectedProjectId.value) ?? demoProjects[0]
  )

  // Reset tags when project changes
  watch(selectedProjectId, () => {
    activeTags.value = []
  })

  // Filtered posts by active networks, statuses, and tags
  const filteredPosts = computed(() =>
    currentProject.value.posts.filter(post => {
      const matchesNetwork = post.networks.some(n => activeNetworks.value.includes(n))
      const matchesStatus = activeStatuses.value.includes(post.status)
      // If no tags selected, show all; otherwise filter by selected tags
      const matchesTags = activeTags.value.length === 0 ||
        post.tags.some(t => activeTags.value.includes(t))
      return matchesNetwork && matchesStatus && matchesTags
    })
  )

  // Posts for selected date
  const postsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return filteredPosts.value.filter(p => p.date === selectedDate.value)
  })

  // Info events for selected date
  const infoEventsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []
    return currentProject.value.infoEvents.filter(e => e.date === selectedDate.value)
  })

  // Selected post object
  const selectedPost = computed(() => {
    if (!selectedPostId.value) return null
    return currentProject.value.posts.find(p => p.id === selectedPostId.value) ?? null
  })

  // Get posts for a specific date (for calendar grid)
  function getPostsForDate(date: string): CalendarPost[] {
    return filteredPosts.value.filter(p => p.date === date)
  }

  // Check if date has info event
  function hasInfoEvent(date: string): boolean {
    return currentProject.value.infoEvents.some(e => e.date === date)
  }

  // Get info event for date
  function getInfoEvent(date: string): InfoEvent | undefined {
    return currentProject.value.infoEvents.find(e => e.date === date)
  }

  // Actions
  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
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

  function toggleNetwork(network: SocialNetwork) {
    const index = activeNetworks.value.indexOf(network)
    if (index === -1) {
      activeNetworks.value.push(network)
    } else if (activeNetworks.value.length > 1) {
      activeNetworks.value.splice(index, 1)
    }
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
    return currentProject.value.tags.find(t => t.id === tagId)
  }

  function updatePost(postId: string, updates: Partial<CalendarPost>) {
    const project = demoProjects.find(p => p.id === selectedProjectId.value)
    if (!project) return

    const postIndex = project.posts.findIndex(p => p.id === postId)
    if (postIndex === -1) return

    // Don't allow editing published posts
    if (project.posts[postIndex].status === 'published') return

    Object.assign(project.posts[postIndex], updates)
  }

  function nextMonth() {
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + 1)
    currentMonth.value = next
  }

  function prevMonth() {
    const prev = new Date(currentMonth.value)
    prev.setMonth(prev.getMonth() - 1)
    currentMonth.value = prev
  }

  return {
    // State
    selectedProjectId,
    selectedDate,
    selectedPostId,
    activeNetworks,
    activeStatuses,
    activeTags,
    currentMonth,
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
    selectProject,
    selectDate,
    selectPost,
    toggleNetwork,
    toggleStatus,
    toggleTag,
    nextMonth,
    prevMonth,
    updatePost,
    // Data
    projects: demoProjects
  }
}
