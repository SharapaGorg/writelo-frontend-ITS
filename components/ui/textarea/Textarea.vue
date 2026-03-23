<script setup lang="ts">
import {type HTMLAttributes, ref} from 'vue'
import {cn} from '@/lib-modules/utils'
import {useVModel} from '@vueuse/core'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const textarea: Ref<null | HTMLInputElement> = ref(null);

defineExpose({
  textarea
})

</script>

<template>
  <textarea
      ref="textarea"
      v-model="modelValue"
      :class="cn('flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', props.class)"/>
</template>
