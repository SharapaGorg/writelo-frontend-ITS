<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import type { WorkspaceInviteRole } from '../../types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'submit', payload: { email: string; role: WorkspaceInviteRole }): void
}>()

const email = ref('')
const role = ref<WorkspaceInviteRole>('editor')
const submitting = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  v => {
    if (v) {
      email.value = ''
      role.value = 'editor'
      errorMsg.value = ''
    }
  },
)

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function onSubmit() {
  errorMsg.value = ''
  if (!isEmail(email.value)) {
    errorMsg.value = 'Некорректный email'
    return
  }
  submitting.value = true
  emit('submit', { email: email.value, role: role.value })
  submitting.value = false
  // Закрытие диалога — задача родителя: TeamPage сам закрывает через v-model:open
  // когда useTeam.inviteMember вернул true.
}
</script>

<template>
  <Dialog :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Пригласить участника</DialogTitle>
        <DialogDescription>
          Отправим письмо со ссылкой-приглашением. Срок действия — 14 дней.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="invite-email">Email</Label>
          <Input
            id="invite-email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            autocomplete="off"
          />
          <p v-if="errorMsg" class="text-xs text-destructive">{{ errorMsg }}</p>
        </div>
        <div class="space-y-2">
          <Label>Роль</Label>
          <Select v-model="role">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="editor">Редактор</SelectItem>
              <SelectItem value="viewer">Зритель</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Отмена</Button>
        <Button :disabled="submitting" @click="onSubmit">Отправить</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
