export type SidebarSection = 'calendar' | 'editor' | 'reels-script' | 'trends' | 'profile' | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
}
