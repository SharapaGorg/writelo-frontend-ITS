<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Button } from '~/components/ui/button'
import InstagramPreview from './previews/InstagramPreview.vue'
import VkPreview from './previews/VkPreview.vue'
import YouTubePreview from './previews/YouTubePreview.vue'
import TelegramPreview from './previews/TelegramPreview.vue'
import type { CalendarPost, SocialNetwork, PostStatus, ContentTag } from '../types'

const props = defineProps<{
  post: CalendarPost
  projectTags: ContentTag[]
  createTag: (name: string) => string
}>()

const emit = defineEmits<{
  close: []
  update: [updates: Partial<CalendarPost>]
}>()

type TabType = 'content' | 'preview'

const activeTab = ref<TabType>('content')
const previewNetwork = ref<SocialNetwork>('vk')
const isEditing = ref(false)

// Edit form state
const editTitle = ref('')
const editContent = ref('')
const editStatus = ref<PostStatus>('idea')
const editNetworks = ref<SocialNetwork[]>([])
const editTags = ref<string[]>([])
const editDate = ref('')
const editTime = ref('')

// Tag input state
const tagSearch = ref('')
const tagDropdownOpen = ref(false)
const tagInputRef = ref<HTMLInputElement | null>(null)

// Publishing state
const isPublishing = ref(false)
const publishLinks = ref<Partial<Record<SocialNetwork, string>>>({})
const showConfetti = ref(false)

const isPublished = computed(() => props.post.status === 'published')

watch(() => props.post, () => {
  activeTab.value = 'content'
  isEditing.value = false
  // Set default preview network to first available
  if (props.post.networks.length > 0) {
    previewNetwork.value = props.post.networks[0]
  }
  resetEditForm()
}, { immediate: true })

const showPreviewTab = computed(() => {
  const status = isEditing.value ? editStatus.value : props.post.status
  return status !== 'idea'
})

function resetEditForm() {
  editTitle.value = props.post.title
  editContent.value = props.post.content || ''
  editStatus.value = props.post.status
  editNetworks.value = [...props.post.networks]
  editTags.value = [...props.post.tags]
  editDate.value = props.post.date
  editTime.value = props.post.time || ''
  tagSearch.value = ''
  tagDropdownOpen.value = false
  isPublishing.value = false
  publishLinks.value = {}
}

function startEditing() {
  resetEditForm()
  activeTab.value = 'content' // Always edit content
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  resetEditForm()
}

function saveChanges() {
  emit('update', {
    title: editTitle.value,
    content: editContent.value,
    status: editStatus.value,
    networks: editNetworks.value,
    tags: editTags.value,
    date: editDate.value,
    time: editTime.value || undefined
  })
  isEditing.value = false
}

// Publishing flow
function startPublishing() {
  publishLinks.value = { ...props.post.publishedLinks } || {}
  // Initialize empty links for networks that don't have one
  for (const network of props.post.networks) {
    if (!publishLinks.value[network]) {
      publishLinks.value[network] = ''
    }
  }
  isPublishing.value = true
}

function cancelPublishing() {
  isPublishing.value = false
  publishLinks.value = {}
}

function unpublish() {
  emit('update', {
    status: 'ready' as PostStatus,
    publishedLinks: undefined
  })
}

function confirmPublish() {
  // Filter out empty links
  const links: Partial<Record<SocialNetwork, string>> = {}
  for (const [network, link] of Object.entries(publishLinks.value)) {
    if (link && link.trim()) {
      links[network as SocialNetwork] = link.trim()
    }
  }

  emit('update', {
    status: 'published' as PostStatus,
    publishedLinks: Object.keys(links).length > 0 ? links : undefined
  })
  isPublishing.value = false

  // Trigger confetti celebration
  showConfetti.value = true
  setTimeout(() => {
    showConfetti.value = false
  }, 2500)
}

const canPublish = computed(() => props.post.status === 'ready')

function toggleEditNetwork(network: SocialNetwork) {
  const idx = editNetworks.value.indexOf(network)
  if (idx === -1) {
    editNetworks.value.push(network)
  } else if (editNetworks.value.length > 1) {
    editNetworks.value.splice(idx, 1)
  }
}

