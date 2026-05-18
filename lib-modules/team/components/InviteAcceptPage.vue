<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useUserController } from '~/composables/user'
import { useWorkspaceInvitesApi } from '../helpers/api'
import { toastInviteAccepted, toastInviteDeclined } from '../helpers/toasts'
import type { WorkspaceInvitePreviewDto, WorkspaceInviteRole, WorkspaceInviteStatus } from '../types'

const props = defineProps<{ token: string }>()

const router = useRouter()
const userController = useUserController()
const api = useWorkspaceInvitesApi()
const { t } = useI18n()

const loading = ref(true)
const error = ref(false)
const preview = ref<WorkspaceInvitePreviewDto | null>(null)
const acting = ref(false)

const roleLabel = computed<Record<WorkspaceInviteRole, string>>(() => ({
  admin: t('team.roles.admin'),
  editor: t('team.roles.editor'),
  viewer: t('team.roles.viewer'),
}))

const statusText = computed<Record<WorkspaceInviteStatus, string>>(() => ({
  pending: '',
  accepted: t('team.invite.statusText.accepted'),
  expired: t('team.invite.statusText.expired'),
  revoked: t('team.invite.statusText.revoked'),
}))

onMounted(async () => {
  try {
    preview.value = await api.getInvitePreview(props.token)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

function returnUrl() {
  return `/invite/${encodeURIComponent(props.token)}`
}

async function onAccept() {
  if (!userController.isAuthenticated()) {
    router.push(`/auth?return=${encodeURIComponent(returnUrl())}`)
    return
  }
  acting.value = true
  try {
    await api.acceptInvite(props.token)
    toastInviteAccepted(t)
    router.push('/app/workspaces')
  } finally {
    acting.value = false
  }
}

async function onDecline() {
  if (!userController.isAuthenticated()) {
    router.push(`/auth?return=${encodeURIComponent(returnUrl())}`)
    return
  }
  acting.value = true
  try {
    await api.declineInvite(props.token)
    toastInviteDeclined(t)
    router.push('/')
  } finally {
    acting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <template v-if="loading">
        <CardContent class="py-12 text-center text-muted-foreground">{{ t('team.invite.loading') }}</CardContent>
      </template>

      <template v-else-if="error || !preview">
        <CardHeader>
          <CardTitle>{{ t('team.invite.notFoundTitle') }}</CardTitle>
          <CardDescription>{{ t('team.invite.notFoundDesc') }}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button as-child variant="outline">
            <NuxtLink to="/">{{ t('team.invite.toHome') }}</NuxtLink>
          </Button>
        </CardFooter>
      </template>

      <template v-else-if="preview.status !== 'pending'">
        <CardHeader>
          <CardTitle>{{ preview.workspaceName }}</CardTitle>
          <CardDescription>{{ statusText[preview.status] }}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button as-child variant="outline">
            <NuxtLink to="/app">{{ t('team.invite.toApp') }}</NuxtLink>
          </Button>
        </CardFooter>
      </template>

      <template v-else>
        <CardHeader>
          <CardTitle>{{ t('team.invite.title', { name: preview.workspaceName }) }}</CardTitle>
          <CardDescription>
            {{ t('team.invite.description', { name: preview.invitedBy.name }) }}
            <strong>{{ roleLabel[preview.role] }}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-xs text-muted-foreground">
          {{ t('team.invite.expiresAt', { date: new Date(preview.expiresAt).toLocaleDateString() }) }}
        </CardContent>
        <CardFooter class="flex gap-2 justify-end">
          <Button variant="outline" :disabled="acting" @click="onDecline">{{ t('team.invite.decline') }}</Button>
          <Button :disabled="acting" @click="onAccept">{{ t('team.invite.accept') }}</Button>
        </CardFooter>
      </template>
    </Card>
  </div>
</template>
