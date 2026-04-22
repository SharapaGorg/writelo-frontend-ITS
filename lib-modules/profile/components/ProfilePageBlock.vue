<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

defineProps<{
  headerClass?: string
  contentClass?: string
}>()

const hasHeader = !!useSlots().header
</script>

<template>
  <Card class="gap-3 py-5">
    <CardHeader v-if="hasHeader" class="px-5">
      <CardTitle :class="['text-base font-semibold', headerClass]">
        <slot name="header" />
      </CardTitle>
    </CardHeader>

    <CardContent :class="['px-5', contentClass]">
      <slot name="content" />
    </CardContent>
  </Card>
</template>
