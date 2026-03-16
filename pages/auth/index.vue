<template>
  <div class="h-full w-full overflow-y-auto">
    <div class="flex items-center justify-center min-h-full w-full py-6 px-2">
      <AuthForm/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {AuthForm} from "~/lib-modules/web-auth";
import {definePageMeta} from "#imports";

definePageMeta({
  layout: false
})

// SEO Meta Tags
useSeoMeta({
  title: 'Вход — Writelo (Райтелло)',
  description: 'Войдите в Writelo (Райтелло) — AI-ассистент для создания контента в соцсетях. Регистрация через Google, Telegram или email.',
  keywords: 'Райтелло, Writelo, вход, регистрация, AI ассистент',
  ogTitle: 'Вход в Writelo (Райтелло)',
  ogDescription: 'Райтелло — AI-ассистент для SMM. Войдите или зарегистрируйтесь бесплатно.',
  ogUrl: 'https://writelo.io/auth',
  robots: 'index, follow',
})
</script>
