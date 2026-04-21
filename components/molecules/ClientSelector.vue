<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        class="max-w-[180px] gap-x-1.5"
        :class="{ 'ring-2 ring-primary ring-offset-2 ring-offset-background': highlighted }"
      >
        <Users class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ currentWorkspaceName }}</span>
        <ChevronDown class="w-3 h-3 flex-shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56" align="center">
      <DropdownMenuLabel>{{ $t('clientSelector.header') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <div class="max-h-[300px] overflow-y-auto">
        <DropdownMenuItem
          v-for="workspace in workspaces"
          :key="workspace.id"
          @click="selectWorkspace(workspace.id)"
          class="cursor-pointer"
          :class="{ 'bg-accent': currentWorkspaceId === workspace.id }"
        >
          <User class="w-4 h-4 mr-2 flex-shrink-0" />
          <span class="truncate">{{ workspace.name }}</span>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />
      <DropdownMenuItem @click="openCreateClient" class="cursor-pointer">
        <Plus class="w-4 h-4 mr-2" />
        {{ $t('clientSelector.addNew') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Users, User, ChevronDown, Plus } from 'lucide-vue-next'
import { useWorkspaces } from '~/lib-modules/workspaces'
import { useCurrentConversation } from '~/lib-modules/conversations'

withDefaults(defineProps<{
  highlighted?: boolean
}>(), {
  highlighted: false
})

const { t } = useI18n()
const { workspaces, currentWorkspaceId, selectWorkspace: setWorkspace } = useWorkspaces()
const { makeNewChat } = useCurrentConversation()

const emit = defineEmits<{
  openCreate: []
}>()

const currentWorkspaceName = computed(() => {
  const current = workspaces.value.find(w => w.id === currentWorkspaceId.value)
  return current?.name || t('clientSelector.header')
})

const selectWorkspace = (workspaceId: string) => {
  const wasChanged = currentWorkspaceId.value !== workspaceId
  setWorkspace(workspaceId)

  if (wasChanged) {
    makeNewChat()
  }
}

const openCreateClient = () => {
  emit('openCreate')
}
</script>
