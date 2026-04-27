<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Gift, ShoppingCart } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

type PurchaseMode = 'self' | 'gift'

const emit = defineEmits<{
  (e: 'purchase', mode: PurchaseMode): void
}>()

defineProps<{
  disabled?: boolean
}>()

const isOpen = ref(false)
</script>

<template>
  <div class="mt-auto flex w-full">
    <Button
      class="flex-1 rounded-r-none"
      :disabled="disabled"
      @click="emit('purchase', 'self')"
    >
      <ShoppingCart class="h-4 w-4" />
      <span>Купить</span>
    </Button>

    <DropdownMenu v-model:open="isOpen">
      <DropdownMenuTrigger as-child>
        <Button
          class="rounded-l-none border-l border-l-brand-foreground/25 px-3"
          :disabled="disabled"
          aria-label="Другие варианты покупки"
        >
          <ChevronDown
            :class="['h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180']"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        class="bg-brand text-brand-foreground border-brand/40 p-1.5"
      >
        <DropdownMenuItem
          class="cursor-pointer py-2.5 focus:bg-brand-foreground/15 focus:text-brand-foreground"
          @select="emit('purchase', 'self')"
        >
          <ShoppingCart class="h-4 w-4" />
          <span>Купить</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          class="cursor-pointer py-2.5 focus:bg-brand-foreground/15 focus:text-brand-foreground"
          @select="emit('purchase', 'gift')"
        >
          <Gift class="h-4 w-4" />
          <span>Купить в подарок</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
