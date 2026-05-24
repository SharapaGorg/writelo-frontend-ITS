import type { FeatureFaqItem, FeaturePageMeta } from '../types'

const SITE_BASE = 'https://writelo.io'

export function featureCanonical(slug: string): string {
  return `${SITE_BASE}/${slug}`
}

export function buildFeaturePageSchema(
  meta: FeaturePageMeta,
  faq: FeatureFaqItem[],
) {
  const canonical = featureCanonical(meta.slug)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Главная',
            item: `${SITE_BASE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: meta.shortTitle,
            item: canonical,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonical}#software`,
        name: 'Writelo',
        alternateName: 'Райтелло',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Social Media Management',
        operatingSystem: 'Web',
        url: canonical,
        description: meta.description,
      },
      ...(faq.length
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${canonical}#faq`,
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  }
}
