<script setup lang="ts">
import { computed } from 'vue'
import { X, Hash, CalendarIcon, Check, Save, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import type { ContentType } from '../types'
import ReelScriptPanel from './ReelScriptPanel.vue'

const {
  currentDraft,
  updateDraft,
  removeImage,
  saveDraft,
  isSaving,
  isReel
} = useContentEditor()

// Content type options
const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
  { value: 'carousel', label: 'Carousel' }
]

// Computed values from draft
const selectedType = computed(() => currentDraft.value?.type ?? 'post')
const images = computed(() => currentDraft.value?.images ?? [])
const description = computed(() => currentDraft.value?.description ?? '')
const hashtags = computed(() => currentDraft.value?.hashtags ?? [])
const scheduledDate = computed(() => currentDraft.value?.scheduledDate ?? null)
const status = computed(() => currentDraft.value?.status ?? 'draft')

// Handle content type change
const setContentType = (type: ContentType) => {
  updateDraft({
    type,
    script: type === 'reel' ? { duration: 30, frames: [] } : undefined
  })
}

// Handle description update
const updateDescription = (value: string | number) => {
  updateDraft({ description: String(value) })
}

// Handle hashtags input (comma-separated or space-separated with #)
const hashtagsInput = computed({
  get: () => hashtags.value.join(' '),
  set: (value: string) => {
    // Split by space or comma, handle both #tag and tag formats
    const tags = value
      .split(/[\s,]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    updateDraft({ hashtags: tags })
  }
})

// Handle scheduled date
const updateScheduledDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateDraft({ scheduledDate: target.value || null })
}

// Format date for display
const formattedDate = computed(() => {
  if (!scheduledDate.value) return ''
  const date = new Date(scheduledDate.value)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Handle image removal
const handleRemoveImage = (index: number) => {
  removeImage(index)
}

// Save as draft
const handleSaveDraft = async () => {
  await saveDraft()
}

// Mark as ready
const handleMarkReady = async () => {
  updateDraft({ status: 'ready' })
  await saveDraft()
}
</script>

<template>
  <div v-if="currentDraft" class="flex h-full flex-col">
    <!-- Content Type Selector -->
    <div class="border-b border-zinc-200 p-4 dark:border-zinc-800">
      <div class="flex items-center gap-1">
        <button
          v-for="type in contentTypes"
          :key="type.value"
          @click="setContentType(type.value)"
          :class="cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            selectedType === type.value
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          )"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="flex-1 overflow-y-auto">
      <!-- Reel content: show ReelScriptPanel -->
      <template v-if="isReel">
        <ReelScriptPanel />
      </template>

      <!-- Non-reel content: images, description, hashtags -->
      <template v-else>
        <div class="space-y-6 p-4">
          <!-- Images Grid -->
          <section v-if="images.length > 0">
            <h4 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Images
            </h4>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                <img
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="h-full w-full object-cover"
                />
                <button
                  @click="handleRemoveImage(index)"
                  class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  type="button"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <!-- Empty state for images -->
          <section v-else>
            <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-8 dark:border-zinc-700">
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                No images added yet
              </p>
              <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Generate images in the left panel
              </p>
            </div>
          </section>

          <!-- Description -->
          <section class="space-y-2">
            <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <Textarea
              :model-value="description"
              @update:model-value="updateDescription"
              placeholder="Write a captivating description for your post..."
              class="min-h-[120px] resize-none"
            />
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ description.length }} / 2200 characters
            </p>
          </section>

          <!-- Hashtags -->
          <section class="space-y-2">
            <label class="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Hash class="h-4 w-4" />
              Hashtags
            </label>
            <Input
              v-model="hashtagsInput"
              placeholder="#marketing #smm #content"
              class="h-10"
            />
            <!-- Hashtag preview -->
            <div v-if="hashtags.length > 0" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in hashtags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {{ tag }}
              </span>
            </div>
          </section>

          <!-- Scheduled Date -->
          <section class="space-y-2">
            <label class="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <CalendarIcon class="h-4 w-4" />
              Scheduled Date
            </label>
            <div class="relative">
              <Input
                type="datetime-local"
                :value="scheduledDate ?? ''"
                @change="updateScheduledDate"
                class="h-10"
              />
            </div>
            <p v-if="formattedDate" class="text-xs text-zinc-500 dark:text-zinc-400">
              Will be published: {{ formattedDate }}
            </p>
          </section>
        </div>
      </template>
    </div>

    <!-- Footer with action buttons -->
    <div class="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          @click="handleSaveDraft"
          :disabled="isSaving"
          class="flex-1 gap-2"
        >
          <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          Save Draft
        </Button>
        <Button
          @click="handleMarkReady"
          :disabled="isSaving"
          :class="cn(
            'flex-1 gap-2',
            status === 'ready' && 'bg-green-600 hover:bg-green-700'
          )"
        >
          <Check class="h-4 w-4" />
          {{ status === 'ready' ? 'Ready' : 'Mark Ready' }}
        </Button>
      </div>
    </div>
  </div>
</template>
