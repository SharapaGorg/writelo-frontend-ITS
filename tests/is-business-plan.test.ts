import { describe, it, expect } from 'vitest'

import { isBusinessSubscription } from '~/lib-modules/plans/composables/usePlans'

describe('isBusinessSubscription', () => {
  it('matches subscription with type === "business"', () => {
    expect(isBusinessSubscription({ type: 'business' })).toBe(true)
  })

  it('does NOT match personal or missing type', () => {
    expect(isBusinessSubscription({ type: 'personal' })).toBe(false)
    expect(isBusinessSubscription({})).toBe(false)
  })

  it('handles null / undefined', () => {
    expect(isBusinessSubscription(null)).toBe(false)
    expect(isBusinessSubscription(undefined)).toBe(false)
  })
})
