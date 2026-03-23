<script setup lang="ts">
import { useAccountEditStore, EditMode } from '../../stores/accountEdit';
import FieldProtectedEditable from '~/components/atoms/FieldProtectedEditable.vue';
import { useProfileI18n } from '../../composables/useProfileI18n';

const store = useAccountEditStore();
const { t } = useProfileI18n();

// Computed для блокировки поля
const isLocked = computed(() => store.currentEditMode !== EditMode.NAME);

// Показывать ли это поле
const isVisible = computed(() => 
  store.currentEditMode === EditMode.NONE || store.currentEditMode === EditMode.NAME
);
</script>

<template>
  <div v-if="isVisible" class="space-y-2">
    <Label>{{ t('editAccount.fields.fullName') }}</Label>
    <FieldProtectedEditable
        v-model="store.fullName"
        :locked="isLocked"
        :placeholder="t('editAccount.placeholders.fullName')"
        @update:locked="(val) => !val && store.startEditName()"
        @input="() => store.touchField('fullName')"
        @blur="() => store.touchField('fullName')"
    />
    <p v-if="store.shouldShowError('fullName')" class="text-sm text-red-500">
      {{ store.validationErrors.fullName }}
    </p>
  </div>
</template>