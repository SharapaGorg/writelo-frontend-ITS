<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import interact from 'interactjs'
import type { ReelItem } from '../types'

const props = defineProps<{
  reel: ReelItem
}>()

const emit = defineEmits<{
  dragStart: [reel: ReelItem]
  dragMove: [reel: ReelItem, x: number, y: number]
  dragEnd: [reel: ReelItem, x: number, y: number]
}>()

const cardRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
let ghostElement: HTMLElement | null = null
let lastHoveredCell: Element | null = null

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m}:${String(s).padStart(2, '0')}` : `${m}:00`
}

function openReel() {
  // Don't open if we were dragging
  if (isDragging.value) return
  window.open(props.reel.url, '_blank')
}

function createGhost() {
  if (!cardRef.value) return

  // Create ghost element
  ghostElement = cardRef.value.cloneNode(true) as HTMLElement
  ghostElement.style.position = 'fixed'
  ghostElement.style.width = `${cardRef.value.offsetWidth}px`
  ghostElement.style.height = `${cardRef.value.offsetHeight}px`
  ghostElement.style.pointerEvents = 'none'
  ghostElement.style.zIndex = '9999'
  ghostElement.style.opacity = '0.9'
  ghostElement.style.transform = 'rotate(3deg) scale(1.02)'
  ghostElement.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
  ghostElement.style.transition = 'none'

  document.body.appendChild(ghostElement)

  // Prevent text selection during drag
  document.body.style.userSelect = 'none'
}

function moveGhost(x: number, y: number) {
  if (!ghostElement || !cardRef.value) return

  const offsetX = cardRef.value.offsetWidth / 2
  const offsetY = 20

  ghostElement.style.left = `${x - offsetX}px`
  ghostElement.style.top = `${y - offsetY}px`
}

function removeGhost() {
  if (ghostElement) {
    ghostElement.remove()
    ghostElement = null
  }
  document.body.style.userSelect = ''
}

function highlightCellUnderCursor(x: number, y: number) {
  const elements = document.elementsFromPoint(x, y)
  const cell = elements.find(el => el.hasAttribute('data-calendar-date'))

  // Remove highlight from previous cell
  if (lastHoveredCell && lastHoveredCell !== cell) {
    lastHoveredCell.classList.remove('drag-over-highlight')
  }

  // Add highlight to current cell
  if (cell) {
    cell.classList.add('drag-over-highlight')
    lastHoveredCell = cell
  } else {
    lastHoveredCell = null
  }
}

function clearCellHighlight() {
  if (lastHoveredCell) {
    lastHoveredCell.classList.remove('drag-over-highlight')
    lastHoveredCell = null
  }
}

onMounted(() => {
  if (!cardRef.value) return

  interact(cardRef.value).draggable({
    inertia: false,
    listeners: {
      start(event) {
        isDragging.value = true
        createGhost()
        moveGhost(event.clientX, event.clientY)
        emit('dragStart', props.reel)
      },
      move(event) {
        moveGhost(event.clientX, event.clientY)
        highlightCellUnderCursor(event.clientX, event.clientY)
        emit('dragMove', props.reel, event.clientX, event.clientY)
      },
      end(event) {
        clearCellHighlight()
        removeGhost()
        // Delay reset so click handler sees isDragging=true
        setTimeout(() => {
          isDragging.value = false
        }, 100)
        emit('dragEnd', props.reel, event.clientX, event.clientY)
      }
    }
  })
})

onUnmounted(() => {
  removeGhost()
  if (cardRef.value) {
    interact(cardRef.value).unset()
  }
})
</script>

<template>
  <div
    ref="cardRef"
    class="group cursor-grab rounded-md border border-border bg-card overflow-hidden transition-all hover:border-foreground/30 hover:shadow-lg touch-none"
    :class="{ 'cursor-grabbing': isDragging }"
    @click="openReel"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-[4/5] overflow-hidden bg-muted">
      <img
        :src="reel.thumbnail"
        :alt="reel.description"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <!-- Top gradient for badge legibility -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent" />

      <!-- Reels badge (top-left) -->
      <div class="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/55 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
        Reels
      </div>

      <!-- Duration badge (top-right) -->
      <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/55 text-white text-[11px] font-medium backdrop-blur-sm">
        {{ formatDuration(reel.duration) }}
      </div>

      <!-- Hover overlay with play icon -->
      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div class="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-foreground ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <!-- Views badge (bottom-left) -->
      <div class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/55 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ formatNumber(reel.views) }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-2.5">
      <!-- Author row -->
      <div class="flex items-center gap-1.5 mb-1.5">
        <div class="w-5 h-5 rounded-full overflow-hidden bg-secondary flex-shrink-0">
          <img
            v-if="reel.authorAvatar"
            :src="reel.authorAvatar"
            :alt="reel.author"
            loading="lazy"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
            {{ reel.author.charAt(0).toUpperCase() }}
          </div>
        </div>
        <span class="text-xs text-muted-foreground truncate">{{ reel.author }}</span>
      </div>

      <!-- Description -->
      <p class="text-xs text-foreground line-clamp-2 mb-2 leading-snug min-h-[2rem]">
        {{ reel.description }}
      </p>

      <!-- Metrics row -->
      <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
        <div class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{{ formatNumber(reel.likes) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{{ formatNumber(reel.comments) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
