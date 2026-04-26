<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: string // 'HH:MM' format
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hoursInput = ref<HTMLInputElement | null>(null)
const minutesInput = ref<HTMLInputElement | null>(null)

const hours = ref('')
const minutes = ref('')

function parseModel(val: string) {
  if (!val) {
    hours.value = ''
    minutes.value = ''
    return
  }
  const parts = val.split(':')
  hours.value = parts[0] || ''
  minutes.value = parts[1] || ''
}

function emitValue() {
  if (!hours.value && !minutes.value) {
    emit('update:modelValue', '')
    return
  }
  const h = hours.value.padStart(2, '0')
  const m = minutes.value.padStart(2, '0')
  emit('update:modelValue', `${h}:${m}`)
}

function handleHoursInput(e: Event) {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/\D/g, '').slice(0, 2)

  const num = parseInt(val, 10)
  if (!isNaN(num) && num > 23) {
    val = '23'
  }

  hours.value = val
  input.value = val

  if (val.length === 2) {
    minutesInput.value?.focus()
    minutesInput.value?.select()
  }
}

function handleMinutesInput(e: Event) {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/\D/g, '').slice(0, 2)

  const num = parseInt(val, 10)
  if (!isNaN(num) && num > 59) {
    val = '59'
  }

  minutes.value = val
  input.value = val
}

function handleHoursBlur() {
  if (hours.value.length === 1) {
    hours.value = hours.value.padStart(2, '0')
  }
  emitValue()
}

function handleMinutesBlur() {
  if (minutes.value.length === 1) {
    minutes.value = minutes.value.padStart(2, '0')
  }
  emitValue()
}

function handleHoursKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    const input = e.target as HTMLInputElement
    if (input.selectionStart === input.value.length) {
      e.preventDefault()
      minutesInput.value?.focus()
      minutesInput.value?.setSelectionRange(0, 0)
    }
  }
}

function handleMinutesKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    const input = e.target as HTMLInputElement
    if (input.selectionStart === 0) {
      e.preventDefault()
      hoursInput.value?.focus()
      const len = hours.value.length
      hoursInput.value?.setSelectionRange(len, len)
    }
  }
  if (e.key === 'Backspace') {
    const input = e.target as HTMLInputElement
    if (input.selectionStart === 0 && input.selectionEnd === 0) {
      e.preventDefault()
      hoursInput.value?.focus()
      const len = hours.value.length
      hoursInput.value?.setSelectionRange(len, len)
    }
  }
}

function clearTime() {
  hours.value = ''
  minutes.value = ''
  emit('update:modelValue', '')
}

watch(() => props.modelValue, (val) => {
  parseModel(val)
}, { immediate: true })

const hasValue = computed(() => hours.value || minutes.value || props.modelValue)
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-muted border border-border rounded-md px-3 py-2 focus-within:border-ring transition-colors">
    <svg class="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>

    <input
      ref="hoursInput"
      :value="hours"
      type="text"
      inputmode="numeric"
      maxlength="2"
      placeholder="00"
      class="w-6 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none text-center"
      @input="handleHoursInput"
      @blur="handleHoursBlur"
      @keydown="handleHoursKeydown"
    />

    <span class="text-muted-foreground text-sm">:</span>

    <input
      ref="minutesInput"
      :value="minutes"
      type="text"
      inputmode="numeric"
      maxlength="2"
      placeholder="00"
      class="w-6 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none text-center"
      @input="handleMinutesInput"
      @blur="handleMinutesBlur"
      @keydown="handleMinutesKeydown"
    />

    <button
      v-if="hasValue"
      type="button"
      class="text-muted-foreground hover:text-foreground transition-colors ml-1"
      title="Очистить"
      @click="clearTime"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>
