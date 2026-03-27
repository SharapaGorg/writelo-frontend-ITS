export type SidebarSection = 'calendar' | 'editor' | 'trends' | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
}
