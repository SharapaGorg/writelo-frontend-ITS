<script setup lang="ts">
import { computed } from 'vue'
import { Upload, Sparkles, ImageIcon, Trash2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib-modules/utils'
import type { ReelFrame } from '../types'

const props = defineProps<{
  second: number
  frame: ReelFrame | undefined
}>()

const emit = defineEmits<{
  update: [data: Partial<ReelFrame>]
  generateVisual: []
  uploadVisual: []
}>()

// Local computed values that fall back to empty strings
const description = computed({
  get: () => props.frame?.description ?? '',
  set: (value: string) => emit('update', { description: value })
})

const voiceover = computed({
  get: () => props.frame?.voiceover ?? '',
  set: (value: string) => emit('update', { voiceover: value })
})

const visualUrl = computed(() => props.frame?.visualUrl)

const hasVisual = computed(() => !!visualUrl.value)

// Format time display
const formatSecond = (sec: number): string => {
  const mins = Math.floor(sec / 60)
  const secs = sec % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Handle visual removal
const removeVisual = () => {
  emit('update', { visualUrl: undefined })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with time indicator -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-foreground">
          Frame at
        </span>
        <span class="rounded bg-secondary px-2 py-0.5 font-mono text-sm font-semibold text-foreground">
          {{ formatSecond(second) }}
        </span>
      </div>
      <span class="text-xs text-muted-foreground">
        Second {{ second }}
      </span>
    </div>

    <!-- Visual section -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        Visual
      </label>

      <!-- Visual preview or placeholder -->
      <div
        :class="cn(
          'relative aspect-video w-full rounded-md border-2 border-dashed overflow-hidden',
          hasVisual
            ? 'border-foreground/40'
            : 'border-border bg-muted'
        )"
      >
        <!-- Visual preview -->
        <template v-if="hasVisual">
          <img
            :src="visualUrl"
            alt="Frame visual"
            class="h-full w-full object-cover"
          />
          <!-- Remove button overlay -->
          <Button
            variant="destructive"
            size="icon"
            class="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            @click="removeVisual"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </template>

        <!-- Placeholder with action buttons -->
        <template v-else>
          <div class="flex h-full flex-col items-center justify-center gap-3 p-4">
            <ImageIcon class="h-8 w-8 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              No visual for this frame
            </p>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                class="h-8"
                @click="emit('uploadVisual')"
              >
                <Upload class="mr-1.5 h-3.5 w-3.5" />
                Upload
              </Button>
              <Button
                variant="secondary"
                size="sm"
                class="h-8"
                @click="emit('generateVisual')"
              >
                <Sparkles class="mr-1.5 h-3.5 w-3.5" />
                Generate
              </Button>
            </div>
          </div>
        </template>
      </div>

      <!-- Action buttons when visual exists -->
      <div v-if="hasVisual" class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="emit('uploadVisual')"
        >
          <Upload class="mr-1.5 h-3.5 w-3.5" />
          Replace
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="emit('generateVisual')"
        >
          <Sparkles class="mr-1.5 h-3.5 w-3.5" />
          Regenerate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          @click="removeVisual"
        >
          <Trash2 class="mr-1.5 h-3.5 w-3.5" />
          Remove
        </Button>
      </div>
    </div>

    <!-- Description textarea -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        Description
        <span class="ml-1 font-normal text-muted-foreground">
          (what happens in this second)
        </span>
      </label>
      <Textarea
        v-model="description"
        placeholder="Describe the visual action or scene for this second..."
        class="min-h-[80px] resize-none"
      />
    </div>

    <!-- Voiceover/Text textarea -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        Voiceover / Text
        <span class="ml-1 font-normal text-muted-foreground">
          (what to say or display)
        </span>
      </label>
      <Textarea
        v-model="voiceover"
        placeholder="Enter the voiceover script or on-screen text for this second..."
        class="min-h-[80px] resize-none"
      />
    </div>
  </div>
</template>
