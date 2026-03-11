<template>
  <div class="flex items-center justify-center h-full w-full">
    <AuthForm/>
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
  title: 'Вход — Writelo',
  description: 'Войдите в Writelo — AI-ассистент для создания контента в соцсетях. Регистрация через Google, Telegram или email.',
  ogTitle: 'Вход в Writelo',
  ogDescription: 'AI-ассистент для SMM. Войдите или зарегистрируйтесь бесплатно.',
  ogUrl: 'https://writelo.io/auth',
  robots: 'index, follow',
})
</script>
