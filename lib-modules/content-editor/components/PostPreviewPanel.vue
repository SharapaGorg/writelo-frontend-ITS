<script setup lang="ts">
import { computed, watch } from 'vue'
import { Save, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { cn } from '~/lib-modules/utils'
import { useContentEditor } from '../composables/useContentEditor'
import type { ContentType, ContentStatus } from '../types'
import type { SocialNetwork } from '~/lib-modules/content-calendar'
import ImageDropZone from './ImageDropZone.vue'

const {
  currentDraft,
  updateDraft,
  addImage,
  removeImage,
  saveDraft,
  isSaving,
  isReel,
  activePanel,
  setActivePanel,
  goToImagesPanel,
  selectedAccountId,
  currentProjectAccounts
} = useContentEditor()

// Get current account's network
const currentNetwork = computed<SocialNetwork | null>(() => {
  if (!selectedAccountId.value) return null
  const account = currentProjectAccounts.value.find(a => a.id === selectedAccountId.value)
  return account?.network ?? null
})

// Define which content types are available per network
const networkCapabilities: Record<SocialNetwork, ContentType[]> = {
  vk: ['post', 'story', 'reel'],
  instagram: ['post', 'story', 'reel'],
  telegram: ['post', 'story'],
  youtube: ['reel'] // YouTube only supports video content (shorts/videos)
}

// Network display names for tooltips
const networkNames: Record<SocialNetwork, string> = {
  vk: 'ВКонтакте',
  instagram: 'Instagram',
  telegram: 'Telegram',
  youtube: 'YouTube'
}

// Check if content type is available for current network
function isContentTypeAvailable(type: ContentType): boolean {
  if (!currentNetwork.value) return true // No account selected = all available
  return networkCapabilities[currentNetwork.value].includes(type)
}

// Get tooltip for disabled content type
function getDisabledTooltip(type: ContentType): string | undefined {
  if (isContentTypeAvailable(type)) return undefined
  if (!currentNetwork.value) return undefined
  return `Недоступно в ${networkNames[currentNetwork.value]}`
}

// Auto-switch to available content type when network changes
watch(currentNetwork, (network) => {
  if (!network || !currentDraft.value) return
  const currentType = currentDraft.value.type
  if (!networkCapabilities[network].includes(currentType)) {
    // Switch to first available type
    const firstAvailable = networkCapabilities[network][0]
    if (firstAvailable) {
      updateDraft({
        type: firstAvailable,
        script: firstAvailable === 'reel' ? { duration: 0, frames: [] } : undefined
      })
    }
  }
})

// Set this panel as active when interacting
const handlePanelFocus = () => {
  setActivePanel('right')
}

const isActivePanel = computed(() => activePanel.value === 'right')

// Content type options
const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' }
]

// Computed values from draft
const selectedType = computed(() => currentDraft.value?.type ?? 'post')
const images = computed(() => currentDraft.value?.images ?? [])
const description = computed(() => currentDraft.value?.description ?? '')
const scheduledDate = computed(() => currentDraft.value?.scheduledDate ?? null)
const status = computed(() => currentDraft.value?.status ?? 'idea')

// Status options with colors (published is not selectable - it's set through calendar publish flow)
const statusOptions: { value: ContentStatus; label: string; color: string }[] = [
  { value: 'idea', label: 'Идея', color: 'text-zinc-400' },
  { value: 'draft', label: 'Черновик', color: 'text-yellow-500' },
  { value: 'ready', label: 'Готово', color: 'text-green-500' }
]

// Get current status option for display
const currentStatusOption = computed(() => {
  if (isPublished.value) {
    return { value: 'published' as ContentStatus, label: 'Опубликовано', color: 'text-blue-500' }
  }
  return statusOptions.find(o => o.value === status.value) || statusOptions[0]
})

// Check if post is published (status cannot be changed)
const isPublished = computed(() => status.value === 'published')

// Handle status change
const updateStatus = (value: ContentStatus) => {
  if (!isPublished.value) {
    updateDraft({ status: value })
  }
}

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

