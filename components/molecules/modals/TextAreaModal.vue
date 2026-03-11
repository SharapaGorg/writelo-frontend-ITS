<script setup lang="ts">

/**
 * Модальное окно с текстовой областью
 *
 * Заголовок
 * Подзаголовок
 * Текстовое поле (textarea) с ограничением в 500 символов
 * Две кнопки - отмена и сохранить чаще всего
 */

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import {Textarea} from "~/components/ui/textarea";
import {Button} from "~/components/ui/button";
import {computed, nextTick, watch} from "vue";
import {PromptImproverWrapper} from "~/components/molecules/PromptImproverWrapper";

const props = withDefaults(defineProps<{
  title: string
  id: string
  description: string
  placeholder: string
  open: boolean,
  initialValue?: string, // начальное значение для текстового поля
  actionText?: string, // текст кнопки, которая обычно "Сохранить"
  cancelText?: string, // текст кнопки, которая обычно "Отмена"
  maxLength?: number, // максимальная длина текста
  size?: 'sm' | 'md' | 'lg' | 'xl' // размер модального окна
}>(), {
  actionText: "save",
  cancelText: "cancel",
  initialValue: "",
  maxLength: 500,
  size: 'md'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [name: string]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

const {t} = useI18n();

const text = ref("");
const textareaField = ref<InstanceType<typeof Textarea> | null>(null);

const remainingChars = computed(() => props.maxLength - text.value.length);

const dialogSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'sm:max-w-sm'
    case 'md': return 'sm:max-w-md'
    case 'lg': return 'sm:max-w-2xl'
    case 'xl': return 'sm:max-w-4xl'
    default: return 'sm:max-w-md'
  }
});

const textareaHeightClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'min-h-[100px]'
    case 'md': return 'min-h-[120px]'
    case 'lg': return 'min-h-[250px]'
    case 'xl': return 'min-h-[350px]'
    default: return 'min-h-[120px]'
  }
});

watch(() => props.open, (open) => {
  // устанавливать начальное значение и фокусировать на текстовом поле, когда форма открывается
  if (open) {
    text.value = props.initialValue;
    nextTick(() => {
      textareaField.value?.textarea?.focus()
      textareaField.value?.textarea?.select()
    })
  }
})

const handleInput = (value: string) => {
  if (value.length <= props.maxLength) {
    text.value = value;
  } else {
    text.value = value.substring(0, props.maxLength);
  }
}

const finalAction = () => {
  const text_ = text.value.trim();
  if (text_) {
    emit('save', text_);
    isOpen.value = false;
    text.value = ""; // Clear text after save
  }
}

</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :class="dialogSizeClass">
      <div class="flex flex-col gap-y-4" :id="id">
        <DialogHeader>
          <DialogTitle>{{ t(title) }}</DialogTitle>
          <DialogDescription>
            {{ t(description) }}
          </DialogDescription>
        </DialogHeader>

      <div class="space-y-4">
        <div class="flex flex-col space-y-2">
          <PromptImproverWrapper
              :modelValue="text"
              @update:modelValue="handleInput"
              class="w-full prompt-improver-no-padding"
          >
            <Textarea
                :modelValue="text"
                @update:modelValue="handleInput"
                :placeholder="t(placeholder)"
                :class="[textareaHeightClass, 'resize-none']"
                ref="textareaField"
            />
          </PromptImproverWrapper>
          <span class="text-xs text-muted-foreground text-right">
            {{ remainingChars }}/{{ maxLength }}
          </span>
        </div>
      </div>

        <DialogFooter class="flex-col-reverse sm:flex-row sm:justify-end gap-y-1.5">
          <DialogClose asChild>
            <Button variant="outline">{{ t(cancelText) }}</Button>
          </DialogClose>
          <Button @click="finalAction" :disabled="!text.trim()">
            {{ t(actionText) }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>