<template>
  <div class="relative" ref="menuRef">
    <div class="flex">
      <Button 
        :variant="variant" 
        :size="size" 
        @click="handleDownload"
        class="split-button__main"
        :disabled="disabled"
      >
        <slot name="icon">
          <Download class="w-4 h-4" />
        </slot>
        <span>{{ buttonText }}</span>
      </Button>
      <Button 
        :variant="variant" 
        :size="size" 
        @click="toggleMenu"
        class="split-button__chevron"
        :disabled="disabled"
      >
        <ChevronDown 
          class="w-3 h-3 transition-transform duration-200" 
          :class="{ 'rotate-180': showMenu }"
        />
      </Button>
    </div>
    
    <!-- Options menu -->
    <Transition name="dropdown">
      <div v-if="showMenu" class="split-button__menu">
        <button 
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option.value)"
          class="split-button__option"
          :class="{ 'split-button__option--active': modelValue === option.value }"
        >
          <span>{{ option.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Download, ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  buttonPrefix?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'download', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  buttonPrefix: 'Выбрать',
  variant: 'secondary',
  size: 'sm',
  disabled: false
})

const emit = defineEmits<Emits>()

const showMenu = ref(false)
const menuRef = ref<HTMLDivElement>()

const buttonText = computed(() => {
  const selectedOption = props.options.find(opt => opt.value === props.modelValue)
  return selectedOption ? `${props.buttonPrefix} ${selectedOption.label}` : props.buttonPrefix
})

const toggleMenu = () => {
  if (!props.disabled) {
    showMenu.value = !showMenu.value
  }
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  showMenu.value = false
}

const handleDownload = () => {
  if (!props.disabled) {
    emit('download', props.modelValue)
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.split-button__main {
  @apply rounded-r-none border-r-0;
}

.split-button__chevron {
  @apply rounded-l-none px-2;
}

.split-button__menu {
  @apply absolute top-full left-0 mt-1 z-10
  bg-background border border-border rounded-md shadow-lg
  min-w-[120px] py-1 origin-top;
}

.split-button__option {
  @apply w-full px-3 py-2 text-left text-sm
  hover:bg-muted transition-colors
  border-none bg-transparent cursor-pointer;
}

.split-button__option:hover {
  @apply bg-muted;
}

.split-button__option--active {
  @apply bg-primary/10 text-primary font-medium;
}

/* Dropdown transitions */
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}
</style>