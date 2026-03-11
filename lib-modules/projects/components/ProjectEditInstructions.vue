<template>
  <TextAreaModal
      title="editProjectInstructions.header"
      description="editProjectInstructions.sub-header"
      placeholder="editProjectInstructions.placeholder"
      :open="open"
      :initial-value="project?.customInstructions || ''"
      @update:open="handleOpenChange"
      @save="handleSave"
      id="project-edit-instructions-modal"
  />
</template>

<script setup lang="ts">
import type {StoreProject} from '../types'
import {TextAreaModal} from "~/components/molecules/modals";

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