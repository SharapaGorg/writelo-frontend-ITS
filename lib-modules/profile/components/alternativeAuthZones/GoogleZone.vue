<script setup lang="ts">
import {computed, ref} from 'vue'
import GoogleButton from "~/lib-modules/web-auth/components/GoogleButton.vue";
import ProfilePageBlock from "~/lib-modules/profile/components/ProfilePageBlock.vue";
import {Button} from '@/components/ui/button'
import {Check, Loader2} from 'lucide-vue-next'
import {OAuthProvider} from "~/lib-modules/web-auth";
import {AuthApiController} from "~/lib-modules/web-auth/helpers/api";
import {useWebAuthI18n} from "~/lib-modules/web-auth/composables/useWebAuthI18n";
import {toast} from 'vue-sonner'
import {getToasterPosition} from '~/scripts/features/utils/toater'

const settings = useSettings()
const {t} = useWebAuthI18n()
const authApi = new AuthApiController()

const isUnlinking = ref(false)
const showConfirmDialog = ref(false)

const isGoogleLinked = computed(() => {
  const user = settings.getUser()
  return user?.oAuthProviders?.includes(OAuthProvider.Google) ?? false
})

async function handleUnlink() {
  showConfirmDialog.value = false
  isUnlinking.value = true
  try {
    await authApi.unlinkProvider('google')
    await settings.refreshUserData()
    toast.success(t('google.unlinked'), {position: getToasterPosition()})
  } catch (error) {
    console.error('Failed to unlink Google:', error)
  } finally {
    isUnlinking.value = false
  }
}
</script>

<template>
  <ProfilePageBlock>
    <template #header>Google</template>
    <template #content>
      <div v-if="isGoogleLinked" class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Check class="w-4 h-4 text-green-500" />
          <span>{{ t('google.account_linked') }}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="isUnlinking"
          @click="showConfirmDialog = true"
        >
          <Loader2 v-if="isUnlinking" class="w-4 h-4 animate-spin mr-2" />
          {{ t('google.unlink') }}
        </Button>
      </div>
      <GoogleButton v-else mode="link"/>
    </template>
  </ProfilePageBlock>

  <Dialog v-model:open="showConfirmDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('google.unlink_confirm_title') }}</DialogTitle>
        <DialogDescription>
          {{ t('google.unlink_confirm_description') }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>
          <Button variant="outline">{{ t('google.cancel') }}</Button>
        </DialogClose>
        <Button @click="handleUnlink">{{ t('google.unlink') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>
