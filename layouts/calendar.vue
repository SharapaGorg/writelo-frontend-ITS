<script setup lang="ts">
import { AppSidebar, MobileBottomTabBar } from '~/lib-modules/app-layout'
</script>

<template>
  <div class="app-shell flex h-dvh w-screen overflow-hidden bg-background">
    <AppSidebar />

    <div class="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
      <MobileBottomTabBar />
    </div>
  </div>
</template>