// Tag management
const filteredTags = computed(() => {
  const search = tagSearch.value.toLowerCase().trim()
  if (!search) return props.projectTags.filter(t => !editTags.value.includes(t.id))
  return props.projectTags.filter(t =>
    t.name.toLowerCase().includes(search) && !editTags.value.includes(t.id)
  )
})

const canCreateTag = computed(() => {
  const search = tagSearch.value.trim()
  if (!search) return false
  return !props.projectTags.some(t => t.name.toLowerCase() === search.toLowerCase())
})

function openTagDropdown() {
  tagDropdownOpen.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function closeTagDropdown() {
  tagDropdownOpen.value = false
  tagSearch.value = ''
}

function selectTag(tagId: string) {
  if (!editTags.value.includes(tagId)) {
    editTags.value.push(tagId)
  }
  tagSearch.value = ''
  closeTagDropdown()
}

function createAndSelectTag() {
  const name = tagSearch.value.trim()
  if (!name) return
  const newTagId = props.createTag(name)
  if (newTagId) {
    editTags.value.push(newTagId)
  }
  tagSearch.value = ''
  closeTagDropdown()
}

function removeEditTag(tagId: string) {
  const idx = editTags.value.indexOf(tagId)
  if (idx !== -1) {
    editTags.value.splice(idx, 1)
  }
}

function handleTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (canCreateTag.value) {
      createAndSelectTag()
    } else if (filteredTags.value.length > 0) {
      selectTag(filteredTags.value[0].id)
    }
  }
}

// Get tag objects for edit mode
const editTagObjects = computed(() =>
  editTags.value
    .map(tagId => props.projectTags.find(t => t.id === tagId))
    .filter((t): t is ContentTag => !!t)
)

const previewComponents: Record<SocialNetwork, any> = {
  instagram: InstagramPreview,
  vk: VkPreview,
  youtube: YouTubePreview,
  telegram: TelegramPreview
}

const networkLabels: Record<SocialNetwork, string> = {
  vk: 'VK',
  youtube: 'YouTube',
  telegram: 'Telegram',
  instagram: 'Instagram'
}

const allNetworks: SocialNetwork[] = ['vk', 'youtube', 'telegram', 'instagram']

const editableStatuses: { value: PostStatus; label: string }[] = [
  { value: 'idea', label: 'Идея' },
  { value: 'draft', label: 'Черновик' },
  { value: 'ready', label: 'Готов' },
  { value: 'published', label: 'Опубликован' }
]

const statusInfo: Record<PostStatus, { label: string; class: string }> = {
  idea: { label: 'Идея', class: 'text-gray-400' },
  draft: { label: 'Черновик', class: 'text-yellow-500' },
  ready: { label: 'Готов к публикации', class: 'text-green-500' },
  published: { label: 'Опубликован', class: 'text-blue-500' }
}

const currentPreview = computed(() => {
  return props.post.previews[previewNetwork.value]
})

// Get display content - use content field or first preview text
const displayContent = computed(() => {
  if (props.post.content) return props.post.content
  // Fallback to first preview text
  for (const network of props.post.networks) {
    const preview = props.post.previews[network]
    if (preview?.text) return preview.text
  }
  return ''
})

// Get tag objects for this post
const postTags = computed(() =>
  props.post.tags
    .map(tagId => props.projectTags.find(t => t.id === tagId))
    .filter((t): t is ContentTag => !!t)
)
</script>

