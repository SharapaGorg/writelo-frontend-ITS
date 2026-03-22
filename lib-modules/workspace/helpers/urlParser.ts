// lib-modules/workspace/helpers/urlParser.ts

import type { Panel, PanelType } from '../types'
import { generateUUID } from '~/scripts/features/utils'

export function parsePanelsFromUrl(panelsParam: string | null): Panel[] {
  if (!panelsParam) {
    return [{ id: generateUUID(), type: 'chat' }]
  }

  const panelStrings = panelsParam.split(',').filter(Boolean)
  if (panelStrings.length === 0) {
    return [{ id: generateUUID(), type: 'chat' }]
  }

  return panelStrings.slice(0, 3).map((str) => {
    const [type, chatId] = str.split(':')
    const panelType: PanelType = type === 'image' ? 'image' : 'chat'

    return {
      id: generateUUID(),
      type: panelType,
      chatId: panelType === 'chat' ? chatId : undefined
    }
  })
}

export function parseSizesFromUrl(sizesParam: string | null, panelCount: number): number[] {
  if (!sizesParam) {
    return distributeEqually(panelCount)
  }

  const sizes = sizesParam.split(',').map(Number).filter((n) => !isNaN(n) && n > 0)

  if (sizes.length !== panelCount) {
    return distributeEqually(panelCount)
  }

  const total = sizes.reduce((a, b) => a + b, 0)
  return sizes.map((s) => (s / total) * 100)
}

export function serializePanelsToUrl(panels: Panel[]): string {
  return panels.map((p) => {
    if (p.type === 'image') return 'image'
    return p.chatId ? `chat:${p.chatId}` : 'chat'
  }).join(',')
}

export function serializeSizesToUrl(sizes: number[]): string {
  return sizes.map((s) => Math.round(s)).join(',')
}

function distributeEqually(count: number): number[] {
  const base = Math.floor(100 / count)
  const remainder = 100 - base * count
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
}
