<script setup lang="ts">
import {Loader2, SquarePen} from 'lucide-vue-next';
import {useAccountEditStore, EditMode} from '../../stores/accountEdit';
import {useProfileI18n} from '../../composables/useProfileI18n';
import {AuthApiController} from '~/lib-modules/web-auth/helpers';
import {toast} from 'vue-sonner';
import {getToasterPosition} from '~/scripts/features/utils/toater';

const store = useAccountEditStore();
const {t} = useProfileI18n();
const $settings = useSettings();
const authApi = new AuthApiController();

const user = computed(() => $settings.getUser());

// Показывать ли это поле
const isVisible = computed(() =>
    store.currentEditMode === EditMode.NONE || store.currentEditMode === EditMode.EMAIL
);

// Редактируем ли email
const isEditing = computed(() => store.currentEditMode === EditMode.EMAIL);

// Состояние загрузки
const isLoading = ref(false);
const isResending = ref(false);
const isCanceling = ref(false);

// Новый email для ввода
const newEmail = ref('');

// Локальный pending email (используется после успешного запроса)
const localPendingEmail = ref<string | null>(null);

// Pending email - либо с сервера, либо локальный
const pendingEmail = computed(() => localPendingEmail.value || user.value?.pendingEmail || null);

// Текущий email пользователя
const currentEmail = computed(() => user.value?.email || '');

// Валидация email
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(newEmail.value) && newEmail.value !== currentEmail.value;
});

const startEdit = () => {
  newEmail.value = '';
  store.startEditEmail();
};

const cancelEdit = () => {
  newEmail.value = '';
  store.cancelEdit();
};

const onChangeEmail = async () => {
  if (!isValidEmail.value) return;

  isLoading.value = true;
  try {
    await authApi.requestEmailChange(newEmail.value);
    store.cancelEdit();
    toast.success(t('editAccount.messages.emailChangeSent'), {
      description: t('editAccount.messages.emailChangeSentDescription', {email: newEmail.value}),
      position: getToasterPosition()
    });
    newEmail.value = '';
    await $settings.refreshUserData();
  } catch (e: any) {
    // Error toast shown by ApiController
  } finally {
    isLoading.value = false;
  }
};

const onResend = async () => {
  isResending.value = true;
  try {
    await authApi.resendEmailChange();
    toast.success(t('editAccount.messages.emailResent'), {
      position: getToasterPosition()
    });
  } catch (e: any) {
    // Error toast shown by ApiController
  } finally {
    isResending.value = false;
  }
};

const onCancelPending = async () => {
  isCanceling.value = true;
  try {
    await authApi.cancelEmailChange();
    localPendingEmail.value = null;
    await $settings.refreshUserData();
    toast.success(t('editAccount.messages.emailChangeCanceled'), {
      position: getToasterPosition()
    });
  } catch (e: any) {
    // Error toast shown by ApiController
  } finally {
    isCanceling.value = false;
  }
};
</script>

<template>
  <div v-if="isVisible" class="space-y-2">
    <Label>{{ t('editAccount.fields.email') }}</Label>

    <!-- Текущий email (режим просмотра) -->
    <div v-if="!isEditing" class="relative flex items-center">
      <Input
          :value="currentEmail"
          disabled
          placeholder="your@email.com"
      />
      <SquarePen
          class="absolute right-2 cursor-pointer w-4 h-4"
          @click="startEdit"
      />
    </div>

    <!-- Pending email статус -->
    <div v-if="pendingEmail && !isEditing" class="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <p class="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
        {{ t('editAccount.messages.pendingEmailChange', {email: pendingEmail}) }}
      </p>
      <div class="flex gap-2">
        <Button
            variant="outline"
            size="sm"
            @click="onResend"
            :disabled="isResending"
        >
          <Loader2 v-if="isResending" class="w-3 h-3 animate-spin mr-1"/>
          {{ t('editAccount.buttons.resendEmail') }}
        </Button>
        <Button
            variant="ghost"
            size="sm"
            @click="onCancelPending"
            :disabled="isCanceling"
        >
          <Loader2 v-if="isCanceling" class="w-3 h-3 animate-spin mr-1"/>
          {{ t('editAccount.buttons.cancelChange') }}
        </Button>
      </div>
    </div>

    <!-- Форма редактирования -->
    <div v-if="isEditing" class="space-y-3">
      <div class="space-y-2">
        <Label>{{ t('editAccount.labels.newEmail') }}</Label>
        <Input
            v-model="newEmail"
            type="email"
            :placeholder="t('editAccount.placeholders.newEmail')"
            autocomplete="off"
        />
        <p v-if="newEmail && !isValidEmail" class="text-sm text-red-500">
          {{ newEmail === currentEmail
              ? t('editAccount.validation.emailUnchanged')
              : t('editAccount.validation.emailInvalid')
          }}
        </p>
      </div>

      <div class="flex gap-2">
        <Button
            @click="onChangeEmail"
            :disabled="!isValidEmail || isLoading"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin mr-2"/>
          {{ t('editAccount.buttons.changeEmail') }}
        </Button>
        <Button variant="outline" @click="cancelEdit">
          {{ t('editAccount.buttons.cancel') }}
        </Button>
      </div>
    </div>
  </div>
</template>
