<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LandingNewPage, GOOGLE_FONTS_HREF, buildLandingNewSchema } from '~/lib-modules/landing-new'

definePageMeta({
  layout: false,
  auth: false,
})

const { t, locale } = useI18n()
locale.value = 'ru'

// /landing is a duplicate of / — canonical points to / so search engines treat them as one.
useSeoMeta({
  robots: 'index, follow',
  title: () => t('landingNew.seo.title'),
  description: () => t('landingNew.seo.description'),
  keywords:
    'аналитика Instagram, тренды Reels, разбор Reels, AI разбор рилсов, контент-план SMM, инфоповоды для SMM, аналитика соцсетей, Райтелло, Writelo, нейросеть для SMM',
  ogTitle: () => t('landingNew.seo.ogTitle'),
  ogDescription: () => t('landingNew.seo.ogDescription'),
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/',
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
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/' },
    { rel: 'canonical', href: 'https://writelo.io/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildLandingNewSchema('https://writelo.io/')),
    },
  ],
})
</script>

<template>
  <LandingNewPage />
</template>
