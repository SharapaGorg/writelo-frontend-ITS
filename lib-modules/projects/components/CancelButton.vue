<template>
  <Button
      variant="ghost"
      size="sm"
      class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
      @click="$emit('click')"
  >
    <X class="w-4 h-4" />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { X } from 'lucide-vue-next'

defineEmits<{
  click: []
}>()
</script>