<template>
  <aside class="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col relative overflow-hidden">
    <!-- Confetti celebration -->
    <div v-if="showConfetti" class="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <!-- Confetti particles -->
      <div
        v-for="i in 50"
        :key="i"
        class="confetti-particle"
        :style="{
          '--delay': `${Math.random() * 0.5}s`,
          '--x': `${(Math.random() - 0.5) * 400}px`,
          '--y': `${Math.random() * -600 - 100}px`,
          '--rotation': `${Math.random() * 720 - 360}deg`,
          '--color': ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 6)],
          left: '50%',
          top: '50%'
        }"
      />
      <!-- Success checkmark glow -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="success-glow">
          <svg class="w-24 h-24 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" class="success-circle" />
            <path d="M8 12l2.5 2.5L16 9" class="success-check" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
      <template v-if="isEditing">
        <input
          v-model="editTitle"
          class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
          placeholder="Заголовок"
        />
      </template>
      <h3 v-else class="flex-1 min-w-0 text-sm font-medium text-zinc-200 truncate">{{ post.title }}</h3>
      <button
        class="flex-shrink-0 text-zinc-500 hover:text-white transition-colors p-1"
        @click="isEditing ? cancelEditing() : isPublishing ? cancelPublishing() : emit('close')"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Action buttons bar -->
    <div v-if="!isEditing && !isPublishing" class="px-4 py-2 border-b border-zinc-800 flex gap-2">
      <button
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
        @click="startEditing"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Редактировать
      </button>
      <button
        v-if="canPublish"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
        @click="startPublishing"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        </svg>
        Опубликовать
      </button>
      <button
        v-if="isPublished"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium transition-colors"
        @click="unpublish"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Снять с публикации
      </button>
    </div>

    <!-- Publishing form -->
    <div v-if="isPublishing" class="px-4 py-3 border-b border-zinc-800 bg-green-900/20">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        </svg>
        <span class="text-sm font-medium text-green-400">Публикация поста</span>
      </div>
      <p class="text-xs text-zinc-400 mb-3">Добавьте ссылки на опубликованные посты (необязательно)</p>

      <div class="space-y-2 mb-4">
        <div v-for="network in post.networks" :key="network" class="flex items-center gap-2">
          <!-- Network icon -->
          <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <svg v-if="network === 'vk'" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
            </svg>
            <svg v-else-if="network === 'youtube'" class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <svg v-else-if="network === 'telegram'" class="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <svg v-else-if="network === 'instagram'" class="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </div>
          <input
            v-model="publishLinks[network]"
            type="url"
            :placeholder="`Ссылка на ${networkLabels[network]}`"
            class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
          @click="confirmPublish"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          Подтвердить
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm transition-colors"
          @click="cancelPublishing"
        >
          Отмена
        </button>
      </div>
    </div>

    <!-- Tabs (hidden when editing or publishing) -->
    <div v-if="!isEditing && !isPublishing" class="flex gap-1 px-4 py-2 border-b border-zinc-800">
      <Button
        :variant="activeTab === 'content' ? 'default' : 'ghost'"
        size="sm"
        @click="activeTab = 'content'"
      >
        Контент
      </Button>
      <Button
        v-if="showPreviewTab"
        :variant="activeTab === 'preview' ? 'default' : 'ghost'"
        size="sm"
        @click="activeTab = 'preview'"
      >
        Превью
      </Button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Content Tab -->
      <template v-if="activeTab === 'content'">
        <!-- Edit Mode -->
        <template v-if="isEditing">
          <!-- Image (read-only for now) -->
          <div v-if="post.image" class="mb-4 rounded-lg overflow-hidden opacity-60">
            <img :src="post.image" :alt="post.title" class="w-full h-auto" />
          </div>

          <!-- Text Content -->
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-1 block">Контент</label>
            <textarea
              v-model="editContent"
              class="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 min-h-[120px] resize-y"
              placeholder="Текст поста..."
            />
          </div>

          <!-- Date & Time -->
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-2 block">Дата и время</label>
            <div class="flex gap-2">
              <input
                v-model="editDate"
                type="date"
                class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
              />
              <input
                v-model="editTime"
                type="time"
                class="w-28 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                placeholder="--:--"
              />
            </div>
          </div>

          <!-- Status -->
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-2 block">Статус</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="s in editableStatuses"
                :key="s.value"
                :class="[
                  'px-3 py-1.5 rounded text-sm transition-colors',
                  editStatus === s.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                ]"
                @click="editStatus = s.value"
              >
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Networks -->
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-2 block">Соцсети</label>
            <div class="grid grid-cols-2 gap-2">
              <!-- VK -->
              <button
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  editNetworks.includes('vk')
                    ? 'bg-blue-500/20 border-blue-500 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                ]"
                @click="toggleEditNetwork('vk')"
              >
                <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
                </svg>
                <span class="text-sm font-medium">VK</span>
                <svg v-if="editNetworks.includes('vk')" class="w-4 h-4 ml-auto text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <!-- YouTube -->
              <button
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  editNetworks.includes('youtube')
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                ]"
                @click="toggleEditNetwork('youtube')"
              >
                <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span class="text-sm font-medium">YouTube</span>
                <svg v-if="editNetworks.includes('youtube')" class="w-4 h-4 ml-auto text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <!-- Telegram -->
              <button
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  editNetworks.includes('telegram')
                    ? 'bg-sky-500/20 border-sky-500 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                ]"
                @click="toggleEditNetwork('telegram')"
              >
                <svg class="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span class="text-sm font-medium">Telegram</span>
                <svg v-if="editNetworks.includes('telegram')" class="w-4 h-4 ml-auto text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <!-- Instagram -->
              <button
                :class="[
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  editNetworks.includes('instagram')
                    ? 'bg-pink-500/20 border-pink-500 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                ]"
                @click="toggleEditNetwork('instagram')"
              >
                <svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                <span class="text-sm font-medium">Instagram</span>
                <svg v-if="editNetworks.includes('instagram')" class="w-4 h-4 ml-auto text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div class="mb-4">
            <label class="text-xs text-zinc-500 mb-2 block">Теги</label>

            <!-- Selected tags -->
            <div v-if="editTagObjects.length > 0" class="flex gap-1.5 flex-wrap mb-2">
              <span
                v-for="tag in editTagObjects"
                :key="tag.id"
                :class="['px-2 py-1 text-xs rounded flex items-center gap-1 text-white', tag.color]"
              >
                {{ tag.name }}
                <button class="hover:text-white/70" @click="removeEditTag(tag.id)">×</button>
              </span>
            </div>

            <!-- Tag input with dropdown -->
            <div class="relative">
              <!-- Click outside to close (must be before dropdown) -->
              <div
                v-if="tagDropdownOpen"
                class="fixed inset-0 z-40"
                @click="closeTagDropdown"
              />

              <button
                class="w-full px-3 py-2 text-sm text-left rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 flex items-center gap-2"
                @click="openTagDropdown"
              >
                <span>+ Добавить тег</span>
              </button>

              <!-- Dropdown (opens upward to stay in bounds) -->
              <div
                v-if="tagDropdownOpen"
                class="absolute bottom-full left-0 right-0 mb-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50"
              >
                <div class="p-2 border-b border-zinc-700">
                  <input
                    ref="tagInputRef"
                    v-model="tagSearch"
                    type="text"
                    placeholder="Введите название тега..."
                    class="w-full px-2 py-1.5 text-sm bg-zinc-900 border border-zinc-600 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    @keydown="handleTagKeydown"
                    @keydown.escape="closeTagDropdown"
                  />
                </div>
                <div class="max-h-40 overflow-y-auto p-1">
                  <!-- Create new tag option -->
                  <button
                    v-if="canCreateTag"
                    class="w-full px-3 py-2 text-sm text-left rounded flex items-center gap-2 text-purple-400 hover:bg-zinc-700"
                    @click="createAndSelectTag"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Создать «{{ tagSearch.trim() }}»
                  </button>

                  <!-- Existing tags -->
                  <button
                    v-for="tag in filteredTags"
                    :key="tag.id"
                    class="w-full px-3 py-1.5 text-sm text-left rounded flex items-center gap-2 text-zinc-300 hover:bg-zinc-700"
                    @click="selectTag(tag.id)"
                  >
                    <span :class="['w-2.5 h-2.5 rounded-full', tag.color]" />
                    <span>{{ tag.name }}</span>
                  </button>

                  <div v-if="filteredTags.length === 0 && !canCreateTag" class="px-3 py-2 text-sm text-zinc-500">
                    Введите название нового тега
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save/Cancel buttons -->
          <div class="flex gap-2 pt-2 border-t border-zinc-800">
            <Button variant="default" size="sm" class="flex-1" @click="saveChanges">
              Сохранить
            </Button>
            <Button variant="ghost" size="sm" @click="cancelEditing">
              Отмена
            </Button>
          </div>
        </template>

        <!-- View Mode -->
        <template v-else>
          <!-- Image -->
          <div v-if="post.image" class="mb-4 rounded-lg overflow-hidden">
            <img :src="post.image" :alt="post.title" class="w-full h-auto" />
          </div>

          <!-- Text Content -->
          <div class="mb-4">
            <p class="text-sm text-zinc-300 whitespace-pre-wrap">{{ displayContent }}</p>
          </div>

          <!-- Tags -->
          <div v-if="postTags.length > 0" class="flex gap-1.5 flex-wrap mb-4">
            <span
              v-for="tag in postTags"
              :key="tag.id"
              :class="['px-2 py-0.5 text-xs rounded text-white font-medium', tag.color]"
            >
              {{ tag.name }}
            </span>
          </div>

          <!-- Conversation Link -->
          <div v-if="post.conversationId" class="mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
            <div class="text-xs text-zinc-500 mb-1">Диалог создания</div>
            <a
              :href="`/app?conversation=${post.conversationId}`"
              class="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Открыть диалог
            </a>
          </div>

          <!-- Published Links -->
          <div v-if="post.status === 'published' && post.publishedLinks" class="mb-4">
            <div class="text-xs text-zinc-500 mb-2">Ссылки на публикации</div>
            <div class="space-y-2">
              <a
                v-for="(link, network) in post.publishedLinks"
                :key="network"
                :href="link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <!-- VK -->
                <svg v-if="network === 'vk'" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
                </svg>
                <!-- YouTube -->
                <svg v-else-if="network === 'youtube'" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <!-- Telegram -->
                <svg v-else-if="network === 'telegram'" class="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <!-- Instagram -->
                <svg v-else-if="network === 'instagram'" class="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                <span class="text-sm text-zinc-300">{{ networkLabels[network] }}</span>
                <svg class="w-4 h-4 text-zinc-500 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Add published link prompt for published posts without links -->
          <div v-else-if="post.status === 'published' && !post.publishedLinks" class="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-dashed border-zinc-700">
            <p class="text-xs text-zinc-500 text-center">
              Добавьте ссылки на опубликованные посты
            </p>
          </div>
        </template>
      </template>

      <!-- Preview Tab -->
      <template v-else-if="activeTab === 'preview'">
        <!-- Network selector -->
        <div class="flex gap-2 mb-4 flex-wrap">
          <button
            v-for="network in post.networks"
            :key="network"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm',
              previewNetwork === network
                ? 'bg-zinc-700 border-zinc-600 text-white'
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
            ]"
            @click="previewNetwork = network"
          >
            <!-- VK -->
            <svg v-if="network === 'vk'" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
            </svg>
            <!-- YouTube -->
            <svg v-else-if="network === 'youtube'" class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <!-- Telegram -->
            <svg v-else-if="network === 'telegram'" class="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <!-- Instagram -->
            <svg v-else-if="network === 'instagram'" class="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
            {{ networkLabels[network] }}
          </button>
        </div>

        <!-- Preview content -->
        <component
          :is="previewComponents[previewNetwork]"
          v-if="currentPreview"
          :preview="currentPreview"
          :image="post.image"
        />
        <div v-else class="text-center py-8 text-zinc-500">
          Превью для {{ networkLabels[previewNetwork] }} недоступно
        </div>
      </template>
    </div>

    <!-- Footer with status -->
    <div class="px-4 py-3 border-t border-zinc-800 flex items-center gap-2">
      <!-- Status icon -->
      <svg v-if="post.status === 'idea'" class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
      </svg>
      <svg v-else-if="post.status === 'draft'" class="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor"/>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else-if="post.status === 'ready'" class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="post.status === 'published'" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
      <span :class="['text-sm', statusInfo[post.status].class]">
        {{ statusInfo[post.status].label }}
      </span>
    </div>
  </aside>
</template>

<style scoped>
.confetti-particle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color);
  border-radius: 2px;
  animation: confetti-explode 2s ease-out forwards;
  animation-delay: var(--delay);
  transform-origin: center;
}

.confetti-particle:nth-child(odd) {
  border-radius: 50%;
  width: 8px;
  height: 8px;
}

.confetti-particle:nth-child(3n) {
  width: 6px;
  height: 12px;
  border-radius: 1px;
}

@keyframes confetti-explode {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  10% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.5) rotate(var(--rotation));
    opacity: 0;
  }
}

.success-glow {
  animation: success-pop 0.6s ease-out forwards;
}

@keyframes success-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.success-circle {
  stroke-dasharray: 63;
  stroke-dashoffset: 63;
  animation: draw-circle 0.4s ease-out 0.1s forwards;
}

.success-check {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check 0.3s ease-out 0.4s forwards;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
