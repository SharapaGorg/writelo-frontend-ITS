<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-zinc-200 dark:border-zinc-800 py-12">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div class="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Writelo
        </div>

        <nav class="flex gap-8">
          <NuxtLink
            to="/start"
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            {{ t('landing.footer.start') }}
          </NuxtLink>
          <NuxtLink
            to="/auth"
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            {{ t('landing.footer.login') }}
          </NuxtLink>
        </nav>

        <div class="text-zinc-400 dark:text-zinc-500">
          © 2026
        </div>
      </div>
    </div>
  </footer>
</template>
