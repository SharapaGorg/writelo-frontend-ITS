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
        <span class="truncate">{{ currentClientName }}</span>
        <ChevronDown class="w-3 h-3 flex-shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-56" align="center">
      <DropdownMenuLabel>{{ $t('clientSelector.header') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        @click="selectClient(null)"
        class="cursor-pointer"
        :class="{ 'bg-accent': projectsStore.selectedProjectId === null }"
      >
        <Inbox class="w-4 h-4 mr-2" />
        {{ $t('all_chats') }}
      </DropdownMenuItem>

      <DropdownMenuSeparator v-if="projectsStore.projects.length > 0" />

      <div class="max-h-[300px] overflow-y-auto">
        <DropdownMenuItem
          v-for="client in projectsStore.projects"
          :key="client.id"
          @click="selectClient(client.id)"
          class="cursor-pointer"
          :class="{ 'bg-accent': projectsStore.selectedProjectId === client.id }"
        >
          <User class="w-4 h-4 mr-2 flex-shrink-0" />
          <span class="truncate">{{ client.title }}</span>
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
import { Users, User, ChevronDown, Inbox, Plus } from 'lucide-vue-next'
import { useProjectsStore } from '~/lib-modules/projects'
import { useCurrentConversation } from '~/lib-modules/conversations'

const props = withDefaults(defineProps<{
  highlighted?: boolean
}>(), {
  highlighted: false
})

const { t } = useI18n()
const projectsStore = useProjectsStore()
const { makeNewChat } = useCurrentConversation()

const emit = defineEmits<{
  openCreate: []
}>()

const currentClientName = computed(() => {
  if (!projectsStore.selectedProjectId) {
    return t('all_chats')
  }
  const client = projectsStore.projects.find(p => p.id === projectsStore.selectedProjectId)
  return client?.title || t('all_chats')
})

const selectClient = (clientId: string | null) => {
  const wasChanged = projectsStore.selectedProjectId !== clientId
  projectsStore.selectProject(clientId)

  // Open new chat when switching clients
  if (wasChanged) {
    makeNewChat()
  }
}

const openCreateClient = () => {
  emit('openCreate')
}
</script>
