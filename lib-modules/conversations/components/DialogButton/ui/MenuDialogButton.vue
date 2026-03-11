<script setup lang="ts">
import {computed} from 'vue'
import {Routes} from "~/scripts/shared/types"
import {Button} from "~/components/ui/button"
import {Trash, Share2, MoreVertical, Link, X, FolderPlus} from "lucide-vue-next"
import RemoveConfirmationAlert from "./RemoveConfirmationAlert.vue"
import {useConversationsStore} from "~/stores/conversations"
import {
  toastShareSuccess,
  toastShareError,
  toastDeleteSuccess,
  toastDeleteError,
  toastUnshareSuccess,
  toastUnshareError
} from "~/scripts/features/utils/toater"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {useConversationAssignment} from "~/lib-modules/projects";

const conversationStore = useConversationsStore()
const {t} = useI18n()
const {enterAssignmentMode} = useConversationAssignment()

const props = defineProps<{
  privateId: string,
  title: string,
  shareId: string | null
}>()

// Check if conversation is already shared
const isShared = computed(() => !!props.shareId);

// Handle share/copy link action
const handleShare = async () => {
  try {
    // If already shared, use existing share_id, otherwise call API to share
    let shareId = props.shareId

    if (!shareId) {
      const result = await conversationStore.shareConversation(props.privateId)
      shareId = result.shareId
    }

    // Create the shareable link
    const baseUrl = useRuntimeConfig().public.appBaseUrl
    const shareLink = `${baseUrl}/conversations/${shareId}`

    // Copy to clipboard
    await navigator.clipboard.writeText(shareLink)

    toastShareSuccess(t);

    const {$telegram} = useNuxtApp();
    await $telegram.shareConversation(shareId);
  } catch (error) {
    console.error('Share error:', error)
    toastShareError(t)
  }
}

// Handle unshare action
const handleUnshare = async () => {
  try {
    const result = await conversationStore.unshareConversation(props.privateId)
    toastUnshareSuccess(t)
  } catch (error) {
    toastUnshareError(t)
  }
}

// Handle add to project action
const handleAddToProject = () => {
  enterAssignmentMode(props.privateId, props.title)
}

// Handle delete action
const handleDelete = async () => {
  const currentRoute = useRoute()
  const isCurrentDialog = currentRoute.params.id === props.privateId

  try {
    await conversationStore.removeConversation(props.privateId, t)

    // If user is currently viewing this dialog, navigate to new conversation
    if (isCurrentDialog) {
      await navigateTo(Routes.newConversation)
    }

    toastDeleteSuccess(t)
  } catch (error) {
    toastDeleteError(t)
  }
}

</script>

<template>
  <div class="flex items-center gap-x-1 w-full">
    <router-link
        class="flex-grow min-w-0"
        :key="privateId"
        :to="Routes.conversations + privateId"
    >
      <Button
          class="w-full justify-start overflow-hidden"
          variant="outline"
      >
      <span class="text-start block w-full overflow-hidden whitespace-nowrap text-ellipsis truncate">
        {{ title }}
      </span>
      </Button>

    </router-link>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" class="h-10 w-10 flex-shrink-0">
          <MoreVertical class="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-fit">
        <!-- If not shared: Show Share option -->
        <DropdownMenuItem v-if="!isShared" @click="handleShare" class="cursor-pointer">
          <div class="flex items-center">
            <Share2 class="mr-2 h-4 w-4"/>
            <span>{{ t('share') }}</span>
          </div>
        </DropdownMenuItem>

        <!-- If already shared: Show Copy Link option -->
        <DropdownMenuItem v-if="isShared" @click="handleShare" class="cursor-pointer">
          <div class="flex items-center">
            <Link class="mr-2 h-4 w-4"/>
            <span>{{ t('copy-link') }}</span>
          </div>
        </DropdownMenuItem>

        <!-- If already shared: Show Unshare option -->
        <DropdownMenuItem v-if="isShared" @click="handleUnshare"
                          class="cursor-pointer text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
          <div class="flex items-center">
            <X class="mr-2 h-4 w-4"/>
            <span>{{ t('unshare') }}</span>
          </div>
        </DropdownMenuItem>

        <!-- Add to Project option -->
        <DropdownMenuItem @click="handleAddToProject" class="cursor-pointer">
          <div class="flex items-center">
            <FolderPlus class="mr-2 h-4 w-4"/>
            <span>{{ t('add-to-project') }}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
            as-child
        >
          <RemoveConfirmationAlert
              :dialog-title="title"
              @approve="handleDelete"
          >
            <div
                class="flex items-center px-2 py-1.5 text-sm cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 transition-colors">
              <Trash class="mr-2 h-4 w-4"/>
              <span>{{ t('delete') }}</span>
            </div>
          </RemoveConfirmationAlert>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<style scoped>
/* Ensure consistent height */
:deep(.h-10) {
  height: 2.5rem;
}
</style>