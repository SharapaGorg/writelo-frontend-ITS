<template>
  <Button
      variant="ghost"
      size="sm"
      class="flex-shrink-0 px-3 py-1.5 text-sm font-medium transition-all"
      :class="isSelected
      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50'
      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50'"
      @click="$emit('click')"
  >
    {{ t('all_chats') || 'All Chats' }}
  </Button>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'

const { t } = useI18n()

defineProps<{
  isSelected: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
