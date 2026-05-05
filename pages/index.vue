<script setup lang="ts">
// / is normally redirected server-side to /ru or /en by
// server/middleware/locale-redirect.ts. This page is a fallback for cases
// where the redirect didn't fire (cached HTML, edge proxies, no Accept-Language).
// noindex + meta-refresh + JS replace makes sure crawlers and humans both end
// up on the canonical localized URL and / never appears in SERPs.
definePageMeta({
  layout: false,
  auth: false,
})

useSeoMeta({
  robots: 'noindex, nofollow',
})

useHead({
  htmlAttrs: { lang: 'ru' },
  meta: [{ 'http-equiv': 'refresh', content: '0;url=/ru' }],
  link: [{ rel: 'canonical', href: 'https://writelo.io/ru' }],
})

if (import.meta.client) {
  const lang = (navigator.language || 'ru').split('-')[0].toLowerCase()
  const target = lang === 'en' ? '/en' : '/ru'
  window.location.replace(target)
}
</script>

<template>
  <div />
</template>
