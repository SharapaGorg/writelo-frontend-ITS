import { describe, it, expect } from 'vitest'

// Чистая хелпер-функция: вынесем её из usePlans, чтобы тестировать без mount/Vue.
import { matchesBusinessPlan } from '~/lib-modules/plans/composables/usePlans'

describe('matchesBusinessPlan', () => {
  it('matches "Business" — case insensitive', () => {
    expect(matchesBusinessPlan('Business')).toBe(true)
    expect(matchesBusinessPlan('BUSINESS')).toBe(true)
    expect(matchesBusinessPlan('business plan')).toBe(true)
  })

  it('matches "Team" / "Команда" / "Агентство" и опечатку "Агенство"', () => {
    expect(matchesBusinessPlan('Team')).toBe(true)
    expect(matchesBusinessPlan('Команда')).toBe(true)
    expect(matchesBusinessPlan('Командный')).toBe(true)
    expect(matchesBusinessPlan('Агентство')).toBe(true)
    expect(matchesBusinessPlan('Агенство')).toBe(true)  // типичная опечатка
    expect(matchesBusinessPlan('Агентский тариф')).toBe(true)
  })

  it('does NOT match Pro / Free / прочие', () => {
    expect(matchesBusinessPlan('Pro')).toBe(false)
    expect(matchesBusinessPlan('Free')).toBe(false)
    expect(matchesBusinessPlan('Бесплатный')).toBe(false)
    expect(matchesBusinessPlan('Demo')).toBe(false)
    expect(matchesBusinessPlan('')).toBe(false)
  })

  it('handles null / undefined', () => {
    expect(matchesBusinessPlan(null)).toBe(false)
    expect(matchesBusinessPlan(undefined)).toBe(false)
  })
})
