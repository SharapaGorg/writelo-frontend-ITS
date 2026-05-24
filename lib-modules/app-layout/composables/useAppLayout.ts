import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlans } from '~/lib-modules/plans'
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
import type { SidebarSection, SidebarItem, PermissionFlag } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const { isBusinessPlan } = usePlans()
  const permissions = useWorkspacePermissions()
  const { t } = useI18n()

  const allItems = computed<SidebarItem[]>(() => [
    { id: 'trends', icon: 'trending-up', label: t('sidebar.items.trends'), route: '/app/trends' },
    { id: 'video-analyzer', icon: 'scan-search', label: t('sidebar.items.videoAnalyzer'), route: '/app/video-analyzer' },
  ])

  function hasPermission(flag: PermissionFlag): boolean {
    return permissions[flag].value
  }

  const sidebarItems = computed<SidebarItem[]>(() =>
    allItems.value.filter(i =>
      (!i.requiresBusinessPlan || isBusinessPlan.value) &&
      (!i.requiresPermission || hasPermission(i.requiresPermission))
    ),
  )

  const bottomItems = computed<SidebarItem[]>(() => [
    { id: 'profile', icon: 'user', label: t('sidebar.items.profile'), route: '/app/profile' },
  ])

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
