import { ref, computed } from 'vue'
import type { SidebarSection, SidebarItem } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const sidebarItems: SidebarItem[] = [
    { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
    { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
    { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
  ]

  const bottomItems: SidebarItem[] = [
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
