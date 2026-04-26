// JSON-LD factory for landing-new. RU-only by design until landingNew.*
// i18n keys are translated. See docs/superpowers/specs/2026-04-26-landing-new-seo-design.md.
//
// `WebSite.url` is intentionally hardcoded to https://writelo.io/ (site-level
// identity, deduplicated by `@id`); only `SoftwareApplication.url` reflects
// the per-page canonical via the `canonicalUrl` parameter.
export function buildLandingNewSchema(canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://writelo.io/#website',
        url: 'https://writelo.io/',
        name: 'Writelo',
        alternateName: 'Райтелло',
        description:
          'Платформа для SMM: аналитика трендов Instagram, ИИ-разбор Reels, инфоповоды под бренд и контент-календарь.',
        inLanguage: 'ru-RU',
      },
      {
        '@type': 'Organization',
        '@id': 'https://writelo.io/#organization',
        name: 'Writelo',
        alternateName: 'Райтелло',
        url: 'https://writelo.io/',
        logo: 'https://writelo.io/og-image.svg',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://writelo.io/#software',
        name: 'Writelo',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Social Media Management',
        operatingSystem: 'Web',
        description:
          'Аналитика трендов Instagram, ИИ-разбор Reels, инфоповоды под бренд и контент-календарь для SMM-специалистов и агентств.',
        url: canonicalUrl,
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'RUB',
            description:
              '1 бренд, 5 запросов трендов в день, инфоповоды и календарь, базовый редактор',
          },
          {
            '@type': 'Offer',
            name: 'Pro',
            price: '990',
            priceCurrency: 'RUB',
            description:
              'До 10 брендов, безлимитный анализ трендов, кросспостинг IG/TG/VK',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '990',
              priceCurrency: 'RUB',
              unitCode: 'MON',
            },
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://writelo.io/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Что такое Writelo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Writelo (Райтелло) — платформа для SMM-специалистов и агентств. Объединяет аналитику трендов Instagram под нишу, ИИ-разбор Reels (своих и конкурентов), инфоповоды под бренд и контент-календарь. Один инструмент вместо TrendSee + LiveDune + SMMplanner.',
            },
          },
          {
            '@type': 'Question',
            name: 'Чем Writelo отличается от TrendSee, LiveDune и SMMplanner?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Writelo объединяет три задачи в одном: анализ рилсов и трендов (как TrendSee), создание контента под бренд с ИИ (своя ниша) и планирование с автопостингом (как SMMplanner). При этом тренды и инфоповоды подбираются под конкретный бренд, а не общей лентой.',
            },
          },
          {
            '@type': 'Question',
            name: 'Как работает анализ трендов Instagram?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Writelo обновляет базу рилсов каждые 5 минут и подбирает тренды под вашу нишу — с охватами, динамикой и ссылками на исходные рилсы. Тренды можно сортировать, фильтровать и сохранять в календарь.',
            },
          },
          {
            '@type': 'Question',
            name: 'Можно ли разобрать чужой Reels по ссылке?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Да. Скиньте ссылку на рилс конкурента — получите разбор: хук, развитие, CTA, какие приёмы использованы. Свои Reels анализируются глубже: ИИ покадрово показывает, в какой момент теряется аудитория и почему.',
            },
          },
          {
            '@type': 'Question',
            name: 'Сколько стоит Writelo?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Бесплатный тариф позволяет попробовать платформу: 1 бренд, 5 запросов трендов в день, базовый редактор. Pro — 990 ₽/мес: до 10 брендов, безлимитный анализ трендов, публикация в IG/TG/VK. Business — по запросу: командные роли, white-label, приоритетная поддержка.',
            },
          },
        ],
      },
    ],
  }
}
