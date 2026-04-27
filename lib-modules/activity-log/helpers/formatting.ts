import type { ActivityLogItemDto, DayGroup } from '../types'

const ACTION_TEXTS: Record<string, (item: ActivityLogItemDto) => string> = {
  // Реальные коды наполним по мере появления событий из бэка.
  // Пока всё уходит в fallback на сырой `item.action`.
}

export function mapAction(item: ActivityLogItemDto): string {
  return ACTION_TEXTS[item.action]?.(item) ?? item.action
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)  // YYYY-MM-DD
}

export function groupByDay<T extends { createdAt: string }>(items: T[]): DayGroup<T>[] {
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString())

  const buckets = new Map<string, T[]>()
  for (const it of items) {
    const k = dayKey(it.createdAt)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(it)
  }

  const labelFor = (k: string) => {
    if (k === today) return 'Сегодня'
    if (k === yesterday) return 'Вчера'
    return new Date(k).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: labelFor(key), items }))
}
