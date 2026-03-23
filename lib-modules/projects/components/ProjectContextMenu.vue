<template>
  <ContextMenuContent class="w-fit">
    <div id="project-context-menu">
      <ContextMenuItem @click="$emit('rename')" class="cursor-pointer">
        <Edit2 class="mr-2 h-4 w-4"/>
        {{ t('renameClient.header') }}
      </ContextMenuItem>

      <ContextMenuItem @click="$emit('editInstructions')" class="cursor-pointer">
        <Cog class="mr-2 h-4 w-4"/>
        {{ t('editClientInstructions.context-button') }}
      </ContextMenuItem>

      <ContextMenuItem
          @click="$emit('delete')"
          class="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
      >
        <Trash2 class="mr-2 h-4 w-4"/>
        {{ t('removeClient.header') }}
      </ContextMenuItem>
    </div>
  </ContextMenuContent>


</template>

<script setup lang="ts">
import {ContextMenuContent, ContextMenuItem} from '~/components/ui/context-menu'
import {Edit2, Trash2, Cog} from 'lucide-vue-next'

const {t} = useI18n()

defineEmits<{
  rename: []
  delete: [],
  editInstructions: []
}>()
</script>
