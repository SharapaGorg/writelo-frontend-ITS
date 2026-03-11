<script setup lang="ts">

/**
 * Модальное окно, пример - ProjectRename
 *
 * Заголовок
 * Подзаголовок
 * Текстовое поле в одну строчку
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
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {computed, nextTick, watch} from "vue";

const props = withDefaults(defineProps<{
  title: string
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
const inputField = ref<HTMLInputElement | null>(null);

watch(() => props.open, (open) => {
  // устанавливать начальное значение и фокусировать на текстовом поле, когда форма открывается
  if (open) {
    text.value = props.initialValue;
    nextTick(() => {
      inputField.value?.focus()
      inputField.value?.select()
    })
  }
})

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
      <DialogHeader>
        <DialogTitle>{{ t(title) }}</DialogTitle>
        <DialogDescription>
          {{ t(description) }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <Input
              v-model="text"
              :placeholder="t(placeholder)"
              class="flex-1"
              @keyup.enter="finalAction"
              ref="inputField"
          />
        </div>
      </div>

      <DialogFooter class="flex-col-reverse sm:flex-row sm:justify-end">
        <DialogClose asChild>
          <Button variant="outline">{{ t(cancelText) }}</Button>
        </DialogClose>
        <Button @click="finalAction" :disabled="!text.trim()">
          {{ t(actionText) }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>