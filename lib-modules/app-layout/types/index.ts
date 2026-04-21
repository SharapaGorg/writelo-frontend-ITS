export type SidebarSection = 'calendar' | 'editor' | 'reels-script' | 'trends' | 'workspaces' | 'profile' | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
}
