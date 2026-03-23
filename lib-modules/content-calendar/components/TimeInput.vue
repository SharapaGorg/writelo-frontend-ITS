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

// Parse modelValue into hours/minutes
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

// Emit combined value
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

  // Validate range
  const num = parseInt(val, 10)
  if (!isNaN(num) && num > 23) {
    val = '23'
  }

  hours.value = val
  input.value = val

  // Auto-jump to minutes after 2 digits
  if (val.length === 2) {
    minutesInput.value?.focus()
    minutesInput.value?.select()
  }
}

function handleMinutesInput(e: Event) {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/\D/g, '').slice(0, 2)

  // Validate range
  const num = parseInt(val, 10)
  if (!isNaN(num) && num > 59) {
    val = '59'
  }

  minutes.value = val
  input.value = val
}

function handleHoursBlur() {
  // Pad single digit
  if (hours.value.length === 1) {
    hours.value = hours.value.padStart(2, '0')
  }
  emitValue()
}

function handleMinutesBlur() {
  // Pad single digit
  if (minutes.value.length === 1) {
    minutes.value = minutes.value.padStart(2, '0')
  }
  emitValue()
}

function handleHoursKeydown(e: KeyboardEvent) {
  // Arrow right at end -> go to minutes
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
  // Arrow left at start -> go to hours
  if (e.key === 'ArrowLeft') {
    const input = e.target as HTMLInputElement
    if (input.selectionStart === 0) {
      e.preventDefault()
      hoursInput.value?.focus()
      const len = hours.value.length
      hoursInput.value?.setSelectionRange(len, len)
    }
  }
  // Backspace at start -> go to hours
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

// Sync from model
watch(() => props.modelValue, (val) => {
  parseModel(val)
}, { immediate: true })

const hasValue = computed(() => hours.value || minutes.value || props.modelValue)
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500 transition-colors">
    <!-- Clock icon -->
    <svg class="w-4 h-4 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>

    <!-- Hours -->
    <input
      ref="hoursInput"
      :value="hours"
      type="text"
      inputmode="numeric"
      maxlength="2"
      placeholder="00"
      class="w-6 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none text-center"
      @input="handleHoursInput"
      @blur="handleHoursBlur"
      @keydown="handleHoursKeydown"
    />

    <span class="text-zinc-500 text-sm">:</span>

    <!-- Minutes -->
    <input
      ref="minutesInput"
      :value="minutes"
      type="text"
      inputmode="numeric"
      maxlength="2"
      placeholder="00"
      class="w-6 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none text-center"
      @input="handleMinutesInput"
      @blur="handleMinutesBlur"
      @keydown="handleMinutesKeydown"
    />

    <!-- Clear button -->
    <button
      v-if="hasValue"
      type="button"
      class="text-zinc-600 hover:text-zinc-400 transition-colors ml-1"
      title="Очистить"
      @click="clearTime"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>
