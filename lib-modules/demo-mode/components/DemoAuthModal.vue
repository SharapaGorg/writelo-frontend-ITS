<!-- lib-modules/demo-mode/components/DemoAuthModal.vue -->
<template>
  <Dialog :open="showAuthModal" @update:open="closeAuthModal">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('demo.authModal.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('demo.authModal.description') }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-3 mt-4">
        <Button @click="goToAuth" class="w-full">
          {{ t('demo.authModal.button') }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useDemoGuard } from '../composables/useDemoGuard'

const { t } = useI18n()
const router = useRouter()
const { showAuthModal, closeAuthModal } = useDemoGuard()

function goToAuth() {
  closeAuthModal()
  router.push('/auth')
}
</script>
