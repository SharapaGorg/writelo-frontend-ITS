<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { AppNavbar } from '~/lib-modules/app-layout'

const { t } = useI18n()
import { useWorkspaceContext, useWorkspaces } from '~/lib-modules/workspaces'
import MembersSection from './sections/MembersSection.vue'
import InvitesSection from './sections/InvitesSection.vue'
import InviteMemberDialog from './dialogs/InviteMemberDialog.vue'
import { useTeam } from '../composables/useTeam'

// Деструктуризация — обязательна, иначе свойства x.foo в шаблоне передаются
// как Ref-объекты, не auto-unwrap'нутые (Vue auto-unwrap работает только
// на top-level setup-return именах).
const { currentWorkspaceId, currentWorkspace } = useWorkspaceContext()
const { workspaces, initialize: initializeWorkspaces } = useWorkspaces()

// На reload pinia-store с воркспейсами пустой — каждая страница, которой нужны
// workspaces, бутстрапит сама (см. ContentCalendarPage / WorkspacesListPage).
onMounted(async () => {
  if (workspaces.value.length === 0) await initializeWorkspaces()
})
const {
  members,
  invites,
  loading,
  canManageInvites,
  loadAll,
  inviteMember,
  revokeInvite,
  updateMemberRole,
  removeMember,
  transferOwnership,
} = useTeam()

const inviteOpen = ref(false)

const workspaceName = computed(() => currentWorkspace.value?.name ?? '')

// На reload currentWorkspaceId ещё может быть null — ждём через watch с immediate;
// как только id появится / поменяется в селекторе навбара, дёргаем loadAll.
watch(
  currentWorkspaceId,
  (id) => {
    if (id) loadAll()
  },
  { immediate: true },
)

async function onInvite(payload: { email: string; role: 'admin' | 'editor' | 'viewer' }) {
  const ok = await inviteMember(payload.email, payload.role)
  if (ok) inviteOpen.value = false
}
</script>

<template>
  <div class="flex flex-col h-full">
    <AppNavbar
      :breadcrumbs="[{ label: t('teamPage.breadcrumb') }]"
      :show-workspace-selector="true"
    >
      <template #actions>
        <Button v-if="currentWorkspaceId && canManageInvites" @click="inviteOpen = true">
          <Plus class="h-4 w-4 mr-2" /> {{ t('teamPage.inviteShort') }}
        </Button>
      </template>
    </AppNavbar>

    <div class="flex-1 overflow-auto">
      <div class="p-6 max-w-3xl mx-auto space-y-6">
        <header v-if="workspaceName">
          <h1 class="text-xl font-semibold">{{ workspaceName }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('teamPage.subtitle') }}</p>
        </header>

        <div
          v-if="!currentWorkspaceId"
          class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground"
        >
          {{ t('teamPage.selectBrand') }}
        </div>

        <div
          v-else-if="loading && !members.length"
          class="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground"
        >
          {{ t('teamPage.loading') }}
        </div>

        <template v-else>
          <MembersSection
            :members="members"
            @update-role="(uid, r) => updateMemberRole(uid, r)"
            @remove="uid => removeMember(uid)"
            @transfer="uid => transferOwnership(uid)"
          />
          <InvitesSection
            v-if="canManageInvites"
            :invites="invites"
            :can-manage-invites="canManageInvites"
            @revoke="id => revokeInvite(id)"
          />
        </template>

        <InviteMemberDialog v-model:open="inviteOpen" @submit="onInvite" />
      </div>
    </div>
  </div>
</template>
