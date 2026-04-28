<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, ChevronDown, UserCog, ArrowRightLeft } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu'
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
import { useWorkspacePermissions } from '~/lib-modules/workspaces'
import type { WorkspaceMemberDto, WorkspaceRole } from '../../types'
import TransferOwnershipDialog from '../dialogs/TransferOwnershipDialog.vue'

const props = defineProps<{
  members: WorkspaceMemberDto[]
}>()

const emit = defineEmits<{
  (e: 'updateRole', userId: string, role: WorkspaceRole): void
  (e: 'remove', userId: string): void
  (e: 'transfer', userId: string): void
}>()

const {
  getAssignableRoles,
  canRemoveMember,
  canChangeMemberRole,
  canTransferOwnershipTo,
} = useWorkspacePermissions()

const removeOpen = ref(false)
const removeTarget = ref<WorkspaceMemberDto | null>(null)
function askRemove(m: WorkspaceMemberDto) {
  removeTarget.value = m
  removeOpen.value = true
}
function confirmRemove() {
  if (removeTarget.value) emit('remove', removeTarget.value.userId)
  removeOpen.value = false
  removeTarget.value = null
}

const transferOpen = ref(false)
const transferTarget = ref<WorkspaceMemberDto | null>(null)
function askTransfer(m: WorkspaceMemberDto) {
  transferTarget.value = m
  transferOpen.value = true
}
function confirmTransfer() {
  if (transferTarget.value) emit('transfer', transferTarget.value.userId)
  transferOpen.value = false
  transferTarget.value = null
}

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Зритель',
}

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-medium text-muted-foreground">Участники</h2>
    <div class="rounded-md border bg-card divide-y">
      <div
        v-for="m in members"
        :key="m.userId"
        class="flex items-center gap-3 px-4 py-3"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {{ initials(m.name) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium truncate">{{ m.name }}</div>
          <div class="text-xs text-muted-foreground truncate">{{ m.email ?? '—' }}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground whitespace-nowrap">
          {{ ROLE_LABEL[m.role] }}
        </span>

        <DropdownMenu
          v-if="canChangeMemberRole(m) || canRemoveMember(m) || canTransferOwnershipTo(m)"
        >
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <ChevronDown class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub v-if="getAssignableRoles(m).length > 0">
              <DropdownMenuSubTrigger>
                <UserCog class="mr-2 h-4 w-4" />
                <span>Сменить роль</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  v-for="r in getAssignableRoles(m)"
                  :key="r"
                  :disabled="r === m.role"
                  @select="emit('updateRole', m.userId, r)"
                >
                  {{ ROLE_LABEL[r] }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              v-if="canTransferOwnershipTo(m)"
              @select="askTransfer(m)"
            >
              <ArrowRightLeft class="mr-2 h-4 w-4" />
              Передать владение…
            </DropdownMenuItem>
            <DropdownMenuSeparator
              v-if="(canChangeMemberRole(m) || canTransferOwnershipTo(m)) && canRemoveMember(m)"
            />
            <DropdownMenuItem
              v-if="canRemoveMember(m)"
              class="text-destructive"
              @select="askRemove(m)"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <AlertDialog v-model:open="removeOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
          <AlertDialogDescription>
            «{{ removeTarget?.name }}» потеряет доступ к воркспейсу.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground" @click="confirmRemove">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <TransferOwnershipDialog
      v-model:open="transferOpen"
      :target="transferTarget"
      @confirm="confirmTransfer"
    />
  </section>
</template>
