<script setup lang="ts">
import type { SocialNetwork } from '../types'

const props = defineProps<{
  activeNetworks: SocialNetwork[]
}>()

const emit = defineEmits<{
  toggle: [network: SocialNetwork]
}>()

const networks: { id: SocialNetwork; label: string; color: string }[] = [
  { id: 'vk', label: 'VK', color: 'data-[state=on]:bg-blue-600' },
  { id: 'youtube', label: 'YouTube', color: 'data-[state=on]:bg-red-600' },
  { id: 'telegram', label: 'Telegram', color: 'data-[state=on]:bg-sky-500' },
  { id: 'instagram', label: 'Instagram', color: 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500 data-[state=on]:to-pink-500' }
]

function isActive(network: SocialNetwork): boolean {
  return props.activeNetworks.includes(network)
}
</script>

<template>
  <div class="flex items-center gap-2 px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
    <span class="text-sm text-zinc-500 mr-2">Соцсети:</span>
    <button
      v-for="network in networks"
      :key="network.id"
      :class="[
        'px-3 py-1.5 text-sm rounded-full border transition-all',
        isActive(network.id)
          ? `${network.color} border-transparent text-white`
          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
      ]"
      :data-state="isActive(network.id) ? 'on' : 'off'"
      @click="emit('toggle', network.id)"
    >
      {{ network.label }}
    </button>
  </div>
</template>
