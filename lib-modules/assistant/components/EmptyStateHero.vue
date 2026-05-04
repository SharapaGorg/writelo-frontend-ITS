<script setup lang="ts">
const SUGGESTED = [
  'Дай 5 идей для рилса в нише бьюти',
  'Что сейчас в трендах у инфлюенсеров',
  'Напиши хук для поста про новый продукт',
  'Анализ моего бренда: с чего начать',
]

const emit = defineEmits<{
  (e: 'pick', text: string): void
}>()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-8 text-center">
    <h2 class="mb-2 text-2xl font-semibold">Чем поможет?</h2>
    <p class="mb-6 text-sm text-muted-foreground">
      Спроси про идеи постов, тренды, или просто поговори про свой бренд
    </p>
    <div class="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        v-for="prompt in SUGGESTED"
        :key="prompt"
        class="rounded-md border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
        @click="emit('pick', prompt)"
      >
        {{ prompt }}
      </button>
    </div>
  </div>
</template>
