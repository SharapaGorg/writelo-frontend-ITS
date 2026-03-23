<script setup lang="ts">
import {computed} from 'vue';
import {eraseConversationTitle} from "../helpers/formatting";

const isOpen = ref<boolean>(false);

const props = defineProps<{
  dialogTitle: string
}>();

const emit = defineEmits<{
  (e: "approve"): void
}>();

const resultDialogTitle = computed(() => {
  return eraseConversationTitle(props.dialogTitle);
})

</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot/>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('removeTask.header') }}</DialogTitle>
        <DialogDescription>
          {{ $t('removeTask.message', {dialogTitle: resultDialogTitle}) }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
          <Button variant="outline">{{ $t('removeTask.cancel') }}</Button>
        </DialogClose>
        <Button @click="emit('approve'); isOpen = false">{{ $t('removeTask.continue') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>