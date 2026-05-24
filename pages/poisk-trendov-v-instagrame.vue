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
  slug: 'poisk-trendov-v-instagrame',
  shortTitle: 'Поиск трендов в Instagram',
  seoTitle: 'Поиск трендов в Instagram — ИИ-аналитика виральных Reels | Writelo',
  description:
    'База Reels с обновлением каждые 5 минут, фильтр по нише и языку, viral-score и сохранение в контент-план. Видите взлетающие форматы раньше конкурентов.',
  keywords:
    'поиск трендов в инстаграм, тренды instagram, виральные reels, аналитика reels, тренд-радар инстаграм, как найти тренд в инстаграм, тренды для smm',
}

const useCases: FeatureUseCaseItem[] = [
  {
    badge: 'SMM-фрилансер',
    title: 'Ресёрч под клиента за 15 минут',
    body: 'Открываете нишу клиента, фильтруете виральные Reels за неделю — получаете список идей и форматов, которые уже работают в его сегменте.',
  },
  {
    badge: 'Агентство',
    title: 'Бэклог идей на спринт',
    body: 'Каждый аккаунт-менеджер собирает тренды по своим брендам, выгружает в календарь — продакшен сразу видит, что снимать, без бесконечных созвонов.',
  },
  {
    badge: 'Инхаус-бренд',
    title: 'Мониторинг конкурентов и ниши',
    body: 'Фильтр по конкретным авторам и тегам — видите, что взлетает у конкурентов, и реагируете на формат, пока он не остыл.',
  },
]

const steps: FeatureStepItem[] = [
  {
    title: 'Выберите нишу или язык',
    body: 'В верхнем фильтре указываете нишу (бьюти, фуд, инфобиз, фитнес и т.д.) и язык контента. Дальше выдача собирается уже под вас.',
  },
  {
    title: 'Задайте период и пороги',
    body: 'Период (24 часа / 7 / 30 дней), минимальные охваты, viral-score. Чем уже фильтр — тем плотнее лист.',
  },
  {
    title: 'Отсортируйте по динамике',
    body: 'Сортировка по просмотрам, лайкам, темпу роста за последние 24 часа. Виральные — те, у которых охват в десятки раз больше типичного для аккаунта.',
  },
  {
    title: 'Откройте карточку Reels',
    body: 'Внутри: встроенный плеер, метрики, ссылка на оригинал, автор, дата, теги. ИИ-разбор хука и структуры — одной кнопкой.',
  },
  {
    title: 'Сохраните в календарь',
    body: 'Кнопка «В контент-план» создаёт черновик поста с привязкой к источнику. Когда снимете свою версию — публикуете оттуда же.',
  },
  {
    title: 'Скопируйте сценарий',
    body: 'Если включён ИИ-разбор, рядом лежит готовый сценарный скелет: хук, развитие, CTA. Адаптируете под свой бренд и снимаете.',
  },
]

const params: FeatureParamRow[] = [
  { name: 'Ниша', values: '40+ преднастроенных ниш + кастомные теги', note: 'Beauty, Food, Fitness, Tech, EdTech, Pets, Travel, Fashion и т.д.' },
  { name: 'Язык', values: 'Русский, английский', note: 'Под каждый язык — отдельная база Reels' },
  { name: 'Период', values: '24 часа, 7 дней, 30 дней, всё время' },
  { name: 'Минимальные охваты', values: 'От 10 000 до 10 000 000 просмотров' },
  { name: 'Viral-score', values: 'Соотношение охватов к среднему по аккаунту автора', note: 'Чем выше — тем сильнее «выстрел» относительно базового уровня автора' },
  { name: 'Автор', values: 'Фильтр по конкретному @username — отслеживание подборки конкурентов' },
  { name: 'Сортировка', values: 'Просмотры / лайки / комментарии / темп роста / дата' },
  { name: 'Сохранение', values: 'В контент-план + копирование ссылки на оригинал' },
]

