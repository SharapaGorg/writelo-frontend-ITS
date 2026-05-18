<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Check, Pencil, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()
import { Button } from '~/components/ui/button'
import { useContentProjectStore } from '~/lib-modules/content-calendar'
import { getToasterPosition, toastError } from '~/scripts/features/utils/toater'
import type { Action } from '../types'

const props = defineProps<{ action: Action }>()

const router = useRouter()
const projectStore = useContentProjectStore()

const isLoading = ref(false)
const createdPostId = ref<string | null>(null)

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function handleClick() {
  if (createdPostId.value) {
    if (props.action.type === 'open_in_editor') {
      router.push(`/app/editor?postId=${createdPostId.value}`)
    } else {
      router.push(`/app/calendar?postId=${createdPostId.value}`)
    }
    return
  }

  // Reuse calendar's first connected account as the post owner — the same
  // default the calendar's "+ idea" form picks. For a global-assistant idea
  // there's no obvious account, and backend requires socialAccountId.
  const accounts = projectStore.currentProject?.accounts ?? []
  const accountId = accounts[0]?.id
  if (!accountId) {
    toastError(t('assistantPage.actionCard.connectAccount'))
    return
  }

  isLoading.value = true
  try {
    const post = await projectStore.createPost(
      {
        title: props.action.title,
        description: props.action.description,
        content: props.action.description,
        type: 'post',
        status: 'idea',
        accountId,
        tags: [],
        date: todayISO(),
      },
      { optimistic: false },
    )
    if (!post) {
      toastError(t('assistantPage.actionCard.saveFailed'))
      return
    }
    createdPostId.value = post.id
    if (props.action.type === 'open_in_editor') {
      router.push(`/app/editor?postId=${post.id}`)
    } else {
      toast.success(t('assistantPage.actionCard.saved', { title: props.action.title }), { position: getToasterPosition() })
    }
  } catch (e) {
    toastError(t('assistantPage.actionCard.saveFailed'))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-w-[240px] flex-1 flex-col rounded-md border border-border bg-card p-3">
    <div class="truncate text-sm font-medium">{{ action.title }}</div>
    <div class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ action.description }}</div>
    <div class="mt-2 flex justify-end">
      <Button
        v-if="!createdPostId"
        size="sm"
        :disabled="isLoading"
        @click="handleClick"
      >
        <component
          :is="action.type === 'open_in_editor' ? Pencil : Plus"
          class="mr-1 h-4 w-4"
        />
        {{ action.type === 'open_in_editor' ? t('assistantPage.actionCard.toEditor') : t('calendarPage.statuses.idea') }}
      </Button>
      <Button v-else size="sm" variant="ghost" @click="handleClick">
        <Check class="mr-1 h-4 w-4" />
        <span class="max-w-[180px] truncate">{{ t('assistantPage.actionCard.savedLabel', { title: action.title }) }}</span>
      </Button>
    </div>
  </div>
</template>
