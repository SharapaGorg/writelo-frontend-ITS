<script setup lang="ts">
import { ref, computed } from 'vue'
import { Routes } from "~/scripts/shared/types"
import { Button } from "~/components/ui/button"
import { Trash, Share2 } from "lucide-vue-next"
import RemoveConfirmationAlert from "./RemoveConfirmationAlert.vue"
import { useConversationsStore } from "~/stores/conversations"
import { toast } from 'vue-sonner'

const conversationStore = useConversationsStore()

const props = defineProps<{
  privateId: string,
  title: string,
  shareId: string | null
}>()

// Swipe state
const isSwipeActive = ref(false)
const swipeX = ref(0)
const startX = ref(0)
const currentX = ref(0)
const containerRef = ref<HTMLElement>()

// Constants
const SWIPE_THRESHOLD = 80 // Minimum swipe distance to reveal actions
const ACTION_WIDTH = 160 // Width of action buttons area

// Computed styles
const swipeStyle = computed(() => ({
  transform: `translateX(${swipeX.value}px)`,
  transition: isSwipeActive.value ? 'none' : 'transform 0.3s ease-out'
}))

// Touch handlers
const handleTouchStart = (e: TouchEvent) => {
  startX.value = e.touches[0].clientX
  isSwipeActive.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwipeActive.value) return
  
  currentX.value = e.touches[0].clientX
  const diff = startX.value - currentX.value
  
  // Only allow left swipe (negative values)
  if (diff > 0) {
    // Apply resistance when swiping beyond threshold
    swipeX.value = diff > ACTION_WIDTH 
      ? -ACTION_WIDTH - (diff - ACTION_WIDTH) * 0.2 
      : -diff
  } else {
    // Slight resistance when trying to swipe right
    swipeX.value = diff * 0.2
  }
}

const handleTouchEnd = () => {
  isSwipeActive.value = false
  
  const swipeDistance = Math.abs(swipeX.value)
  
  if (swipeDistance > SWIPE_THRESHOLD) {
    // Snap to open position
    swipeX.value = -ACTION_WIDTH
  } else {
    // Snap back to closed
    swipeX.value = 0
  }
}

// Mouse handlers for desktop
const handleMouseDown = (e: MouseEvent) => {
  startX.value = e.clientX
  isSwipeActive.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isSwipeActive.value) return
  
  currentX.value = e.clientX
  const diff = startX.value - currentX.value
  
  if (diff > 0) {
    swipeX.value = diff > ACTION_WIDTH 
      ? -ACTION_WIDTH - (diff - ACTION_WIDTH) * 0.2 
      : -diff
  } else {
    swipeX.value = diff * 0.2
  }
}

const handleMouseUp = () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  handleTouchEnd()
}

// Close swipe when clicking elsewhere
const closeSwipe = () => {
  swipeX.value = 0
}

// Navigate to conversation
const navigateToConversation = () => {
  if (Math.abs(swipeX.value) < 10) { // Only navigate if not swiped
    navigateTo(Routes.conversations + props.privateId)
  }
}

// Handle share action
const handleShare = async () => {
  try {
    await conversationStore.shareConversation(props.privateId)
    toast.success('Conversation shared successfully!')
    closeSwipe()
  } catch (error) {
    toast.error('Failed to share conversation')
  }
}
</script>

<template>
  <div 
    ref="containerRef"
    class="relative overflow-hidden touch-pan-y"
    @click.self="closeSwipe"
  >
    <!-- Action buttons behind the swipeable content -->
    <div class="absolute inset-y-0 right-0 flex items-center h-full">
      <button
        @click="handleShare"
        class="h-full px-6 bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
        :class="{ 'pointer-events-none': swipeX.value === 0 }"
      >
        <Share2 class="w-5 h-5" />
      </button>
      
      <RemoveConfirmationAlert 
        :dialog-title="title" 
        @approve="conversationStore.removeConversation(privateId, $t)"
      >
        <button
          class="h-full px-6 bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center"
          :class="{ 'pointer-events-none': swipeX.value === 0 }"
        >
          <Trash class="w-5 h-5" />
        </button>
      </RemoveConfirmationAlert>
    </div>

    <!-- Swipeable content -->
    <div
      :style="swipeStyle"
      class="relative bg-white dark:bg-black z-10"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
    >
      <Button
        class="w-full overflow-hidden text-ellipsis justify-start"
        variant="outline"
        @click="navigateToConversation"
      >
        {{ title }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Prevent text selection during swipe */
.touch-pan-y {
  user-select: none;
  -webkit-user-select: none;
}
</style>