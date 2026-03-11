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
  cancelText?: string // текст кнопки, которая обычно "Отмена"
}>(), {
  actionText: "save",
  cancelText: "cancel",
  initialValue: ""
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
const MAX_LENGTH = 500;

const remainingChars = computed(() => MAX_LENGTH - text.value.length);

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
  if (value.length <= MAX_LENGTH) {
    text.value = value;
  } else {
    text.value = value.substring(0, MAX_LENGTH);
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
    <DialogContent class="sm:max-w-md">
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
                class="min-h-[120px] resize-none"
                ref="textareaField"
            />
          </PromptImproverWrapper>
          <span class="text-xs text-muted-foreground text-right">
            {{ remainingChars }}/{{ MAX_LENGTH }}
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