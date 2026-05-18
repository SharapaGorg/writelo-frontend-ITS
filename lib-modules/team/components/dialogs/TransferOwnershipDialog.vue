<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import type { WorkspaceMemberDto } from '../../types'

const props = defineProps<{ open: boolean; target: WorkspaceMemberDto | null }>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()

const typed = ref('')

watch(
  () => props.open,
  v => {
    if (v) typed.value = ''
  },
)

const matches = computed(
  () => !!props.target?.email && typed.value.trim().toLowerCase() === props.target.email.toLowerCase(),
)
</script>

<template>
  <AlertDialog :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('teamPage.transferDialog.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('teamPage.transferDialog.description1', { name: target?.name ?? '' }) }}
          {{ t('teamPage.transferDialog.description2') }}
          {{ t('teamPage.transferDialog.description3') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="space-y-2">
        <Label for="confirm-email">{{ t('teamPage.transferDialog.confirmLabel') }}</Label>
        <Input
          id="confirm-email"
          v-model="typed"
          type="email"
          :placeholder="target?.email ?? ''"
          autocomplete="off"
        />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ t('teamPage.transferDialog.cancel') }}</AlertDialogCancel>
        <AlertDialogAction
          :disabled="!matches"
          class="bg-destructive text-destructive-foreground disabled:opacity-50"
          @click="emit('confirm')"
        >
          {{ t('teamPage.transferDialog.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
