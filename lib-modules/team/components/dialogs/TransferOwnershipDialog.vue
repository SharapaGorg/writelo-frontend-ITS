<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import type { WorkspaceMemberDto } from '../../types'

const props = defineProps<{ open: boolean; target: WorkspaceMemberDto | null }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
}>()

const typed = ref('')

watch(
  () => props.open,
  v => {
    if (v) typed.value = ''
  },
)

const matches = computed(
  () => !!props.target?.email && typed.value.trim().toLowerCase() === props.target.email.toLowerCase(),
)
</script>

<template>
  <AlertDialog :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Передать владение?</AlertDialogTitle>
        <AlertDialogDescription>
          «{{ target?.name }}» станет владельцем воркспейса. Вы потеряете права владельца —
          вероятнее всего, останетесь администратором (точное поведение определяется бэком).
          Действие необратимо без обратной передачи нового владельца.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="space-y-2">
        <Label for="confirm-email">Введите email нового владельца, чтобы подтвердить</Label>
        <Input
          id="confirm-email"
          v-model="typed"
          type="email"
          :placeholder="target?.email ?? ''"
          autocomplete="off"
        />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction
          :disabled="!matches"
          class="bg-destructive text-destructive-foreground disabled:opacity-50"
          @click="emit('confirm')"
        >
          Передать владение
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
