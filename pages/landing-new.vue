<script setup lang="ts">
import { LandingNewPage, GOOGLE_FONTS_HREF } from '~/lib-modules/landing-new'

definePageMeta({
  layout: false,
  auth: false,
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },
  ],
})

useSeoMeta({
  robots: 'index, follow',
  title: 'Writelo — платформа для SMM, без обещаний, что AI напишет за вас',
  description:
    'Ресёрч трендов Instagram, инфоповоды под бренд и календарь, где это собирается в план. Платформа для SMM-фрилансеров, команд и агентств.',
})
</script>

<template>
  <LandingNewPage />
</template>
