<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LandingNewPage, GOOGLE_FONTS_HREF, buildLandingNewSchema } from '~/lib-modules/landing-new'

definePageMeta({
  layout: false,
  auth: false,
})

const { locale } = useI18n()
locale.value = 'ru'

useSeoMeta({
  robots: 'index, follow',
  title: 'Райтелло — инструмент для SMM: тренды Instagram, разбор Reels и контент-план',
  description:
    'Райтелло — российская платформа для SMM-специалистов и агентств. Тренды Instagram под нишу, ИИ-разбор Reels конкурентов, инфоповоды под бренд и контент-календарь с автопостингом.',
  keywords:
    'Райтелло, инструмент для SMM, ИИ для SMM, тренды Instagram, разбор Reels, рилсы конкурентов, контент-план SMM, инфоповоды, аналитика соцсетей, российский SMM-сервис',
  ogTitle: 'Райтелло — инструмент для SMM и аналитики Instagram',
  ogDescription: 'Райтелло: тренды Instagram под нишу, ИИ-разбор Reels, инфоповоды под бренд и контент-план — российский сервис для SMM.',
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/ru',
  ogLocale: 'ru_RU',
  ogType: 'website',
})

useHead({
  htmlAttrs: { lang: 'ru' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/ru' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/ru' },
    { rel: 'canonical', href: 'https://writelo.io/ru' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildLandingNewSchema('https://writelo.io/ru')),
    },
  ],
})
</script>

<template>
  <LandingNewPage />
</template>
