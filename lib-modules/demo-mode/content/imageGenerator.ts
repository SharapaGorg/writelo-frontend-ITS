import type { ImageHistoryItem } from '~/lib-modules/imageGenerator/types'

export const DEMO_IMAGE_INPUT_URL = '/demo/example-input.jpg'
export const DEMO_IMAGE_OUTPUT_URL = '/demo/example-output.jpg'

export const DEMO_IMAGE_ID = 'demo-image'

export const demoImageHistoryItem: ImageHistoryItem = {
  id: DEMO_IMAGE_ID,
  prompt: '', // Will be set from i18n
  accessHash: 'demo',
  aspectRatio: '1:1',
  model: 'demo',
  success: true,
  createdAt: new Date().toISOString()
}

export function isDemoImage(id: string): boolean {
  return id === DEMO_IMAGE_ID
}
