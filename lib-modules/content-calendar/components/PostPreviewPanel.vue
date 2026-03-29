<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2, Send } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog'
import InstagramPreview from './previews/InstagramPreview.vue'
import VkPreview from './previews/VkPreview.vue'
import YouTubePreview from './previews/YouTubePreview.vue'
import TelegramPreview from './previews/TelegramPreview.vue'
import CelebrationEffect from '~/lib-modules/content-editor/components/CelebrationEffect.vue'
import type { CalendarPost, SocialNetwork, PostStatus, ContentTag, SocialAccount } from '../types'

const props = defineProps<{
  post: CalendarPost
  projectTags: ContentTag[]
  accounts: SocialAccount[]
}>()

const emit = defineEmits<{
  close: []
  delete: []
  publish: []
}>()

const router = useRouter()

// Get post account
const postAccount = computed(() => {
  return props.accounts.find(a => a.id === props.post.accountId)
})

// Get network from account
const postNetwork = computed((): SocialNetwork | null => {
  return postAccount.value?.network || null
})

const isPublished = computed(() => props.post.status === 'published')

// Get display images
const displayImages = computed(() => {
  if (props.post.images && props.post.images.length > 0) {
    return props.post.images
  }
  if (props.post.image) {
    return [props.post.image]
  }
  return []
})

// Get display content
const displayContent = computed(() => {
  return props.post.content || props.post.description || ''
})

