<script setup lang="ts">
import { SquarePen } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  locked?: boolean
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  'update:modelValue': [value: string]
  'update:locked': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  locked: true,
  placeholder: '',
  disabled: false
})

const emit = defineEmits<Emits>()

// Computed для синхронизации с v-model
const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// Computed для v-model:locked
const internalLocked = computed({
  get: () => props.locked,
  set: (value: boolean) => emit('update:locked', value)
})

const unlock = () => {
  internalLocked.value = false
}

const lock = () => {
  internalLocked.value = true
}
</script>

<template>
  <div class="relative flex items-center">
    <Input
        :disabled="internalLocked || disabled"
        v-model="internalValue"
        :placeholder="placeholder"
    />

    <SquarePen
        class="edit-field-icon"
        @click="unlock"
        v-if="internalLocked && !disabled"
    />
  </div>
</template>

<style scoped>

.edit-field-icon {
  @apply absolute right-2 cursor-pointer w-4 h-4
}

</style>