import { describe, it, expect } from 'vitest'
import { parseActionsTail, isMarkerLikely } from '../helpers/actionsParser'

describe('parseActionsTail', () => {
  it('returns full text and empty actions when no marker', () => {
    const r = parseActionsTail('Hello world')
    expect(r.visibleText).toBe('Hello world')
    expect(r.actions).toEqual([])
  })

  it('strips marker and parses a single action', () => {
    const input = 'Visible text\n========SYSTEM======\n{"actions":[{"type":"save_as_idea","title":"T","description":"D"}]}'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('Visible text')
    expect(r.actions).toEqual([{ type: 'save_as_idea', title: 'T', description: 'D' }])
  })

  it('parses multiple actions array', () => {
    const json = JSON.stringify({ actions: [
      { type: 'save_as_idea', title: 'A', description: 'a' },
      { type: 'save_as_idea', title: 'B', description: 'b' },
    ] })
    const input = `Body\n========SYSTEM======\n${json}`
    const r = parseActionsTail(input)
    expect(r.actions).toHaveLength(2)
    expect(r.actions[1].title).toBe('B')
  })

  it('strips marker even on broken json (failsafe)', () => {
    const input = 'Body\n========SYSTEM======\n{not json'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('Body')
    expect(r.actions).toEqual([])
  })

  it('ignores unknown action types', () => {
    const input = 'B\n========SYSTEM======\n{"actions":[{"type":"unknown","title":"T","description":"D"}]}'
    const r = parseActionsTail(input)
    expect(r.actions).toEqual([])
  })

  it('isMarkerLikely returns true once partial marker appeared', () => {
    expect(isMarkerLikely('text\n=====')).toBe(true)
    expect(isMarkerLikely('text\n=====S')).toBe(true)
    expect(isMarkerLikely('text only')).toBe(false)
  })

  it('handles trailing whitespace after marker line', () => {
    const input = 'Body \n========SYSTEM======   \n{"actions":[{"type":"open_in_editor","title":"X","description":"Y"}]}'
    const r = parseActionsTail(input)
    expect(r.actions).toEqual([{ type: 'open_in_editor', title: 'X', description: 'Y' }])
  })

  it('drops the entire line containing the marker (no leading newline)', () => {
    // Edge case: marker is the first thing in the message.
    const input = '========SYSTEM======\n{"actions":[{"type":"save_as_idea","title":"T","description":"D"}]}'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('')
    expect(r.actions).toEqual([{ type: 'save_as_idea', title: 'T', description: 'D' }])
  })

  it('streaming case: marker line still mid-stream, JSON not yet present', () => {
    const input = 'Body\n========SYSTEM======\n{"actio'
    const r = parseActionsTail(input)
    expect(r.visibleText).toBe('Body')
    expect(r.actions).toEqual([])
  })
})
