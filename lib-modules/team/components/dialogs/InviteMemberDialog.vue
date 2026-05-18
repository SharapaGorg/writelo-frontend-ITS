<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

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
    errorMsg.value = t('teamPage.inviteDialog.emailInvalid')
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
        <DialogTitle>{{ t('teamPage.inviteDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('teamPage.inviteDialog.description') }}
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
          <Label>{{ t('teamPage.inviteDialog.roleLabel') }}</Label>
          <Select v-model="role">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{{ t('team.roles.admin') }}</SelectItem>
              <SelectItem value="editor">{{ t('team.roles.editor') }}</SelectItem>
              <SelectItem value="viewer">{{ t('team.roles.viewer') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">{{ t('teamPage.inviteDialog.cancel') }}</Button>
        <Button :disabled="submitting" @click="onSubmit">{{ t('teamPage.inviteDialog.submit') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
