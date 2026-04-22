<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Page Content -->
      <main class="flex-1 overflow-auto bg-white dark:bg-zinc-950">
        <slot />
      </main>
    </div>
  </div>
</template>
