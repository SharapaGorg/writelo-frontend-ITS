<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {Clock, Hash} from 'lucide-vue-next'
import {Button} from '~/components/ui/button'
import {Textarea} from '~/components/ui/textarea'
import {Input} from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import {cn} from '~/lib-modules/utils'
import {useContentEditor} from '../composables/useContentEditor'
import type {ReelFrame} from '../types'
import ReelTimeline from './ReelTimeline.vue'
import FrameEditor from './FrameEditor.vue'

// Duration options in seconds
const DURATION_OPTIONS = [
  {value: 15, label: '15 seconds'},
  {value: 30, label: '30 seconds'},
  {value: 45, label: '45 seconds'},
  {value: 60, label: '60 seconds (1 min)'},
  {value: 90, label: '90 seconds (1.5 min)'}
]

const {
  currentDraft,
  updateDraft,
  updateFrame,
  addFrame,
  setDuration
} = useContentEditor()

// Local state
const currentSecond = ref(0)

// Computed values from draft
const script = computed(() => currentDraft.value?.script ?? {duration: 30, frames: []})
const description = computed(() => currentDraft.value?.description ?? '')
const hashtags = computed(() => currentDraft.value?.hashtags ?? [])

// Get frame for current second
const currentFrame = computed(() => {
  return script.value.frames.find(f => f.second === currentSecond.value)
})

// Duration as string for Select component
const durationStr = computed({
  get: () => String(script.value.duration || 30),
  set: (value: string) => {
    const newDuration = parseInt(value, 10)
    setDuration(newDuration)
    // Reset current second if it exceeds new duration
    if (currentSecond.value > newDuration) {
      currentSecond.value = newDuration
    }
  }
})

// Handle timeline seek
const handleSeek = (second: number) => {
  currentSecond.value = second
}

// Handle frame updates
const handleFrameUpdate = (data: Partial<ReelFrame>) => {
  const existingFrameIndex = script.value.frames.findIndex(
      f => f.second === currentSecond.value
  )

  if (existingFrameIndex >= 0) {
    // Update existing frame
    updateFrame(existingFrameIndex, data)
  } else {
    // Create new frame with the updated data
    const newFrame: ReelFrame = {
      second: currentSecond.value,
      description: data.description ?? '',
      voiceover: data.voiceover ?? '',
      visualUrl: data.visualUrl
    }
    addFrame(newFrame)
  }
}

// Handle visual generation (placeholder)
const handleGenerateVisual = () => {
  // TODO: Integrate with image generator
  console.log('Generate visual for second:', currentSecond.value)
}

// Handle visual upload (placeholder)
const handleUploadVisual = () => {
  // TODO: Integrate with file upload
  console.log('Upload visual for second:', currentSecond.value)
}

// Handle description update
const updateDescription = (value: string | number) => {
  updateDraft({description: String(value)})
}

// Handle hashtags input (comma-separated)
const hashtagsInput = computed({
  get: () => hashtags.value.join(', '),
  set: (value: string) => {
    const tags = value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    updateDraft({hashtags: tags})
  }
})

// Reset current second when duration changes
watch(() => script.value.duration, (newDuration) => {
  if (currentSecond.value > newDuration) {
    currentSecond.value = Math.min(currentSecond.value, newDuration)
  }
})
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header with duration selector -->
    <div class="border-b border-border p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground">
          Reel Script Editor
        </h3>
        <div class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground"/>
          <Select v-model="durationStr">
            <SelectTrigger class="w-[160px] h-9">
              <SelectValue placeholder="Select duration"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                  v-for="option in DURATION_OPTIONS"
                  :key="option.value"
                  :value="String(option.value)"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-6">
        <!-- Timeline section -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-foreground">
            Timeline
          </h4>
          <div class="rounded-md border border-border bg-muted p-4">
            <ReelTimeline
                :script="script"
                :current-second="currentSecond"
                @seek="handleSeek"
            />
          </div>
        </div>

        <!-- Frame editor section -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-foreground">
            Frame Content
          </h4>
          <div class="rounded-md border border-border bg-card p-4">
            <FrameEditor
                :second="currentSecond"
                :frame="currentFrame"
                @update="handleFrameUpdate"
                @generate-visual="handleGenerateVisual"
                @upload-visual="handleUploadVisual"
            />
          </div>
        </div>

        <!-- Reel description section -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">
            Reel Description
            <span class="ml-1 font-normal text-muted-foreground">
              (caption for the reel)
            </span>
          </label>
          <Textarea
              :model-value="description"
              @update:model-value="updateDescription"
              placeholder="Write a captivating description for your reel..."
              class="min-h-[100px] resize-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
