export { useDemoMode } from './composables/useDemoMode'
export { useDemoGuard } from './composables/useDemoGuard'
export { default as DemoBanner } from './components/DemoBanner.vue'
export { default as DemoIndicator } from './components/DemoIndicator.vue'
export { default as DemoAuthModal } from './components/DemoAuthModal.vue'
export { demoConversations, demoConversationsFull, isDemoConversation, getDemoConversation } from './content/conversations'
export { demoClient } from './content/client'
export {
  DEMO_IMAGE_INPUT_URL,
  DEMO_IMAGE_OUTPUT_URL,
  DEMO_IMAGE_ID,
  demoImageHistoryItem,
  isDemoImage
} from './content/imageGenerator'
export * from './types'
