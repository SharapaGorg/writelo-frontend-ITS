<script setup lang="ts">
import {useAccountEditStore, EditMode} from '../../stores/accountEdit';
import {SquarePen, Loader2} from 'lucide-vue-next';
import {useProfileI18n} from '../../composables/useProfileI18n';
import {AuthApiController} from '~/lib-modules/web-auth/helpers';
import {toast} from 'vue-sonner';
import {getToasterPosition} from '~/scripts/features/utils/toater';

const store = useAccountEditStore();
const {t} = useProfileI18n();
const $settings = useSettings();
const authApi = new AuthApiController();

// Показывать ли поле пароля в обычном режиме
const isVisible = computed(() => store.currentEditMode === EditMode.NONE);

// Показывать ли форму редактирования пароля
const isEditing = computed(() => store.currentEditMode === EditMode.PASSWORD);

// Состояние для кнопки сброса пароля
const isResetting = ref(false);
const resetEmailSent = ref(false);

const user = computed(() => $settings.getUser());

const onForgotPassword = async () => {
  const email = user.value?.email;
  if (!email) {
    toast.error(t('editAccount.errors.noEmail'), {
      position: getToasterPosition()
    });
    return;
  }

  isResetting.value = true;
  try {
    await authApi.forgotPassword(email);
    resetEmailSent.value = true;
    toast.success(t('editAccount.messages.passwordResetSent'), {
      description: t('editAccount.messages.passwordResetSentDescription', {email}),
      position: getToasterPosition()
    });
  } catch (e: any) {
    // Error toast is shown by ApiController
  } finally {
    isResetting.value = false;
  }
};
</script>

<template>
  <!-- Поле пароля в обычном режиме -->
  <div v-if="isVisible" class="space-y-2">
    <Label>{{ t('editAccount.fields.password') }}</Label>
    <div class="relative flex items-center">
      <Input
          value="••••••••"
          disabled
          placeholder="••••••••"
      />
      <SquarePen
          class="absolute right-2 cursor-pointer w-4 h-4"
          @click="store.startEditPassword"
      />
    </div>
  </div>

  <!-- Форма редактирования пароля -->
  <div v-if="isEditing" class="space-y-4">
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label>{{ t('editAccount.labels.currentPassword') }}</Label>
        <Button
            variant="link"
            class="p-0 h-auto text-xs"
            :disabled="isResetting || resetEmailSent"
            @click="onForgotPassword"
        >
          <Loader2 v-if="isResetting" class="w-3 h-3 animate-spin mr-1"/>
          <span v-if="resetEmailSent">{{ t('editAccount.buttons.resetEmailSent') }}</span>
          <span v-else>{{ t('editAccount.buttons.forgotPassword') }}</span>
        </Button>
      </div>

      <Input
          v-model="store.currentPassword"
          type="password"
          :placeholder="t('editAccount.placeholders.currentPassword')"
          @input="() => store.touchField('currentPassword')"
          @blur="() => store.touchField('currentPassword')"
      />
      <p v-if="store.shouldShowError('currentPassword')" class="text-sm text-red-500">
        {{ store.validationErrors.currentPassword }}
      </p>
    </div>

    <div class="space-y-2">
      <Label>{{ t('editAccount.labels.newPassword') }}</Label>
      <Input
          v-model="store.newPassword"
          type="password"
          :placeholder="t('editAccount.placeholders.newPassword')"
          @input="() => store.touchField('newPassword')"
          @blur="() => store.touchField('newPassword')"
      />
      <p v-if="store.shouldShowError('newPassword')" class="text-sm text-red-500">
        {{ store.validationErrors.newPassword }}
      </p>
    </div>

    <div class="space-y-2">
      <Label>{{ t('editAccount.labels.confirmPassword') }}</Label>
      <Input
          v-model="store.confirmPassword"
          type="password"
          :placeholder="t('editAccount.placeholders.confirmPassword')"
          @input="() => store.touchField('confirmPassword')"
          @blur="() => store.touchField('confirmPassword')"
      />
      <p v-if="store.shouldShowError('confirmPassword')" class="text-sm text-red-500">
        {{ store.validationErrors.confirmPassword }}
      </p>
    </div>
  </div>
</template>