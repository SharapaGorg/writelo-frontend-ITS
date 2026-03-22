<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LandingPage from '~/components/landing/LandingPage.vue'

definePageMeta({
  layout: false,
  auth: false
})

const { t, locale } = useI18n()

// Насильно ставим русский
onMounted(() => {
  locale.value = 'ru'
})

// SEO
useSeoMeta({
  robots: 'index, follow',
  title: () => t('landing.seo.title'),
  description: () => t('landing.seo.description'),
  ogTitle: () => t('landing.seo.ogTitle'),
  ogDescription: () => t('landing.seo.ogDescription'),
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/ru',
})

useHead({
  htmlAttrs: {
    lang: 'ru'
  },
  link: [
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/ru' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/' },
    { rel: 'canonical', href: 'https://writelo.io/ru' },
  ],
})
</script>

<template>
  <LandingPage />
</template>
