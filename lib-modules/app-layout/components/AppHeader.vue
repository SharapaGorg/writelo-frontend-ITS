<script setup lang="ts">
import { User } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
</script>

<template>
  <header
    class="flex items-center justify-between h-14 px-4 border-b border-border bg-background"
  >
    <!-- Left Section: Logo/Brand -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/app" class="font-semibold text-lg">
        Writelo
      </NuxtLink>
    </div>

    <!-- Right Section: Subscription + Profile -->
    <div class="flex items-center gap-3">
      <!-- Subscription Badge placeholder -->
      <div class="hidden sm:flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        Pro
      </div>

      <!-- Profile Button -->
      <NuxtLink to="/app/profile">
        <Button variant="ghost" size="icon" class="h-9 w-9">
          <User class="h-5 w-5" />
        </Button>
      </NuxtLink>
    </div>
  </header>
</template>
