<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib-modules/utils'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import type { ConversationListItemDto } from '~/scripts/shared/types/workspace'
import { useAssistantStore } from '../stores/assistantStore'

const props = defineProps<{
  item: ConversationListItemDto
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'rename', title: string): void
  (e: 'delete'): void
}>()

const { t } = useI18n()

const renameOpen = ref(false)
const deleteOpen = ref(false)
const renameTitle = ref('')
const renameInput = ref<HTMLInputElement | null>(null)

// Backend creates conversations with a placeholder title and replaces it once
// the async title-generation worker finishes. We track that explicitly via the
// store (set on create, cleared on title_generated / response_end) so that
// older conversations that legitimately have title "Untitled" are not treated
// as still-generating.
const store = useAssistantStore()
const { currentWorkspace } = useWorkspaceContext()
const titlePending = computed(() => {
  const wid = currentWorkspace.value?.id
  if (!wid) return false
  return store.isTitlePending(wid, props.item.id)
})

function startRename() {
  renameTitle.value = props.item.title ?? ''
  renameOpen.value = true
  nextTick(() => {
    const el = renameInput.value as any
    el?.focus?.()
    el?.select?.()
  })
}

function confirmRename() {
  const tt = renameTitle.value.trim()
  if (tt && tt !== (props.item.title ?? '')) {
    emit('rename', tt.slice(0, 64))
  }
  renameOpen.value = false
}

function confirmDelete() {
  emit('delete')
  deleteOpen.value = false
}
</script>

<template>
  <div
    :class="cn(
      'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent',
      active && 'bg-accent',
    )"
    @click="emit('click')"
  >
    <span v-if="!titlePending" class="flex-1 truncate">{{ item.title || t('assistantPage.untitled') }}</span>
    <span v-else class="title-skeleton flex-1"></span>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
          @click.stop
        >
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="startRename">
          <Pencil class="mr-2 h-4 w-4" /> {{ t('assistantPage.rename') }}
        </DropdownMenuItem>
        <DropdownMenuItem class="text-destructive focus:text-destructive" @click="deleteOpen = true">
          <Trash2 class="mr-2 h-4 w-4" /> {{ t('assistantPage.delete') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <AlertDialog v-model:open="renameOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('assistantPage.renameDialog.title') }}</AlertDialogTitle>
      </AlertDialogHeader>
      <Input
        ref="renameInput"
        v-model="renameTitle"
        :maxlength="64"
        :placeholder="t('assistantPage.renameDialog.placeholder')"
        @keydown.enter="confirmRename"
      />
      <AlertDialogFooter>
        <AlertDialogCancel>{{ t('assistantPage.renameDialog.cancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="confirmRename">{{ t('assistantPage.renameDialog.save') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('assistantPage.deleteDialog.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('assistantPage.deleteDialog.description') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ t('assistantPage.deleteDialog.cancel') }}</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="confirmDelete"
        >
          {{ t('assistantPage.deleteDialog.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped>
.title-skeleton {
  @apply h-3 max-w-[140px] rounded bg-muted-foreground/30;
  animation: title-pulse 1.4s ease-in-out infinite;
}

@keyframes title-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
