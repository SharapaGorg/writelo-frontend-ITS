<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import MobileBottomTabBar from './MobileBottomTabBar.vue'
</script>

<template>
  <div class="app-shell flex h-screen w-screen overflow-hidden bg-background">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 overflow-auto bg-background pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <slot />
      </main>
    </div>

    <MobileBottomTabBar />
  </div>
</template>
