import type { Action, ActionType } from '../types'

const MARKER = '========SYSTEM======'
const KNOWN_TYPES: ActionType[] = ['save_as_idea', 'open_in_editor']

export interface ParsedTail {
  visibleText: string
  actions: Action[]
}

export function parseActionsTail(text: string): ParsedTail {
  const idx = text.indexOf(MARKER)
  if (idx === -1) {
    return { visibleText: text, actions: [] }
  }

  // Drop the entire line containing the marker — keep everything before it.
  const lineStart = text.lastIndexOf('\n', idx)
  const visibleText = (lineStart === -1 ? '' : text.slice(0, lineStart)).trimEnd()

  const tail = text.slice(idx + MARKER.length).trim()
  let parsed: any
  try {
    parsed = JSON.parse(tail)
  } catch {
    return { visibleText, actions: [] }
  }

  const rawActions = Array.isArray(parsed?.actions) ? parsed.actions : []
  const actions: Action[] = rawActions
    .filter((a: any) => a && typeof a.type === 'string' && KNOWN_TYPES.includes(a.type as ActionType))
    .map((a: any) => ({
      type: a.type as ActionType,
      title: typeof a.title === 'string' ? a.title : '',
      description: typeof a.description === 'string' ? a.description : '',
    }))

  return { visibleText, actions }
}

/**
 * Cheap streaming check: returns true if the buffer already contains the marker
 * or a partial run of '=' on a fresh line that could be the start of one. Used
 * during streaming to decide whether to recompute visibleText on each chunk.
 */
export function isMarkerLikely(text: string): boolean {
  if (text.includes(MARKER)) return true
  return /\n=+/.test(text)
}
