<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const loading = ref(true)
const error = ref(false)
const preview = ref<WorkspaceInvitePreviewDto | null>(null)
const acting = ref(false)

const ROLE_LABEL: Record<WorkspaceInviteRole, string> = {
  admin: 'Администратор',
  editor: 'Редактор',
  viewer: 'Зритель',
}

const STATUS_TEXT: Record<WorkspaceInviteStatus, string> = {
  pending: '',
  accepted: 'Вы уже приняли это приглашение.',
  expired: 'Срок действия приглашения истёк.',
  revoked: 'Приглашение было отозвано.',
}

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
    toastInviteAccepted()
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
    toastInviteDeclined()
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
        <CardContent class="py-12 text-center text-muted-foreground">Загрузка…</CardContent>
      </template>

      <template v-else-if="error || !preview">
        <CardHeader>
          <CardTitle>Приглашение не найдено</CardTitle>
          <CardDescription>Ссылка устарела или повреждена.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button as-child variant="outline">
            <NuxtLink to="/">На главную</NuxtLink>
          </Button>
        </CardFooter>
      </template>

      <template v-else-if="preview.status !== 'pending'">
        <CardHeader>
          <CardTitle>{{ preview.workspaceName }}</CardTitle>
          <CardDescription>{{ STATUS_TEXT[preview.status] }}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button as-child variant="outline">
            <NuxtLink to="/app">В приложение</NuxtLink>
          </Button>
        </CardFooter>
      </template>

      <template v-else>
        <CardHeader>
          <CardTitle>Приглашение в «{{ preview.workspaceName }}»</CardTitle>
          <CardDescription>
            {{ preview.invitedBy.name }} приглашает вас как
            <strong>{{ ROLE_LABEL[preview.role] }}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-xs text-muted-foreground">
          Срок действия: {{ new Date(preview.expiresAt).toLocaleDateString() }}
        </CardContent>
        <CardFooter class="flex gap-2 justify-end">
          <Button variant="outline" :disabled="acting" @click="onDecline">Отклонить</Button>
          <Button :disabled="acting" @click="onAccept">Принять</Button>
        </CardFooter>
      </template>
    </Card>
  </div>
</template>
