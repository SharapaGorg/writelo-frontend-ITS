import { ref, computed } from 'vue'
import { usePlans } from '~/lib-modules/plans'
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
import type { SidebarSection, SidebarItem, PermissionFlag } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const { isBusinessPlan } = usePlans()
  const permissions = useWorkspacePermissions()

  const allItems: SidebarItem[] = [
    { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
    { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
    { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
    {
      id: 'video-analyzer',
      icon: 'scan-search',
      label: 'Анализ видео',
      route: '/app/video-analyzer',
      requiresPermission: 'canAnalyzeShortVideos',
    },
    { id: 'workspaces', icon: 'briefcase', label: 'Бренды', route: '/app/workspaces' },
    { id: 'team', icon: 'users', label: 'Команда', route: '/app/team', requiresBusinessPlan: true },
    {
      id: 'activity',
      icon: 'history',
      label: 'Журнал',
      route: '/app/activity',
      requiresBusinessPlan: true,
      requiresPermission: 'canViewActivityLog',
    },
    { id: 'assistant', icon: 'sparkles', label: 'Ассистент', route: '/app/assistant' },
  ]

  function hasPermission(flag: PermissionFlag): boolean {
    return permissions[flag].value
  }

  const sidebarItems = computed<SidebarItem[]>(() =>
    allItems.filter(i =>
      (!i.requiresBusinessPlan || isBusinessPlan.value) &&
      (!i.requiresPermission || hasPermission(i.requiresPermission))
    ),
  )

  const bottomItems: SidebarItem[] = [
    { id: 'profile', icon: 'user', label: 'Профиль', route: '/app/profile' },
    { id: 'settings', icon: 'settings', label: 'Настройки', route: '/app/settings' },
  ]

  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }

  function setActiveSection(section: SidebarSection) {
    activeSection.value = section
  }

  return {
    isCollapsed: computed(() => isCollapsed.value),
    activeSection: computed(() => activeSection.value),
    sidebarItems,
    bottomItems,
    toggleSidebar,
    setActiveSection,
  }
}
