<script setup lang="ts">
import ProfilePageBlock from "./ProfilePageBlock.vue";
import {EditNameField, EditEmailField, EditPasswordField} from './editFields';
import {useAccountEditStore, EditMode} from '../stores/accountEdit';
import {Loader2} from 'lucide-vue-next';
import {useProfileI18n} from '~/lib-modules/profile';

const store = useAccountEditStore();
const {t} = useProfileI18n();
</script>

<template>
  <ProfilePageBlock>
    <template #header>{{ t('editAccount.header') }}</template>
    <template #content>
      <div class="edit-account-zone__fields-container">
        <!-- Компоненты полей -->
        <EditNameField/>
        <EditEmailField/>
        <EditPasswordField/>

        <!-- Кнопки действий (не для EMAIL - там свои кнопки) -->
        <div v-if="store.currentEditMode !== EditMode.NONE && store.currentEditMode !== EditMode.EMAIL" class="flex gap-3 mt-6">
          <Button
              variant="default"
              :disabled="!store.canSave || store.isSaving"
              @click="store.saveChanges"
          >
            <span v-if="!store.isSaving">{{ t('editAccount.buttons.saveChanges') }}</span>
            <span v-else class="flex items-center gap-2">
              <Loader2 class="w-4 h-4 animate-spin"/>
              {{ t('editAccount.buttons.saving') }}
            </span>
          </Button>

          <Button
              variant="outline"
              @click="store.cancelEdit"
              :disabled="store.isSaving"
          >
            {{ t('editAccount.buttons.cancel') }}
          </Button>
        </div>
      </div>
    </template>
  </ProfilePageBlock>
</template>

<style scoped>
.edit-account-zone__fields-container {
  @apply flex flex-col gap-y-4
}
</style>