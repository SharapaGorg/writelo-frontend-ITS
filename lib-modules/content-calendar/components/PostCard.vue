<script setup lang="ts">
import type { CalendarPost, SocialNetwork, PostStatus, ContentType, ContentTag } from '../types'

const props = defineProps<{
  post: CalendarPost
  projectTags: ContentTag[]
}>()

const emit = defineEmits<{
  select: [postId: string]
}>()

const typeStyles: Record<ContentType, string> = {
  post: 'bg-blue-500/20 border-blue-500',
  story: 'bg-purple-500/20 border-purple-500',
  reels: 'bg-pink-500/20 border-pink-500'
}

const typeLabels: Record<ContentType, string> = {
  post: 'Пост',
  story: 'Сторис',
  reels: 'Рилс'
}

const statusLabels: Record<PostStatus, { class: string; label: string }> = {
  idea: { class: 'text-gray-400', label: 'Идея' },
  draft: { class: 'text-yellow-500', label: 'Черновик' },
  ready: { class: 'text-green-500', label: 'Готов' }
}

const networkIcons: Record<SocialNetwork, string> = {
  vk: 'VK',
  youtube: 'YT',
  telegram: 'TG',
  instagram: 'IG'
}

// Get tag objects for this post
const postTags = computed(() =>
  props.post.tags
    .map(tagId => props.projectTags.find(t => t.id === tagId))
    .filter((t): t is ContentTag => !!t)
)
</script>

<template>
  <button
    :class="[
      'w-full p-3 rounded-lg border text-left transition-all hover:scale-[1.02]',
      typeStyles[post.type]
    ]"
    @click="emit('select', post.id)"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs text-zinc-400">{{ typeLabels[post.type] }}</span>
      <div class="flex gap-1">
        <span
          v-for="network in post.networks"
          :key="network"
          class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
        >
          {{ networkIcons[network] }}
        </span>
      </div>
    </div>
    <h4 class="text-sm font-medium text-zinc-100 mb-2 line-clamp-2">
      {{ post.title }}
    </h4>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <!-- Idea: lightbulb -->
        <svg v-if="post.status === 'idea'" :class="['w-4 h-4', statusLabels[post.status].class]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
        </svg>
        <!-- Draft: half-filled circle -->
        <svg v-else-if="post.status === 'draft'" :class="['w-4 h-4', statusLabels[post.status].class]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor"/>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
        <!-- Ready: checkmark in circle -->
        <svg v-else-if="post.status === 'ready'" :class="['w-4 h-4', statusLabels[post.status].class]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-xs text-zinc-500">
          {{ statusLabels[post.status].label }}
        </span>
      </div>
      <!-- Tags -->
      <div v-if="postTags.length > 0" class="flex gap-1">
        <span
          v-for="tag in postTags"
          :key="tag.id"
          :class="['w-2 h-2 rounded-full', tag.color]"
          :title="tag.name"
        />
      </div>
    </div>
  </button>
</template>