const limits: FeatureLimitRow[] = [
  { feature: 'Запросов трендов в день', free: '5', pro: 'Безлимит', business: 'Безлимит + приоритет очереди' },
  { feature: 'Глубина истории', free: '7 дней', pro: '90 дней', business: '12 месяцев' },
  { feature: 'Сохранения в календарь', free: '10', pro: 'Безлимит', business: 'Безлимит' },
  { feature: 'ИИ-разбор Reels из выдачи', free: '3/день', pro: '50/день', business: 'Безлимит' },
  { feature: 'Отслеживаемых конкурентов', free: '2 аккаунта', pro: '20 аккаунтов', business: '100' },
  { feature: 'Частота обновления базы', free: 'Раз в час', pro: 'Каждые 5 минут', business: 'Каждые 5 минут' },
]

const faq: FeatureFaqItem[] = [
  {
    question: 'Откуда берутся данные про Reels?',
    answer: 'Только публичные данные открытых аккаунтов Instagram. Мы парсим публикации и метрики — то же, что вы сами видите при заходе на профиль, только агрегированно и с историей.',
  },
  {
    question: 'Можно ли скачать видео?',
    answer: 'Прямой загрузки нет — это политика Instagram. Но в карточке есть ссылка на оригинал и встроенный плеер. Для своих Reels (через подключённый аккаунт) появляются дополнительные данные удержания.',
  },
  {
    question: 'Как часто обновляется база?',
    answer: 'На Pro и Business — каждые 5 минут. На Free — раз в час. Это значит, что «свежий» тренд вы увидите практически в момент его появления, а не через сутки.',
  },
  {
    question: 'Можно ли отслеживать конкретного конкурента?',
    answer: 'Да. Добавляете @username в список отслеживаемых, фильтруете выдачу только по нему. На Business дополнительно приходит уведомление, когда у конкурента появляется виральный Reels.',
  },
  {
    question: 'А TikTok / YouTube Shorts будут?',
    answer: 'TikTok — в ближайшем релизе. YouTube Shorts — на исследовании, добавим, когда сможем гарантировать ту же глубину аналитики, что у Reels.',
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
      breadcrumb="Поиск трендов в Instagram"
      title="Поиск трендов"
      title-accent="в Instagram"
      lead="База Reels с обновлением каждые 5 минут, фильтрация под вашу нишу и автоматическое выявление виральных форматов. Видите, что взлетает прямо сейчас, до того как этот формат подхватят все вокруг."
      cta-label="Открыть тренды"
      cta-to="/app/trends"
    />

    <FeatureSection
      label="Что это"
      title="Тренд-радар по Instagram Reels"
      lead="Writelo собирает публичные Reels из тысяч аккаунтов, считает динамику просмотров и помечает «виральные» — те, у которых охват в десятки раз превышает типичный для автора. Лента режется по нишам и языкам, чтобы вы видели только релевантное."
    >
      <p
        class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094] max-w-[64ch]"
      >
        Это не общая лента «сейчас на пике», как в TrendSee или похожих сервисах. Это узкий радар: задаёте нишу — получаете тренды, которые работают именно в ней. Бьюти-блогер не увидит виральный фитнес-челлендж, а инфобизнес не получит видео про корм для собак.
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
      title="Шаги от запроса до публикации"
      lead="Типовой сценарий: открыли раздел «Тренды» в приложении, отфильтровали под нишу, сохранили 5-7 идей в контент-план. Время — 10-15 минут."
    >
      <FeatureSteps :steps="steps" />
    </FeatureSection>

    <FeatureSection
      label="Параметры"
      title="Что можно настроить"
      lead="Фильтры применяются мгновенно — в выдаче остаются только Reels, прошедшие все условия одновременно."
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
      page="trends"
      title="Откройте, что взлетает в вашей нише"
      body="Бесплатный тариф — 5 запросов в день. Никакой регистрации картой, никаких списаний. Зайдёте, посмотрите выдачу под свою нишу за пару минут."
      cta-label="Попробовать бесплатно"
      cta-to="/app/trends"
    />
  </FeaturePageShell>
</template>
