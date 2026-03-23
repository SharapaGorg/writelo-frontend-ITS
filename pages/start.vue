<script setup lang="ts">
import { Routes } from '~/scripts/shared/types'

definePageMeta({
  layout: false,
  auth: false
})

// SEO Meta Tags
useSeoMeta({
  robots: 'index, follow',
  title: 'Начать работу — Writelo (Райтелло)',
  description: 'Начните создавать контент для соцсетей с AI-ассистентом Writelo (Райтелло). Бесплатный старт, без регистрации через Telegram.',
  keywords: 'Райтелло, Writelo, SMM ассистент, AI для соцсетей',
  ogTitle: 'Начать работу с Writelo (Райтелло)',
  ogDescription: 'Райтелло — AI-ассистент для SMM. Создавайте посты, тексты и картинки за минуты.',
  ogUrl: 'https://writelo.io/start',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://writelo.io/start' },
  ],
})

// Redirect to app on client
if (import.meta.client) {
  navigateTo(Routes.newConversation)
}
</script>

<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
        Writelo
      </h1>
      <p class="text-zinc-400 mb-8">Переход в приложение...</p>
      <a
        href="/app/conversations/new"
        class="text-purple-400 hover:text-purple-300 underline"
      >
        Нажмите, если не перенаправило автоматически
      </a>
    </div>
  </div>
</template>
