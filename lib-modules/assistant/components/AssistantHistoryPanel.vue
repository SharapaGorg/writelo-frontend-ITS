<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Search, Plus } from 'lucide-vue-next'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { useAssistantHistory } from '../composables/useAssistantHistory'
import { useAssistantChat } from '../composables/useAssistantChat'
import { useAssistantStore } from '../stores/assistantStore'
import AssistantHistoryItem from './AssistantHistoryItem.vue'

const route = useRoute()
const router = useRouter()
const { currentWorkspace } = useWorkspaceContext()
const { items, search, setSearch, refresh, rename, remove } = useAssistantHistory()
const { reset } = useAssistantChat()
const store = useAssistantStore()

onMounted(refresh)

watch(
  () => currentWorkspace.value?.id,
  (id, prevId) => {
    if (!id || id === prevId) return
    // Workspace switched — current ?conv may belong to another workspace.
    if (route.query.conv) {
      const { conv: _drop, ...rest } = route.query
      router.replace({ query: rest })
      reset()
    }
    refresh()
  },
)

const activeId = computed(() =>
  typeof route.query.conv === 'string' ? route.query.conv : null,
)

function pick(id: string) {
  if (id === activeId.value) return
  router.replace({ query: { ...route.query, conv: id } })
}

function onNew() {
  reset()
  // Explicit "new chat" — drop last-active so a refresh keeps the empty state
  // instead of reopening the conversation the user just left.
  if (currentWorkspace.value?.id) {
    store.setLastActive(currentWorkspace.value.id, null)
  }
  const { conv: _drop, ...rest } = route.query
  router.replace({ query: rest })
}
</script>

<template>
  <aside class="hidden w-[260px] flex-col border-l border-border lg:flex">
    <div class="space-y-2 border-b border-border p-2">
      <Button class="w-full justify-start" variant="outline" size="sm" @click="onNew">
        <Plus class="mr-2 h-4 w-4" /> Новый чат
      </Button>
      <div class="relative">
        <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          :model-value="search"
          placeholder="Поиск..."
          class="h-8 pl-8 text-sm"
          @update:model-value="setSearch(String($event))"
        />
      </div>
    </div>
    <div class="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <AssistantHistoryItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :active="item.id === activeId"
        @click="pick(item.id)"
        @rename="(t) => rename(item.id, t)"
        @delete="remove(item.id)"
      />
      <div v-if="!items.length" class="p-2 text-xs text-muted-foreground">
        Нет диалогов. Напиши первое сообщение.
      </div>
    </div>
  </aside>
</template>
