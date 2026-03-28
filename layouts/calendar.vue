<script setup lang="ts">
import { AppSidebar } from '~/lib-modules/app-layout'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area (no header - calendar has its own) -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <slot />
    </div>
  </div>
</template>
