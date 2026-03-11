<script setup lang="ts">

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {computed} from 'vue';
import {eraseConversationTitle} from "../helpers/formatting";

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
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <slot/>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('removeDialog.header') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t('removeDialog.message', {dialogTitle: resultDialogTitle}) }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t('removeDialog.cancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="emit('approve')">{{ $t('removeDialog.continue') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>