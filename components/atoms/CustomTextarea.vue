<script setup lang="ts">

import {Textarea} from "~/components/ui/textarea";

const props = withDefaults(defineProps<{
  defaultValue?: string
  modelValue?: string
  maxLength?: number
  placeholder?: string
  label?: string
}>(), {
  maxLength: 500
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const textareaRef = ref<typeof Textarea | null>(null);

const textValue = ref<string>("");
const remainingChars = computed(() => props.maxLength - textValue.value.length);

const text = computed({
  get() {
    return textValue.value;
  },
  set(value: string) {
    const handledValue = value.substring(0, props.maxLength);
    textValue.value = handledValue;
    emits('update:modelValue', textValue.value);

    nextTick(() => {
      if (textareaRef.value?.$el) {
        textareaRef.value.$el.value = handledValue;
      }
    })
  }
})

</script>

<template>
  <div class="flex flex-col space-y-2">
    <span v-if="label" class="text-md select-none">{{ label }}</span>

    <Textarea
        ref="textareaRef"
        v-model="text"
        :placeholder="placeholder"
        class="min-h-[120px] resize-none bg-transparent"
    />


    <span class="text-xs text-muted-foreground text-right">
            {{ remainingChars }}/{{ maxLength }}
    </span>

  </div>
</template>

<style scoped>

</style>