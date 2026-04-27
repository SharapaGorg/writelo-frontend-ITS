export type { ActivityLogItemDto, UserSummaryDto } from '~/scripts/shared/types/workspace'

export interface ActivityLogFilters {
  userId?: string
  entityType?: string
  action?: string
  from?: string
  to?: string
}

export interface DayGroup<T> {
  key: string  // YYYY-MM-DD
  label: string  // "Сегодня" / "Вчера" / "27 апреля 2026"
  items: T[]
}
