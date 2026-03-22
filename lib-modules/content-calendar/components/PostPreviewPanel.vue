<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '~/components/ui/button'
import InstagramPreview from './previews/InstagramPreview.vue'
import VkPreview from './previews/VkPreview.vue'
import YouTubePreview from './previews/YouTubePreview.vue'
import TelegramPreview from './previews/TelegramPreview.vue'
import type { CalendarPost, SocialNetwork, PostStatus } from '../types'

const props = defineProps<{
  post: CalendarPost
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref<SocialNetwork>(props.post.networks[0])

watch(() => props.post, (newPost) => {
  if (!newPost.networks.includes(activeTab.value)) {
    activeTab.value = newPost.networks[0]
  }
}, { immediate: true })

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

const statusInfo: Record<PostStatus, { icon: string; class: string; label: string }> = {
  idea: { icon: '○', class: 'text-gray-400', label: 'Идея' },
  draft: { icon: '◐', class: 'text-yellow-500', label: 'Черновик' },
  ready: { icon: '●', class: 'text-green-500', label: 'Готов к публикации' }
}

const currentPreview = computed(() => props.post.previews[activeTab.value])
</script>

<template>
  <aside class="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col">
    <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
      <h3 class="text-sm font-medium text-zinc-200">Превью поста</h3>
      <button class="text-zinc-500 hover:text-white transition-colors" @click="emit('close')">
        ✕
      </button>
    </div>
    <div class="flex gap-1 px-4 py-2 border-b border-zinc-800">
      <Button
        v-for="network in post.networks"
        :key="network"
        :variant="activeTab === network ? 'default' : 'ghost'"
        size="sm"
        @click="activeTab = network"
      >
        {{ networkLabels[network] }}
      </Button>
    </div>
    <div class="flex-1 overflow-y-auto p-4">
      <component
        :is="previewComponents[activeTab]"
        v-if="currentPreview"
        :preview="currentPreview"
        :image="post.image"
      />
      <div v-else class="text-center py-8 text-zinc-500">
        Превью недоступно
      </div>
    </div>
    <div class="px-4 py-3 border-t border-zinc-800 flex items-center gap-2">
      <span :class="statusInfo[post.status].class">
        {{ statusInfo[post.status].icon }}
      </span>
      <span class="text-sm text-zinc-400">
        {{ statusInfo[post.status].label }}
      </span>
    </div>
  </aside>
</template>
