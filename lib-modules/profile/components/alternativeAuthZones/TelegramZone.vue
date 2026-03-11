<script setup lang="ts">
import {computed, ref} from 'vue'
import TelegramLoginButton from "~/lib-modules/web-auth/components/TelegramLoginButton.vue";
import ProfilePageBlock from "~/lib-modules/profile/components/ProfilePageBlock.vue";
import {Button} from '@/components/ui/button'
import {Check, Loader2} from 'lucide-vue-next'
import {OAuthProvider} from "~/lib-modules/web-auth";
import {AuthApiController} from "~/lib-modules/web-auth/helpers/api";
import {useWebAuthI18n} from "~/lib-modules/web-auth/composables/useWebAuthI18n";
import {toast} from 'vue-sonner'
import {getToasterPosition} from '~/scripts/features/utils/toater'
import {isInTelegramApp} from "~/scripts/features/utils";

const settings = useSettings()
const {t} = useWebAuthI18n()
const authApi = new AuthApiController()

const isUnlinking = ref(false)
const showConfirmDialog = ref(false)

const isTelegramLinked = computed(() => {
  const user = settings.getUser()
  return user?.oAuthProviders?.includes(OAuthProvider.Telegram) ?? false
})

async function handleUnlink() {
  showConfirmDialog.value = false
  isUnlinking.value = true
  try {
    await authApi.unlinkProvider('telegram')
    await settings.refreshUserData()
    toast.success(t('telegram.unlinked'), {position: getToasterPosition()})
  } catch (error) {
    console.error('Failed to unlink Telegram:', error)
  } finally {
    isUnlinking.value = false
  }
}
</script>

<template>
  <ProfilePageBlock>
    <template #header>Telegram</template>
    <template #content>
      <div v-if="isTelegramLinked" class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Check class="w-4 h-4 text-green-500"/>
          <span>{{ t('telegram.account_linked') }}</span>
        </div>
        <!-- Hide unlink button when inside Telegram Mini App -->
        <Button
            v-if="!isInTelegramApp"
            variant="outline"
            size="sm"
            :disabled="isUnlinking"
            @click="showConfirmDialog = true"
        >
          <Loader2 v-if="isUnlinking" class="w-4 h-4 animate-spin mr-2"/>
          {{ t('telegram.unlink') }}
        </Button>
      </div>
      <TelegramLoginButton v-else mode="link"/>
    </template>
  </ProfilePageBlock>

  <Dialog v-model:open="showConfirmDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('telegram.unlink_confirm_title') }}</DialogTitle>
        <DialogDescription>
          {{ t('telegram.unlink_confirm_description') }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
          <Button variant="outline">{{ t('telegram.cancel') }}</Button>
        </DialogClose>
        <Button @click="handleUnlink">{{ t('telegram.unlink') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
