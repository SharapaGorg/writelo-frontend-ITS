<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LandingPage from '~/components/landing/LandingPage.vue'

definePageMeta({
  layout: false,
  auth: false
})

const { t, locale } = useI18n()

// SEO Meta Tags
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

// Schema.org structured data for SEO
const schemaData = computed(() => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://writelo.io/#website',
      'url': 'https://writelo.io/',
      'name': 'Writelo',
      'alternateName': 'Райтелло',
      'description': 'Райтелло — AI-ассистент для создания контента в соцсетях',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://writelo.io/start',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'Organization',
      '@id': 'https://writelo.io/#organization',
      'name': 'Writelo',
      'alternateName': 'Райтелло',
      'url': 'https://writelo.io/',
      'logo': 'https://writelo.io/og-image.svg'
    },
    {
      '@type': 'SiteNavigationElement',
      'name': 'Начать работу',
      'url': 'https://writelo.io/start'
    },
    {
      '@type': 'SiteNavigationElement',
      'name': 'Вход',
      'url': 'https://writelo.io/auth'
    },
    {
      '@type': 'SiteNavigationElement',
      'name': 'О сервисе',
      'url': 'https://writelo.io/'
    },
    // Video structured data for Google indexing
    {
      '@type': 'VideoObject',
      'name': t('landing.demo.title'),
      'description': t('landing.demo.description'),
      'thumbnailUrl': 'https://writelo.io/landing/poster.png',
      'uploadDate': '2026-03-12',
      'duration': 'PT52S',
      'contentUrl': 'https://writelo.io/landing/promo.mp4',
      'embedUrl': 'https://writelo.io/',
    },
    {
      '@type': 'VideoObject',
      'name': t('landing.features.clients.title'),
      'description': t('landing.features.clients.description'),
      'thumbnailUrl': 'https://writelo.io/og-image.svg',
      'uploadDate': '2026-03-12',
      'duration': 'PT38S',
      'contentUrl': 'https://writelo.io/landing/clients.mp4',
      'embedUrl': 'https://writelo.io/',
    },
    {
      '@type': 'VideoObject',
      'name': t('landing.features.content.title'),
      'description': t('landing.features.content.description'),
      'thumbnailUrl': 'https://writelo.io/og-image.svg',
      'uploadDate': '2026-03-12',
      'duration': 'PT19S',
      'contentUrl': 'https://writelo.io/landing/content-plan.mp4',
      'embedUrl': 'https://writelo.io/',
    },
    {
      '@type': 'VideoObject',
      'name': t('landing.features.images.title'),
      'description': t('landing.features.images.description'),
      'thumbnailUrl': 'https://writelo.io/og-image.svg',
      'uploadDate': '2026-03-12',
      'duration': 'PT23S',
      'contentUrl': 'https://writelo.io/landing/image-generator.mp4',
      'embedUrl': 'https://writelo.io/',
    },
  ],
}))

useHead({
  htmlAttrs: {
    lang: () => locale.value
  },
  link: [
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/?lang=en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/' },
    { rel: 'canonical', href: 'https://writelo.io/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(schemaData.value),
    }
  ]
})
</script>

<template>
  <LandingPage />
</template>
