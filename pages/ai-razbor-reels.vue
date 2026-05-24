<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  FeaturePageShell,
  FeatureHero,
  FeatureSection,
  FeatureSteps,
  FeatureUseCases,
  FeatureParamsTable,
  FeatureLimitsTable,
  FeatureFaq,
  FeatureFinalCta,
  buildFeaturePageSchema,
  featureCanonical,
  type FeaturePageMeta,
  type FeatureFaqItem,
  type FeatureStepItem,
  type FeatureUseCaseItem,
  type FeatureParamRow,
  type FeatureLimitRow,
} from '~/lib-modules/landing-features'
import { GOOGLE_FONTS_HREF } from '~/lib-modules/landing-new'

definePageMeta({
  layout: false,
  auth: false,
})

const { locale } = useI18n()
locale.value = 'ru'

const meta: FeaturePageMeta = {
  slug: 'ai-razbor-reels',
  shortTitle: 'ИИ разбор Reels',
  seoTitle: 'ИИ разбор Reels — анализ хука, удержания и CTA по ссылке | Writelo',
  description:
    'Вставьте ссылку на Reels — получите покадровый разбор: где заходит хук, в какой момент уходит аудитория, что в CTA, какие приёмы сработали. Свои и чужие Reels.',
  keywords:
    'ии разбор reels, ai разбор reels, анализ рилс, разбор рилс инстаграм, как анализировать reels, анализатор видео, удержание в reels, хук в рилс',
}

const useCases: FeatureUseCaseItem[] = [
  {
    badge: 'Контент-мейкер',
    title: 'Проверка своих Reels',
    body: 'Опубликовали — загнали в анализатор. Смотрите, в какой секунде люди начали отваливаться, что вышло слабо в CTA. На следующем ролике уже не повторяете тех же ошибок.',
  },
  {
    badge: 'Продюсер / стратег',
    title: 'Разбор конкурентов',
    body: 'Накидываете 5 ссылок на чужие виральные Reels — получаете унифицированный разбор: общие приёмы, паттерны хуков, длины удержания. Видите, что у них работает.',
  },
  {
    badge: 'Коуч / инфобизнес',
    title: 'Поиск эталонов',
    body: 'Ищете референсы под свою нишу, прогоняете через разбор — получаете не «нравится / не нравится», а структурный разбор: вот это форматный приём, его можно адаптировать.',
  },
]

const steps: FeatureStepItem[] = [
  {
    title: 'Вставьте ссылку на Reels',
    body: 'Любая публичная ссылка из Instagram. Можно сразу несколько в очередь — разберём параллельно.',
  },
  {
    title: 'Дождитесь обработки',
    body: 'Видео скачивается, транскрибируется, разбирается мультимодальной моделью. Обычно 30-90 секунд на ролик длиной до минуты.',
  },
  {
    title: 'Изучите разбор',
    body: 'Хук (0-3 сек), развитие, кульминация, CTA. По каждому блоку — что сделано, на что опирается приём, насколько сильно/слабо. Транскрипт с тайм-кодами и точками падения внимания.',
  },
  {
    title: 'Скопируйте в работу',
    body: 'Кнопка «Скопировать рекомендации в редактор» — переносит структурный скелет в новый черновик поста. Дальше вы переписываете под свой голос и снимаете.',
  },
]

const params: FeatureParamRow[] = [
  { name: 'Источник', values: 'Ссылка на публичный Reels из Instagram', note: 'TikTok — в дорожной карте' },
  { name: 'Глубина анализа', values: 'Быстрый (15-30 сек) / Детальный (60-90 сек)', note: 'Быстрый — для bulk-просмотра; детальный — для разборки до кадра' },
  { name: 'Фокус разбора', values: 'Хук / Удержание / CTA / Структура / Всё сразу' },
  { name: 'Транскрипт', values: 'Полная расшифровка речи с тайм-кодами', note: 'Точность зависит от качества звука; для русского и английского — выше 95%' },
  { name: 'Кадровая разметка', values: 'Деление видео на смысловые блоки с пояснением, что в каждом', note: 'Только в детальном режиме' },
  { name: 'Сравнение с эталоном', values: 'Структура vs «классический» хук-развитие-CTA — где совпадает, где сломано' },
  { name: 'Экспорт', values: 'В редактор поста / в Markdown / по ссылке (Pro)', note: 'Готовый разбор можно перенести в черновик поста одной кнопкой' },
]

const limits: FeatureLimitRow[] = [
  { feature: 'Разборов в день', free: '3', pro: '50', business: 'Безлимит' },
  { feature: 'Длина ролика', free: 'До 60 секунд', pro: 'До 3 минут', business: 'До 10 минут' },
  { feature: 'Параллельная обработка', free: '1 в очереди', pro: '5 параллельно', business: '20 параллельно' },
  { feature: 'История разборов', free: '7 дней', pro: '90 дней', business: 'Без ограничения' },
  { feature: 'Сравнение нескольких Reels', free: 'Нет', pro: 'До 5 в одном отчёте', business: 'До 20 в одном отчёте' },
]

