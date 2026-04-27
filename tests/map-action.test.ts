import { describe, it, expect } from 'vitest'
import { mapAction } from '~/lib-modules/activity-log/helpers/formatting'
import type { ActivityLogItemDto } from '~/lib-modules/activity-log/types'

function item(action: string): ActivityLogItemDto {
  return {
    id: 'x', userId: null, actor: null,
    entityType: 'post', entityId: 'p',
    action, payload: null, createdAt: '2026-04-27T00:00:00Z',
  }
}

describe('mapAction', () => {
  it('falls back to raw action code when no mapping exists', () => {
    expect(mapAction(item('unknown.event'))).toBe('unknown.event')
  })
})
