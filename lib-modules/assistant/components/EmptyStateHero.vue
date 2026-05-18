<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const suggested = computed(() => [
  t('assistantPage.empty.suggestions.reelIdeas'),
  t('assistantPage.empty.suggestions.trends'),
  t('assistantPage.empty.suggestions.hook'),
  t('assistantPage.empty.suggestions.brandAnalysis'),
])

const emit = defineEmits<{
  (e: 'pick', text: string): void
}>()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-8 text-center">
    <h2 class="mb-2 text-2xl font-semibold">{{ t('assistantPage.empty.title') }}</h2>
    <p class="mb-6 text-sm text-muted-foreground">
      {{ t('assistantPage.empty.description') }}
    </p>
    <div class="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
      <button
        v-for="prompt in suggested"
        :key="prompt"
        class="rounded-md border border-border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
        @click="emit('pick', prompt)"
      >
        {{ prompt }}
      </button>
    </div>
  </div>
</template>
