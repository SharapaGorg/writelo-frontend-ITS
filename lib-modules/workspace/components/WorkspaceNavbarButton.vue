<script setup lang="ts">
import { LayoutPanelLeft } from 'lucide-vue-next'
import { isMobile } from '~/scripts/features/utils'

const isDesktop = computed(() => !isMobile())
</script>

<template>
  <NuxtLink v-if="isDesktop" to="/app/workspace">
    <Button id="workspace-button" variant="outline" size="icon" title="Split Workspace">
      <LayoutPanelLeft />
    </Button>
  </NuxtLink>
</template>