const faq: FeatureFaqItem[] = [
  {
    question: 'Какие форматы видео поддерживаются?',
    answer: 'Сейчас — Reels из Instagram по публичной ссылке. В дорожной карте: TikTok, YouTube Shorts, и загрузка локального файла.',
  },
  {
    question: 'Можно ли разобрать TikTok?',
    answer: 'TikTok пока в работе. По ссылкам на видеохостинги вне Instagram анализ запустится в следующем мажорном релизе.',
  },
  {
    question: 'Что с приватными аккаунтами?',
    answer: 'Только публичные Reels. Если хотите разбирать свой приватный — сделайте аккаунт временно открытым, либо подключите его к Writelo: для подключённых аккаунтов анализ работает независимо от приватности.',
  },
  {
    question: 'Сколько занимает обработка?',
    answer: 'Быстрый разбор — 15-30 секунд. Детальный — 60-90 секунд для роликов до минуты. Большие видео (на Business) — пропорционально дольше.',
  },
  {
    question: 'Насколько точен ИИ?',
    answer: 'Транскрипт — выше 95% для русского и английского при чистом звуке. Структурный разбор (хук/удержание/CTA) — это интерпретация мультимодальной модели, она помогает выделить паттерны, но финальное решение всё равно за вами.',
  },
]

const canonical = featureCanonical(meta.slug)

useSeoMeta({
  robots: 'index, follow',
  title: meta.seoTitle,
  description: meta.description,
  keywords: meta.keywords,
  ogTitle: meta.ogTitle ?? meta.seoTitle,
  ogDescription: meta.description,
  ogImage: '/og-image.svg',
  ogUrl: canonical,
  ogLocale: 'ru_RU',
  ogType: 'website',
})

useHead({
  htmlAttrs: { lang: 'ru' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS_HREF },
    { rel: 'canonical', href: canonical },
    { rel: 'alternate', hreflang: 'ru', href: canonical },
    { rel: 'alternate', hreflang: 'x-default', href: canonical },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildFeaturePageSchema(meta, faq)),
    },
  ],
})
</script>

<template>
  <FeaturePageShell>
    <FeatureHero
      breadcrumb="ИИ разбор Reels"
      title="ИИ разбор"
      title-accent="Reels"
      lead="Скиньте ссылку на свой или чужой Reels — получите покадровый разбор. Где зашёл хук, в какой момент теряется аудитория, что в CTA, какие приёмы сработали."
      cta-label="Разобрать Reels"
      cta-to="/app/video-analyzer"
    />

    <FeatureSection
      label="Что это"
      title="Видеоаналитика Reels через мультимодальный ИИ"
      lead="Не «дайте мне отзыв на моё видео», а структурный разбор. Транскрипция, кадровая разметка, проверка хука, оценка удержания, разбор CTA. Подсветим, где «провал» по структуре и почему он мог случиться."
    >
      <p
        class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094] max-w-[64ch]"
      >
        Чужие Reels анализируются «снаружи» — по тому, что видно в кадре и звуке. Свои Reels, подключённые через ваш аккаунт, разбираются глубже: ИИ сопоставляет структурные точки с реальной кривой удержания и говорит не «здесь должен быть провал», а «здесь у вас реально упало внимание».
      </p>
    </FeatureSection>

    <FeatureSection
      label="Для кого"
      title="Кому это полезно"
    >
      <FeatureUseCases :items="useCases" />
    </FeatureSection>

    <FeatureSection
      label="Как пользоваться"
      title="Шаги от ссылки до выводов"
    >
      <FeatureSteps :steps="steps" />
    </FeatureSection>

    <FeatureSection
      label="Параметры"
      title="Что можно настроить"
      lead="«Быстрый» режим — для просмотра 20-30 роликов подряд при ресёрче. «Детальный» — когда хотите разобрать один ролик до секунды."
    >
      <FeatureParamsTable :rows="params" />
    </FeatureSection>

    <FeatureSection
      label="Лимиты"
      title="Что доступно на каждом тарифе"
    >
      <FeatureLimitsTable :rows="limits" />
    </FeatureSection>

    <FeatureSection
      label="FAQ"
      title="Частые вопросы"
    >
      <FeatureFaq :items="faq" />
    </FeatureSection>

    <FeatureFinalCta
      page="video-analyzer"
      title="Разберите Reels — свой или чужой — за минуту"
      body="Бесплатный тариф — 3 разбора в день. Хватит, чтобы понять формат отчёта и решить, помогает ли он в работе. Без карты, без обязательств."
      cta-label="Попробовать бесплатно"
      cta-to="/app/video-analyzer"
    />
  </FeaturePageShell>
</template>
