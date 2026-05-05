<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LandingNewPage, GOOGLE_FONTS_HREF } from '~/lib-modules/landing-new'

definePageMeta({
  layout: false,
  auth: false,
})

const { locale } = useI18n()
locale.value = 'en'

useSeoMeta({
  robots: 'index, follow',
  title: 'Writelo — Instagram trend analytics, Reels breakdowns & content calendar for SMM',
  description:
    'A platform for SMM professionals: niche-specific Instagram trend analytics, AI breakdowns of Reels (yours and competitors), brand-tailored news hooks and a content calendar — all in one tool. Free to start.',
  keywords:
    'Instagram analytics, Reels trends, Reels breakdown, AI Reels analysis, SMM content plan, news hooks for SMM, social media analytics, Writelo, AI for SMM',
  ogTitle: 'Writelo — Instagram trend analytics & Reels breakdowns',
  ogDescription:
    'Niche Instagram trends, AI Reels breakdowns, brand-tailored news hooks and a content plan — all in one.',
  ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/en',
  ogLocale: 'en_US',
  ogType: 'website',
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/ru' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/ru' },
    { rel: 'canonical', href: 'https://writelo.io/en' },
  ],
})
</script>

<template>
  <LandingNewPage />
</template>
