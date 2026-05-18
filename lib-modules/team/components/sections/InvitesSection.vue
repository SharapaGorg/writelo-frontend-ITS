<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
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
import type { WorkspaceInviteDto, WorkspaceInviteRole } from '../../types'

const props = defineProps<{
  invites: WorkspaceInviteDto[]
  canManageInvites: boolean
}>()

const emit = defineEmits<{
  (e: 'revoke', inviteId: string): void
}>()

const { t } = useI18n()

const revokeOpen = ref(false)
const revokeTarget = ref<WorkspaceInviteDto | null>(null)
function askRevoke(i: WorkspaceInviteDto) {
  revokeTarget.value = i
  revokeOpen.value = true
}
function confirmRevoke() {
  if (revokeTarget.value) emit('revoke', revokeTarget.value.id)
  revokeOpen.value = false
  revokeTarget.value = null
}

const roleLabel = computed<Record<WorkspaceInviteRole, string>>(() => ({
  admin: t('team.roles.admin'),
  editor: t('team.roles.editor'),
  viewer: t('team.roles.viewer'),
}))

function expiresIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return t('teamPage.invites.expired')
  const days = Math.ceil(ms / 86400000)
  if (days === 1) return t('teamPage.invites.expiresInOne', { days })
  if (days < 5) return t('teamPage.invites.expiresInFew', { days })
  return t('teamPage.invites.expiresInMany', { days })
}
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-medium text-muted-foreground">{{ t('teamPage.invites.title') }}</h2>
    <div v-if="!invites.length" class="rounded-md border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
      {{ t('teamPage.invites.empty') }}
    </div>
    <div v-else class="rounded-md border bg-card divide-y">
      <div v-for="i in invites" :key="i.id" class="flex items-center gap-3 px-4 py-3">
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium truncate">{{ i.email }}</div>
          <div class="text-xs text-muted-foreground">{{ expiresIn(i.expiresAt) }}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground whitespace-nowrap">
          {{ roleLabel[i.role] }}
        </span>
        <Button
          v-if="canManageInvites"
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click="askRevoke(i)"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <AlertDialog v-model:open="revokeOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('teamPage.invites.revokeDialog.title') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('teamPage.invites.revokeDialog.description', { email: revokeTarget?.email ?? '' }) }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('teamPage.invites.revokeDialog.cancel') }}</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground" @click="confirmRevoke">
            {{ t('teamPage.invites.revokeDialog.confirm') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
