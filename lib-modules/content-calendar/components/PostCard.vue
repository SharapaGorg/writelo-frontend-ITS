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

const statusIcons: Record<PostStatus, { icon: string; class: string; label: string }> = {
  idea: { icon: '○', class: 'text-gray-400', label: 'Идея' },
  draft: { icon: '◐', class: 'text-yellow-500', label: 'Черновик' },
  ready: { icon: '●', class: 'text-green-500', label: 'Готов' }
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
        <span :class="statusIcons[post.status].class">
          {{ statusIcons[post.status].icon }}
        </span>
        <span class="text-xs text-zinc-500">
          {{ statusIcons[post.status].label }}
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
