<template>
  <Button
      id="add-project-button"
      variant="ghost"
      size="sm"
      class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 transition-all"
      @click="$emit('click')"
  >
    <Plus class="w-4 h-4" />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-vue-next'

defineEmits<{
  click: []
}>()
</script>
