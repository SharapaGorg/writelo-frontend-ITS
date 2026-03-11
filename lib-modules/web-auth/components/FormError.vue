<template>
  <span v-if="error" class="text-sm text-destructive">
    {{ error }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  error?: string
}

defineProps<Props>()
</script>