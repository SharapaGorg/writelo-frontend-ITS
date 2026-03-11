<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <div class="flex flex-col gap-y-4" id="project-create-modal">
        <DialogHeader>
          <DialogTitle>{{ t('addProject.header') }}</DialogTitle>
          <DialogDescription>
            {{ t('addProject.sub-header') }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Input
                v-model="projectName"
                :placeholder="t('addProject.placeholder')"
                class="flex-1"
                @keyup.enter="handleSave"
                ref="nameInput"
            />
          </div>
        </div>

        <DialogFooter class="flex-col-reverse sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline">{{ t('cancel') }}</Button>
          </DialogClose>
          <Button @click="handleSave" :disabled="!projectName.trim()">
            {{ t('addProject.action-button') }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick} from 'vue'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

const {t} = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [name: string]
}>()

const projectName = ref('')
const nameInput = ref<HTMLInputElement>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const handleSave = () => {
  if (projectName.value.trim()) {
    emit('save', projectName.value.trim())
    isOpen.value = false
  }
}
</script>