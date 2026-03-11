<template>
  <SmallTextFieldModal
      title="renameProject.header"
      description="renameProject.new-title"
      placeholder="project-name"
      :open="open"
      :initial-value="project?.title || ''"
      @update:open="handleOpenChange"
      @save="handleSave"
  />
</template>

<script setup lang="ts">
import SmallTextFieldModal from "~/components/molecules/modals/SmallTextFieldModal.vue";
import type {StoreProject} from '../types'

const props = defineProps<{
  project: StoreProject | null
  open: boolean
}>();

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [name: string]
}>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value);
}

const handleSave = (name: string) => {
  emit('save', name);
}
</script>