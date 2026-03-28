<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import interact from 'interactjs'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib-modules/utils'
import type { ReelScript } from '../types'

const props = defineProps<{
  script: ReelScript
  currentSecond: number
}>()

const emit = defineEmits<{
  seek: [second: number]
}>()

// Refs for dragging
const handleRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragPosition = ref(0) // in pixels from left edge

// Format time as M:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Get set of seconds that have frame content
const framesWithContent = computed(() => {
  const set = new Set<number>()
  props.script.frames.forEach((frame) => {
    if (frame.description || frame.voiceover || frame.visualUrl) {
      set.add(frame.second)
    }
  })
  return set
})

// Array of all seconds for timeline markers
const secondMarkers = computed(() => {
  const markers: number[] = []
  for (let i = 0; i <= props.script.duration; i++) {
    markers.push(i)
  }
  return markers
})

// Handle click on timeline bar (only when not dragging)
const handleTimelineClick = (event: MouseEvent) => {
  if (isDragging.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newSecond = Math.round(percentage * props.script.duration)
  emit('seek', Math.max(0, Math.min(newSecond, props.script.duration)))
}

// Navigate to previous/next second
const goToPrevious = () => {
  if (props.currentSecond > 0) {
    emit('seek', props.currentSecond - 1)
  }
}

const goToNext = () => {
  if (props.currentSecond < props.script.duration) {
    emit('seek', props.currentSecond + 1)
  }
}

// Calculate position percentage for current marker
const currentPositionPercent = computed(() => {
  if (props.script.duration === 0) return 0
  return (props.currentSecond / props.script.duration) * 100
})

// Calculate displayed position (use drag position when dragging, otherwise from props)
const displayPositionPercent = computed(() => {
  if (isDragging.value && trackRef.value) {
    const trackWidth = trackRef.value.getBoundingClientRect().width
    return Math.max(0, Math.min(100, (dragPosition.value / trackWidth) * 100))
  }
  return currentPositionPercent.value
})

// Setup interactjs dragging
onMounted(() => {
  if (!handleRef.value || !trackRef.value) return

  interact(handleRef.value).draggable({
    listeners: {
      start() {
        isDragging.value = true
        if (trackRef.value) {
          const trackRect = trackRef.value.getBoundingClientRect()
          dragPosition.value = (props.currentSecond / props.script.duration) * trackRect.width
        }
      },
      move(event) {
        if (!trackRef.value) return
        const trackRect = trackRef.value.getBoundingClientRect()
        // Calculate new position (only use horizontal movement)
        dragPosition.value += event.dx
        // Clamp to track bounds
        dragPosition.value = Math.max(0, Math.min(dragPosition.value, trackRect.width))
      },
      end() {
        if (!trackRef.value) return
        const trackRect = trackRef.value.getBoundingClientRect()
        const percentage = dragPosition.value / trackRect.width
        const newSecond = Math.round(percentage * props.script.duration)
        emit('seek', Math.max(0, Math.min(newSecond, props.script.duration)))
        isDragging.value = false
      }
    }
  })
})

onUnmounted(() => {
  if (handleRef.value) {
    interact(handleRef.value).unset()
  }
})

// Update drag position when currentSecond changes externally (not during drag)
watch(() => props.currentSecond, () => {
  if (!isDragging.value && trackRef.value) {
    const trackRect = trackRef.value.getBoundingClientRect()
    dragPosition.value = (props.currentSecond / props.script.duration) * trackRect.width
  }
})
</script>

<template>
  <div :class="cn('w-full space-y-2 select-none', isDragging && 'cursor-grabbing')">
    <!-- Time display -->
    <div class="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
      <span class="font-mono">{{ formatTime(currentSecond) }}</span>
      <span class="font-mono">{{ formatTime(script.duration) }}</span>
    </div>

    <!-- Timeline container -->
    <div class="flex items-center gap-2">
      <!-- Previous button -->
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 shrink-0"
        :disabled="currentSecond <= 0"
        @click="goToPrevious"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <!-- Timeline bar -->
      <div
        ref="trackRef"
        class="relative flex-1 h-12 cursor-pointer"
        @click="handleTimelineClick"
      >
        <!-- Background track -->
        <div class="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700" />

        <!-- Second markers -->
        <div class="absolute top-1/2 left-0 right-0 flex -translate-y-1/2">
          <div
            v-for="second in secondMarkers"
            :key="second"
            :style="{ left: `${(second / script.duration) * 100}%` }"
            class="absolute flex flex-col items-center"
          >
            <!-- Marker tick -->
            <div
              :class="cn(
                'w-0.5 rounded-full transition-colors',
                second % 5 === 0 ? 'h-3 bg-zinc-400 dark:bg-zinc-500' : 'h-2 bg-zinc-300 dark:bg-zinc-600',
                framesWithContent.has(second) && 'bg-blue-500 dark:bg-blue-400'
              )"
            />

            <!-- Frame indicator dot -->
            <div
              v-if="framesWithContent.has(second)"
              class="absolute -bottom-2 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
            />
          </div>
        </div>

        <!-- Current position marker (draggable) -->
        <div
          ref="handleRef"
          :style="{ left: `${displayPositionPercent}%` }"
          :class="cn(
            'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-grab touch-none',
            isDragging && 'cursor-grabbing'
          )"
        >
          <div class="flex flex-col items-center">
            <!-- Vertical line -->
            <div class="h-6 w-0.5 rounded-full bg-white shadow-sm" />
            <!-- Handle -->
            <div
              :class="cn(
                'absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-2 border-blue-500 shadow-md transition-transform',
                isDragging && 'scale-125 border-blue-600'
              )"
            />
          </div>
        </div>
      </div>

      <!-- Next button -->
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 shrink-0"
        :disabled="currentSecond >= script.duration"
        @click="goToNext"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <!-- Second numbers (sparse) -->
    <div class="relative h-4 mx-10">
      <div
        v-for="second in secondMarkers.filter(s => s % 5 === 0 || s === script.duration)"
        :key="`label-${second}`"
        :style="{ left: `${(second / script.duration) * 100}%` }"
        class="absolute -translate-x-1/2 text-xs text-zinc-400 dark:text-zinc-500 font-mono"
      >
        {{ second }}
      </div>
    </div>
  </div>
</template>
