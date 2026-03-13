import {defineStore} from 'pinia';
import {ApiController} from '~/scripts/shared/api/controller';
import {useDemoGuard} from '~/lib-modules/demo-mode';

// Режимы редактирования
export enum EditMode {
    NONE = 'none',
    NAME = 'name',
    EMAIL = 'email',
    PASSWORD = 'password'
}

interface ValidationErrors {
    [key: string]: string;
}

export const useAccountEditStore = defineStore('accountEdit', () => {
    const $settings = useSettings();
    const apiController = new ApiController();
    const {guardAction} = useDemoGuard();

    // Инициализация с данными пользователя
    const user = computed(() => $settings.getUser());

    // Основные поля
    const fullName = ref<string>('');
    const email = ref<string>('');
    const originalFullName = ref<string>('');
    const originalEmail = ref<string>('');

    // Инициализация данных при загрузке пользователя
    watchEffect(() => {
        if (user.value) {
            // const userFullName = `${user.value.first_name} ${user.value.last_name}`.trim();
            const userFullName = user.value.name.trim();
            const userEmail = user.value.email || '';

            if (!fullName.value && !originalFullName.value) {
                fullName.value = userFullName;
                originalFullName.value = userFullName;
                email.value = userEmail;
                originalEmail.value = userEmail;
            }
        }
    });

    // Текущий режим редактирования
    const currentEditMode = ref<EditMode>(EditMode.NONE);

    // Поля для подтверждения
    const currentPassword = ref<string>('');
    const newPassword = ref<string>('');
    const confirmPassword = ref<string>('');
    const verificationCode = ref<string>('');

    // Состояния
    const isCodeSent = ref<boolean>(false);
    const isSendingCode = ref<boolean>(false);
    const codeResendTimer = ref<number>(0);
    const isSaving = ref<boolean>(false);

    // Валидация
    const validationErrors = ref<ValidationErrors>({});
    const touchedFields = ref<Set<string>>(new Set());
    const attemptedSubmit = ref<boolean>(false);

    // Таймер для повторной отправки кода
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    // Методы для работы с режимами
    const startEditName = () => {
        // Block editing in demo mode
        if (guardAction(() => {})) return;

        if (currentEditMode.value !== EditMode.NAME) {
            currentEditMode.value = EditMode.NAME;
            clearConfirmationFields();
        }
    };

    const startEditEmail = () => {
        // Block editing in demo mode
        if (guardAction(() => {})) return;

        if (currentEditMode.value !== EditMode.EMAIL) {
            currentEditMode.value = EditMode.EMAIL;
            clearConfirmationFields();
        }
    };

    const startEditPassword = () => {
        // Block editing in demo mode
        if (guardAction(() => {})) return;

        if (currentEditMode.value !== EditMode.PASSWORD) {
            currentEditMode.value = EditMode.PASSWORD;
            clearConfirmationFields();
        }
    };

    const cancelEdit = () => {
        // Восстанавливаем оригинальные значения
        fullName.value = originalFullName.value;
        email.value = originalEmail.value;

        currentEditMode.value = EditMode.NONE;
        clearConfirmationFields();
    };

    const clearConfirmationFields = () => {
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        verificationCode.value = '';
        isCodeSent.value = false;
        isSendingCode.value = false;
        codeResendTimer.value = 0;
        touchedFields.value.clear();
        attemptedSubmit.value = false;
        validationErrors.value = {};

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    // Валидация
    const touchField = (fieldName: string) => {
        touchedFields.value.add(fieldName);
    };

    const validateFields = () => {
        validationErrors.value = {};

        switch (currentEditMode.value) {
            case EditMode.NAME:
                if (fullName.value.trim().length < 2) {
                    validationErrors.value.fullName = 'Имя должно содержать минимум 2 символа';
                }
                break;

            case EditMode.EMAIL:
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    validationErrors.value.email = 'Некорректный формат email';
                }
                if (email.value === originalEmail.value) {
                    validationErrors.value.email = 'Email не изменился';
                }
                // Проверяем пароль только для отправки кода
                if (!isCodeSent.value && !currentPassword.value) {
                    validationErrors.value.currentPassword = 'Введите текущий пароль для подтверждения';
                }
                // Проверяем код только если пользователь начал его вводить
                if (isCodeSent.value && touchedFields.value.has('verificationCode') && verificationCode.value.length < 4) {
                    validationErrors.value.verificationCode = 'Код должен содержать минимум 4 символа';
                }
                break;

            case EditMode.PASSWORD:
                if (!currentPassword.value) {
                    validationErrors.value.currentPassword = 'Введите текущий пароль';
                }
                if (newPassword.value.length < 8) {
                    validationErrors.value.newPassword = 'Новый пароль должен содержать минимум 8 символов';
                }
                if (newPassword.value !== confirmPassword.value) {
                    validationErrors.value.confirmPassword = 'Пароли не совпадают';
                }
                break;
        }
    };

    const shouldShowError = (fieldName: string) => {
        return validationErrors.value[fieldName] &&
            (touchedFields.value.has(fieldName) || attemptedSubmit.value);
    };

    // Логика для кнопок
    const canSendCode = computed(() => {
        return !currentPassword.value ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ||
            email.value === originalEmail.value ||
            isSendingCode.value;
    });

    const canSave = computed(() => {
        switch (currentEditMode.value) {
            case EditMode.NAME:
                return fullName.value.trim().length >= 2;
            case EditMode.EMAIL:
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
                    currentPassword.value.length >= 1 &&
                    isCodeSent.value &&
                    verificationCode.value.length >= 4;
            case EditMode.PASSWORD:
                return currentPassword.value.length >= 1 &&
                    newPassword.value.length >= 8 &&
                    newPassword.value === confirmPassword.value;
            default:
                return false;
        }
    });

    // Отправка кода
    const sendVerificationCode = async () => {
        // Помечаем попытку отправки для показа всех ошибок
        attemptedSubmit.value = true;

        // Проверяем валидацию перед отправкой
        validateFields();
        if (Object.keys(validationErrors.value).length > 0) {
            return;
        }

        isSendingCode.value = true;

        try {
            // TODO: API вызов для отправки кода
            await new Promise(resolve => setTimeout(resolve, 1500)); // Симуляция

            isCodeSent.value = true;
            codeResendTimer.value = 60; // 60 секунд

            // Очищаем поле кода при новой отправке
            verificationCode.value = '';
            // Убираем поле из touched, чтобы ошибка не показывалась сразу
            touchedFields.value.delete('verificationCode');

            // Запускаем таймер
            timerInterval = setInterval(() => {
                codeResendTimer.value--;
                if (codeResendTimer.value <= 0 && timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }, 1000);

        } catch (error) {
            console.error('Ошибка отправки кода:', error);
        } finally {
            isSendingCode.value = false;
        }
    };

    // Сохранение изменений
    const saveChanges = async () => {
        console.log('[saveChanges] called', {
            mode: currentEditMode.value,
            canSave: canSave.value,
            currentPassword: currentPassword.value.length,
            newPassword: newPassword.value.length,
            confirmPassword: confirmPassword.value.length,
            passwordsMatch: newPassword.value === confirmPassword.value
        });

        // Помечаем попытку отправки для показа всех ошибок
        attemptedSubmit.value = true;

        // Проверяем валидацию
        validateFields();
        console.log('[saveChanges] after validation', {
            canSave: canSave.value,
            validationErrors: validationErrors.value
        });
        if (!canSave.value || Object.keys(validationErrors.value).length > 0) return;

        // Начинаем процесс сохранения
        isSaving.value = true;

        try {
            console.log('[saveChanges] starting API call for mode:', currentEditMode.value);
            switch (currentEditMode.value) {
                case EditMode.PASSWORD:
                    console.log('[saveChanges] calling changePassword API');
                    await apiController.changePassword(currentPassword.value, newPassword.value);
                    console.log('[saveChanges] changePassword API completed');
                    break;
                case EditMode.NAME:
                    await apiController.updateName(fullName.value.trim());
                    originalFullName.value = fullName.value;
                    break;
                case EditMode.EMAIL:
                    // TODO: API для изменения email
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    originalEmail.value = email.value;
                    break;
            }

            // Обновляем данные пользователя
            await $settings.refreshUserData();

            // Возврат к обычному режиму
            cancelEdit();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        } finally {
            isSaving.value = false;
        }
    };

    // Watchers
    watchEffect(() => {
        if (currentEditMode.value !== EditMode.NONE) {
            validateFields();
        }
    });

    watch(currentEditMode, () => {
        touchedFields.value.clear();
        attemptedSubmit.value = false;
        validationErrors.value = {};
    });

    watch(isCodeSent, (newVal) => {
        if (newVal) {
            touchedFields.value.delete('verificationCode');
        }
    });

    // Очистка таймера при размонтировании
    onUnmounted(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });

    return {
        // State
        fullName,
        email,
        originalEmail,
        currentEditMode,
        currentPassword,
        newPassword,
        confirmPassword,
        verificationCode,
        isCodeSent,
        isSendingCode,
        codeResendTimer,
        isSaving,
        validationErrors,

        // Computed
        canSendCode,
        canSave,

        // Methods
        startEditName,
        startEditEmail,
        startEditPassword,
        cancelEdit,
        sendVerificationCode,
        saveChanges,
        touchField,
        shouldShowError,

        // Constants
        EditMode
    };
});