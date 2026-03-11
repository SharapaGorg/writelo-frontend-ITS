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
  keywords: 'ИИ для SMM, AI для SMM, нейросеть для соцсетей, AI-ассистент, генерация контента, SMM автоматизация',
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
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/' },
    { rel: 'alternate', hreflang: 'en', href: 'https://writelo.io/?lang=en' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/' },
    { rel: 'canonical', href: 'https://writelo.io/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': 'https://writelo.io/#website',
            'url': 'https://writelo.io/',
            'name': 'Writelo',
            'description': 'AI-ассистент для создания контента в соцсетях',
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
          }
        ]
      })
    }
  ]
})
</script>

<template>
  <LandingPage />
</template>
