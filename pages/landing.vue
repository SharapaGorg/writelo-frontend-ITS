<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LandingPage from '~/components/landing/LandingPage.vue'

definePageMeta({
  layout: false,
  auth: false
})

const { t, locale } = useI18n()

// SEO: canonical points to main page to avoid duplicate content
useSeoMeta({
  robots: 'index, follow',
  title: () => t('landing.seo.title'),
  description: () => t('landing.seo.description'),
  keywords: 'Райтелло, Writelo, ИИ для SMM, AI для SMM, нейросеть для соцсетей, AI-ассистент, генерация контента, SMM автоматизация',
  ogTitle: () => t('landing.seo.ogTitle'),
  ogDescription: () => t('landing.seo.ogDescription'),
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/',
})

useHead({
  htmlAttrs: {
    lang: () => locale.value
  },
  link: [
    { rel: 'canonical', href: 'https://writelo.io/' },
  ],
})
</script>

<template>
  <LandingPage />
</template>
