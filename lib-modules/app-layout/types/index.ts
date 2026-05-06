export type SidebarSection =
  | 'calendar'
  | 'editor'
  | 'reels-script'
  | 'trends'
  | 'video-analyzer'
  | 'workspaces'
  | 'team'
  | 'activity'
  | 'assistant'
  | 'profile'
  | 'settings'

export type PermissionFlag =
  | 'canViewActivityLog'

export interface SidebarItem {
  id: SidebarSection
  icon: string
  label: string
  route: string
  requiresBusinessPlan?: boolean
  requiresPermission?: PermissionFlag
}
