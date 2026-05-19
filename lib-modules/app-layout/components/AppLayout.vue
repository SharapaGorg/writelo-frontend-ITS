<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import MobileBottomTabBar from './MobileBottomTabBar.vue'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <main class="flex-1 overflow-auto bg-background pb-14 md:pb-0">
        <slot />
      </main>
    </div>

    <MobileBottomTabBar />
  </div>
</template>