// Handle scheduled date
const updateScheduledDate = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateDraft({ scheduledDate: target.value || null })
}

// Handle image add (receives { url, file } from ImageDropZone)
const handleAddImage = (event: { url: string; file: File }) => {
  addImage(event.url)
}

// Save the post
const handleSave = async () => {
  await saveDraft()
}
</script>

<template>
  <div v-if="currentDraft" class="flex h-full flex-col" @click="handlePanelFocus" @focusin="handlePanelFocus">
    <!-- Content Type Selector -->
    <div class="border-b border-zinc-200 p-4 dark:border-zinc-800">
      <div class="flex items-center gap-1">
        <button
          v-for="type in contentTypes"
          :key="type.value"
          :disabled="!isContentTypeAvailable(type.value)"
          :title="getDisabledTooltip(type.value)"
          @click="isContentTypeAvailable(type.value) && setContentType(type.value)"
          :class="cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !isContentTypeAvailable(type.value)
              ? 'cursor-not-allowed opacity-40 text-zinc-400 dark:text-zinc-600'
              : selectedType === type.value
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
      <div class="space-y-6 p-4">
        <!-- Media Section: 1 video for reel, up to 10 images for post/story -->
        <ImageDropZone
          :images="images"
          :max-images="isReel ? 1 : 10"
          :is-active="isActivePanel"
          :accept-video="isReel"
          @add-image="handleAddImage"
          @remove-image="removeImage"
          @generate="goToImagesPanel"
        />

        <!-- Description (for all types) -->
        <section class="space-y-2">
          <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {{ isReel ? 'Описание' : 'Description' }}
          </label>
          <Textarea
            :model-value="description"
            @update:model-value="updateDescription"
            :placeholder="isReel ? 'Описание для рилс...' : 'Write a captivating description for your post...'"
            class="min-h-[120px] resize-none"
          />
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ description.length }} / 2200 characters
          </p>
        </section>
      </div>
    </div>

    <!-- Footer with status/date and save button -->
    <div class="border-t border-zinc-200 p-4 dark:border-zinc-800 space-y-4">
      <!-- Status and Date row -->
      <div class="flex items-center gap-3">
        <!-- Status selector -->
        <div class="flex-1">
          <Select
            :model-value="status"
            :disabled="isPublished"
            @update:model-value="(v) => updateStatus(v as ContentStatus)"
          >
            <SelectTrigger class="h-9">
              <div class="flex items-center gap-2">
                <!-- Current status icon -->
                <svg v-if="currentStatusOption.value === 'idea'" :class="['w-4 h-4', currentStatusOption.color]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
                </svg>
                <svg v-else-if="currentStatusOption.value === 'draft'" :class="['w-4 h-4', currentStatusOption.color]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor"/>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else-if="currentStatusOption.value === 'ready'" :class="['w-4 h-4', currentStatusOption.color]" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="currentStatusOption.value === 'published'" :class="['w-4 h-4', currentStatusOption.color]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                </svg>
                <span>{{ currentStatusOption.label }}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                <div class="flex items-center gap-2">
                  <svg v-if="option.value === 'idea'" :class="['w-4 h-4', option.color]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
                  </svg>
                  <svg v-else-if="option.value === 'draft'" :class="['w-4 h-4', option.color]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor"/>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else-if="option.value === 'ready'" :class="['w-4 h-4', option.color]" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ option.label }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Date picker -->
        <div class="flex-1">
          <div class="relative">
            <Input
              type="datetime-local"
              :value="scheduledDate ?? ''"
              :disabled="isPublished"
              @change="updateScheduledDate"
              class="h-9"
            />
          </div>
        </div>
      </div>

      <!-- Save button -->
      <Button
        @click="handleSave"
        :disabled="isSaving || isPublished"
        class="w-full gap-2"
      >
        <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
        <Save v-else class="h-4 w-4" />
        Сохранить
      </Button>
    </div>
  </div>
</template>
