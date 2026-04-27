export type SidebarSection =
  | 'calendar'
  | 'editor'
  | 'reels-script'
  | 'trends'
  | 'workspaces'
  | 'team'
  | 'activity'
  | 'profile'
  | 'settings'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
  requiresBusinessPlan?: boolean
}
