import { ref, computed } from 'vue'
import type { SocialNetwork, CalendarPost, InfoEvent } from '../types'
import { demoProjects } from '../data/demoData'

export function useContentCalendar() {
  // State
  const selectedProjectId = ref<string>('coffee-shop')
  const selectedDate = ref<string | null>(null)
  const selectedPostId = ref<string | null>(null)
  const activeNetworks = ref<SocialNetwork[]>(['vk', 'youtube', 'telegram', 'instagram'])
  const currentMonth = ref<Date>(new Date())

  // Current project
  const currentProject = computed(() =>
    demoProjects.find(p => p.id === selectedProjectId.value) ?? demoProjects[0]
  )

  // Filtered posts by active networks
  const filteredPosts = computed(() =>
    currentProject.value.posts.filter(post =>
      post.networks.some(n => activeNetworks.value.includes(n))
    )
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
    selectProject,
    selectDate,
    selectPost,
    toggleNetwork,
    nextMonth,
    prevMonth,
    // Data
    projects: demoProjects
  }
}
