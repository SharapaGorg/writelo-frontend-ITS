<script setup lang="ts">
import { ContentCalendarPage } from '~/lib-modules/content-calendar'

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 1024
})

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Идеи — Контент-календарь | Writelo',
  description: 'Планируйте контент для социальных сетей с помощью удобного календаря'
})
</script>

<template>
  <div
    v-if="isMobile"
    class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
  >
    <div class="text-4xl mb-4">💻</div>
    <h1 class="text-xl font-bold text-zinc-100 mb-2">Откройте на компьютере</h1>
    <p class="text-zinc-400 max-w-xs">
      Контент-календарь оптимизирован для работы на большом экране
    </p>
    <NuxtLink
      to="/landing"
      class="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
    >
      На главную
    </NuxtLink>
  </div>
  <ContentCalendarPage v-else />
</template>