// Get tag objects for this post
const postTags = computed(() =>
  props.post.tags
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

const statusInfo: Record<PostStatus, { label: string; class: string }> = {
  idea: { label: 'Идея', class: 'text-gray-400' },
  draft: { label: 'Черновик', class: 'text-yellow-500' },
  ready: { label: 'Готов к публикации', class: 'text-green-500' },
  published: { label: 'Опубликован', class: 'text-blue-500' }
}

function navigateToEditor() {
  router.push(`/app/editor/${props.post.id}`)
}

function confirmDelete() {
  emit('delete')
}

// Publish functionality
const showPublishDialog = ref(false)
const showCelebration = ref(false)
const isPublishing = ref(false)

const canPublish = computed(() => props.post.status === 'ready')

async function handlePublish() {
  isPublishing.value = true

  // TODO: Call actual publish API here
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call

  emit('publish')
  isPublishing.value = false
  showPublishDialog.value = false
  showCelebration.value = true
}
</script>

<template>
  <aside class="w-full h-full bg-zinc-900 flex flex-col relative overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <h3 class="flex-1 min-w-0 text-sm font-medium text-zinc-200 truncate">{{ post.title }}</h3>
      <button
        class="flex-shrink-0 text-zinc-500 hover:text-white transition-colors p-1"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Action buttons bar -->
    <div class="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex gap-2">
      <button
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
        @click="navigateToEditor"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Редактировать
      </button>
      <button
        class="flex items-center justify-center p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 text-zinc-500 dark:text-zinc-400 hover:text-white text-sm transition-colors"
        title="Удалить пост"
        @click="confirmDelete"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 min-h-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
      <!-- Account info -->
      <div v-if="postAccount" class="mb-4 flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
        <!-- Network icon -->
        <svg v-if="postNetwork === 'vk'" class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
        </svg>
        <svg v-else-if="postNetwork === 'youtube'" class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <svg v-else-if="postNetwork === 'telegram'" class="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <svg v-else-if="postNetwork === 'instagram'" class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium text-zinc-200 block truncate">{{ postAccount.name }}</span>
          <span class="text-xs text-zinc-500 block truncate">{{ postAccount.username }}</span>
        </div>
      </div>

      <!-- Images -->
      <div v-if="displayImages.length > 0" class="mb-4">
        <div v-if="displayImages.length === 1" class="rounded-lg overflow-hidden">
          <img :src="displayImages[0]" :alt="post.title" class="w-full h-auto" />
        </div>
        <div v-else class="grid grid-cols-2 gap-2">
          <div
            v-for="(img, idx) in displayImages"
            :key="img"
            class="rounded-lg overflow-hidden aspect-square"
          >
            <img :src="img" :alt="`${post.title} ${idx + 1}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Text Content -->
      <div v-if="displayContent" class="mb-4">
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

      <!-- Published Link -->
      <div v-if="isPublished && post.publishedLink" class="mb-4">
        <div class="text-xs text-zinc-500 mb-2">Ссылка на публикацию</div>
        <a
          :href="post.publishedLink"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
        >
          <!-- Network icon -->
          <svg v-if="postNetwork === 'vk'" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.365 1.26 2.178 1.818.616.422 1.084.33 1.084.33l2.178-.03s1.14-.07.598-.962c-.044-.073-.316-.659-1.627-1.861-1.372-1.26-1.188-1.055.464-3.233.996-1.356 1.47-2.184 1.338-2.537-.125-.337-.907-.248-.907-.248l-2.45.015s-.182-.025-.316.056c-.132.078-.216.263-.216.263s-.388 1.031-.904 1.908c-1.092 1.852-1.528 1.95-1.706 1.836-.416-.267-.312-1.074-.312-1.646 0-1.79.272-2.535-.529-2.728-.266-.065-.461-.107-1.14-.114-.87-.01-1.606.003-2.023.207-.278.136-.492.439-.362.457.162.022.529.1.724.364.252.343.243 1.113.243 1.113s.145 2.106-.337 2.368c-.332.18-.786-.187-1.762-1.867-.5-.86-.878-1.81-.878-1.81s-.073-.178-.203-.273c-.158-.116-.378-.153-.378-.153l-2.327.015s-.35.01-.478.162c-.114.135-.009.414-.009.414s1.825 4.267 3.893 6.417c1.896 1.972 4.046 1.842 4.046 1.842h.975z"/>
          </svg>
          <svg v-else-if="postNetwork === 'youtube'" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <svg v-else-if="postNetwork === 'telegram'" class="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <svg v-else-if="postNetwork === 'instagram'" class="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
          <span class="text-sm text-zinc-300 flex-1">{{ postNetwork ? networkLabels[postNetwork] : 'Открыть' }}</span>
          <svg class="w-4 h-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>

      <!-- Date & Time -->
      <div class="mb-4 text-sm text-zinc-400">
        <span>{{ post.date }}</span>
        <span v-if="post.time"> в {{ post.time }}</span>
      </div>
    </div>

    <!-- Footer with status and publish button -->
    <div class="px-4 py-3 border-t border-zinc-800 flex items-center gap-2">
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
      <span :class="['text-sm flex-1', statusInfo[post.status].class]">
        {{ statusInfo[post.status].label }}
      </span>

      <!-- Publish button when ready -->
      <Button
        v-if="canPublish"
        size="sm"
        @click="showPublishDialog = true"
        class="gap-1.5 bg-green-600 hover:bg-green-700"
      >
        <Send class="h-3.5 w-3.5" />
        Опубликовать
      </Button>
    </div>

    <!-- Publish confirmation dialog -->
    <AlertDialog :open="showPublishDialog" @update:open="showPublishDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Опубликовать пост?</AlertDialogTitle>
          <AlertDialogDescription>
            Пост будет опубликован в выбранной социальной сети. Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isPublishing">Отмена</AlertDialogCancel>
          <AlertDialogAction
            @click="handlePublish"
            :disabled="isPublishing"
            class="bg-green-600 hover:bg-green-700"
          >
            <Loader2 v-if="isPublishing" class="h-4 w-4 animate-spin mr-2" />
            Опубликовать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Celebration effect -->
    <CelebrationEffect v-if="showCelebration" @complete="showCelebration = false" />
  </aside>
</template>

<style scoped>
/* No custom styles needed */
</style>