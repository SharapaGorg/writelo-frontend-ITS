import { ref, computed } from 'vue'
import type { SidebarSection, SidebarItem } from '../types'

const isCollapsed = ref(false)
const activeSection = ref<SidebarSection>('calendar')

export function useAppLayout() {
  const sidebarItems: SidebarItem[] = [
    { id: 'calendar', icon: 'calendar', label: 'Календарь', route: '/app/calendar' },
    { id: 'editor', icon: 'pen-square', label: 'Редактор', route: '/app/editor' },
    // { id: 'reels-script', icon: 'film', label: 'Сценарий Рилс', route: '/app/reels-script' },
    { id: 'trends', icon: 'trending-up', label: 'Тренды', route: '/app/trends' },
    { id: 'workspaces', icon: 'briefcase', label: 'Бренды', route: '/app/workspaces' },
  ]

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
