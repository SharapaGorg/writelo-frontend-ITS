// lib-modules/demo-mode/composables/useDemoGuard.ts

import { ref } from 'vue'
import { useDemoMode } from './useDemoMode'

const showAuthModal = ref(false)

export function useDemoGuard() {
  const { isGuestDemo } = useDemoMode()

  /**
   * Guard an action - show auth modal if in guest demo mode
   * @param action The action to execute if not in demo mode
   * @returns true if action was blocked, false if executed
   */
  function guardAction(action: () => void): boolean {
    if (isGuestDemo.value) {
      showAuthModal.value = true
      return true
    }
    action()
    return false
  }

  /**
   * Check if action should be blocked (without showing modal)
   */
  function shouldBlock(): boolean {
    return isGuestDemo.value
  }

  /**
   * Open auth modal manually
   */
  function openAuthModal() {
    showAuthModal.value = true
  }

  /**
   * Close auth modal
   */
  function closeAuthModal() {
    showAuthModal.value = false
  }

  return {
    showAuthModal,
    guardAction,
    shouldBlock,
    openAuthModal,
    closeAuthModal
  }
}
