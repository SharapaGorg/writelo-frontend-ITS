<script setup lang="ts">
import { AppLayout } from '~/lib-modules/app-layout'
import { DemoAuthModal } from '~/lib-modules/demo-mode'
</script>

<template>
  <AppLayout>
    <slot />
    <DemoAuthModal />
  </AppLayout>
</template>
