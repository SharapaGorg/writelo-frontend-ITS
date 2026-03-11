<script setup lang="ts">
import {ref} from 'vue'
import ProfilePageBlock from "~/lib-modules/profile/components/ProfilePageBlock.vue";
import {useProfileI18n} from "~/lib-modules/profile/composables/useProfileI18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'

const {t} = useProfileI18n()
const userController = useUserController()

const isDialogOpen = ref(false)

async function handleLogout() {
  userController.clearToken()
  isDialogOpen.value = false
  await navigateTo('/auth')
}
</script>

<template>
  <ProfilePageBlock>
    <template #header>
      <span class="text-red-500">{{ t('dangerZone.header') }}</span>
    </template>
    <template #content>
      <Button
          class="w-full"
          variant="destructive"
          @click="isDialogOpen = true"
      >
        {{ t('dangerZone.logout') }}
      </Button>

      <Dialog v-model:open="isDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t('dangerZone.logoutConfirm.title') }}</DialogTitle>
            <DialogDescription>
              {{ t('dangerZone.logoutConfirm.description') }}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="isDialogOpen = false">
              {{ t('dangerZone.logoutConfirm.cancel') }}
            </Button>
            <Button variant="destructive" @click="handleLogout">
              {{ t('dangerZone.logoutConfirm.confirm') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </ProfilePageBlock>
</template>
