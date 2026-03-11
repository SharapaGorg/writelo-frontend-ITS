<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  projectTitle: string | undefined,
  open: boolean
}>();

const emit = defineEmits<{
  (e: "approve"): void,
  (e: "update:open", value: boolean): void
}>();

const {t} = useI18n();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

</script>

<template>
  <Dialog v-model:open="isOpen">
    <!--    <AlertDialogTrigger as-child>-->
    <!--      <slot/>-->
    <!--    </AlertDialogTrigger>-->
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('removeTask.header') }}</DialogTitle>
        <DialogDescription>
          {{ t('removeClient.message', {projectTitle: projectTitle}) }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
          <Button variant="outline">{{ t('removeTask.cancel') }}</Button>
        </DialogClose>
        <Button @click="emit('approve'); isOpen = false">{{ t('removeTask.continue') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>