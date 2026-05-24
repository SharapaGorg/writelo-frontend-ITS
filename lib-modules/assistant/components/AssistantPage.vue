<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppNavbar } from '~/lib-modules/app-layout'
import { useWorkspaces } from '~/lib-modules/workspaces'
import { useViewport } from '~/composables/useViewport'
import TabStrip from '~/components/molecules/TabStrip.vue'
import AssistantChat from './AssistantChat.vue'
import AssistantHistoryPanel from './AssistantHistoryPanel.vue'

const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()
const { t } = useI18n()
const { isMobile } = useViewport()

type Tab = 'chat' | 'history'
const activeTab = ref<Tab>('chat')

const tabs = computed(() => [
  { id: 'chat' as const, label: t('assistantPage.tabs.chat') },
  { id: 'history' as const, label: t('assistantPage.tabs.history') },
])

onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})
</script>

<template>
  <div class="flex h-full flex-col">
    <AppNavbar
      :breadcrumbs="[{ label: t('assistantPage.breadcrumb') }]"
    />

    <div v-if="isMobile" class="px-3 py-2 border-b border-border">
      <TabStrip :tabs="tabs" v-model="activeTab" />
    </div>

    <div class="flex min-h-0 flex-1">
      <div
        v-show="!isMobile || activeTab === 'chat'"
        class="min-w-0 flex-1"
      >
        <AssistantChat />
      </div>
      <div
        v-show="isMobile ? activeTab === 'history' : true"
        :class="isMobile ? 'flex-1 w-full' : 'hidden lg:flex w-[260px] border-l border-border'"
      >
        <AssistantHistoryPanel />
      </div>
    </div>
  </div>
</template>
