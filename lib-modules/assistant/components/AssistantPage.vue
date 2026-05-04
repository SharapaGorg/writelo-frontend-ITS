<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces } from '~/lib-modules/workspaces'
import AssistantChat from './AssistantChat.vue'
import { useAssistantChat } from '../composables/useAssistantChat'

const route = useRoute()
const router = useRouter()
const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { reset } = useAssistantChat()

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})

function onNewChat() {
  reset()
  const { conv: _drop, ...rest } = route.query
  router.replace({ query: rest })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: 'Ассистент' }]"
      :show-workspace-selector="true"
    />

    <div class="flex min-h-0 flex-1">
      <div class="min-w-0 flex-1">
        <AssistantChat />
      </div>
      <aside class="hidden w-[260px] flex-col border-l border-border lg:flex">
        <div class="space-y-2 border-b border-border p-2">
          <Button class="w-full justify-start" variant="outline" size="sm" @click="onNewChat">
            <Plus class="mr-2 h-4 w-4" /> Новый чат
          </Button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 text-xs text-muted-foreground">
          Phase 2: список диалогов
        </div>
      </aside>
    </div>
  </div>
</template>
