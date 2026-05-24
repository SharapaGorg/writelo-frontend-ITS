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
  slug: 'brif-brenda-dlya-ai',
  shortTitle: 'Бриф бренда для ИИ',
  seoTitle: 'Бриф бренда для ИИ — настройка под Tone of Voice и нишу | Writelo',
  description:
    'Один раз заполняете карточку бренда — ниша, описание, ЦА, Tone of Voice, стоп-слова, примеры постов — и весь генерируемый контент подстраивается под ваш стиль.',
  keywords:
    'бриф бренда, бриф для ии, настройка ии под бренд, tone of voice ии, стоп-слова для нейросети, бренд-бук для ai, ии под смм, генерация постов под бренд',
}

const useCases: FeatureUseCaseItem[] = [
  {
    badge: 'Агентство',
    title: 'Несколько клиентов в одном аккаунте',
    body: 'Под каждого клиента — отдельный бриф. ИИ генерирует контент в стиле «клиента А», даже когда контент-мейкер один и тот же. Не путается, не сваливается в усреднённый «корпоративный голос».',
  },
  {
    badge: 'Бренд с чётким TOV',
    title: 'Защита стиля',
    body: 'Стоп-слова не дают нейросети писать «уникальный продукт» и «выгодное предложение». Примеры удачных постов задают эталон, к которому ИИ возвращает каждую генерацию.',
  },
  {
    badge: 'Автор / эксперт',
    title: 'Свой голос важнее массовости',
    body: 'Если у вас узнаваемая подача, бриф фиксирует её для ИИ. Можете делегировать черновики — они выйдут «вашими», а не «как пишет любая нейросеть».',
  },
]

const steps: FeatureStepItem[] = [
  {
    title: 'Создайте workspace бренда',
    body: 'Каждый бренд — отдельный workspace. Полностью изолирован: посты, тренды, разборы Reels, командный доступ — всё внутри.',
  },
  {
    title: 'Заполните поля брифа',
    body: 'Ниша, описание бизнеса, ЦА, Tone of Voice (формально/дружески/провокационно/…), стоп-слова, что точно нельзя писать.',
  },
  {
    title: 'Загрузите примеры',
    body: '3-5 ваших удачных постов как эталон. ИИ извлекает из них стилистические паттерны и опирается на них при генерации.',
  },
  {
    title: 'Проверьте генерацию',
    body: 'Попросите ИИ написать тестовый пост в чате ассистента. Оцените — соответствует ли голосу. Если нет — подправьте поля брифа.',
  },
  {
    title: 'Подкручивайте по ходу',
    body: 'Бриф редактируется в любой момент. Изменения применяются ко всем последующим генерациям — старые посты не переписываются.',
  },
]

const params: FeatureParamRow[] = [
  { name: 'Ниша', values: '40+ преднастроенных + кастом', note: 'Влияет на подбор трендов и инфоповодов в других разделах' },
  { name: 'Описание бизнеса', values: 'Свободный текст, до 2000 символов', note: 'Что вы делаете, чем отличаетесь, какие у вас продукты' },
  { name: 'Целевая аудитория', values: 'Возраст, пол, география, интересы, боли', note: 'Чем конкретнее — тем точнее ИИ попадает в «своих»' },
  { name: 'Tone of Voice', values: 'Формальный / Дружеский / Экспертный / Провокационный / Иронический / Свой', note: 'Можно комбинировать («дружеский, но экспертный»)' },
  { name: 'Стоп-слова', values: 'Список того, что нельзя писать', note: 'Жёсткое правило — ИИ не использует их даже при перефразировании' },
  { name: 'Примеры удачных постов', values: 'До 5 постов с пометкой «вот так нужно»' },
  { name: 'Гайдлайны', values: 'Свободный текст: правила оформления, эмодзи, длина, структура' },
  { name: 'Запрещённые темы', values: 'Темы, которых ИИ должен избегать совсем' },
]

const limits: FeatureLimitRow[] = [
  { feature: 'Брендов в аккаунте', free: '1', pro: '10', business: 'Безлимит' },
  { feature: 'Примеров постов', free: '3 на бренд', pro: '10 на бренд', business: 'Безлимит' },
  { feature: 'Размер описания', free: '500 символов', pro: '2000 символов', business: 'Без ограничения' },
  { feature: 'Командный доступ к бренду', free: 'Только владелец', pro: '3 пользователя', business: 'Безлимит' },
  { feature: 'История изменений брифа', free: 'Нет', pro: 'Последние 10 версий', business: 'Полная история + откат' },
  { feature: 'Импорт из существующего бренд-бука', free: 'Нет', pro: 'Из PDF/DOCX', business: 'PDF/DOCX/URL + ручной разбор' },
]

const faq: FeatureFaqItem[] = [
  {
    question: 'Что именно попадёт в системный промпт ИИ?',
    answer: 'Все заполненные поля брифа — ниша, описание, ЦА, Tone of Voice, стоп-слова, гайдлайны, запрещённые темы. Примеры постов передаются как референс. Технический шаблон промпта формируется автоматически — вы заполняете только смысловые поля.',
  },
  {
    question: 'Можно ли менять бриф задним числом?',
    answer: 'Да, в любой момент. Изменения применяются ко всем последующим генерациям. Уже созданные посты не переписываются — у каждого сохраняется привязка к версии брифа, на которой он был написан.',
  },
  {
    question: 'Видны ли данные бренда другим командам?',
    answer: 'Нет. Каждый бренд — изолированный workspace. Доступ только у тех, кого вы туда явно пригласили. На Business доступна детальная ролевая модель: Owner / Editor / Viewer + аудит-лог.',
  },
  {
    question: 'Используются ли мои данные для обучения ИИ?',
    answer: 'Нет. Брифы, примеры постов, всё содержимое workspace не уходит в обучение модели. Это требование наших корпоративных клиентов, оно действует для всех тарифов, включая Free.',
  },
  {
    question: 'А если у меня уже есть бренд-бук?',
    answer: 'На Pro и Business — импорт из PDF/DOCX: ИИ сам разбирает документ и заполняет поля брифа. Останется только проверить и подкрутить. На Free — заполнение вручную.',
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
      breadcrumb="Бриф бренда для ИИ"
      title="Бриф бренда"
      title-accent="для ИИ"
      lead="Один раз заполняете карточку бренда — ниша, описание, ЦА, Tone of Voice, стоп-слова, примеры удачных постов — и весь генерируемый контент подстраивается под ваш стиль."
      cta-label="Создать бренд"
      cta-to="/app/workspaces"
    />

    <FeatureSection
      label="Что это"
      title="Структурированный бриф, который ИИ использует как системный промпт"
      lead="Не «опишите мне ваш бренд» в чате каждый раз заново, а одна карточка с полями, которая подмешивается в каждый запрос к нейросети. Влияет на тексты постов, разборы Reels, подбор трендов — везде, где Writelo пишет от вашего имени."
    >
      <p
        class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094] max-w-[64ch]"
      >
        Это то самое отличие «универсальной нейросети» от «нейросети-под-ваш-бренд». ChatGPT не знает, что ваш Tone of Voice — «как старший товарищ, без снисхождения, без «дорогие друзья», без эмодзи». Writelo знает, потому что вы ему это один раз сказали в брифе.
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
      title="Шаги от пустой карточки до настроенного ИИ"
      lead="Заполнение брифа занимает 15-30 минут, если у вас уже есть представление о бренде. Если бренда «ещё нет» — Writelo подскажет вопросами, чтобы вы дозаполнили."
    >
      <FeatureSteps :steps="steps" />
    </FeatureSection>

    <FeatureSection
      label="Параметры"
      title="Что входит в бриф"
      lead="Не обязательно заполнять всё сразу — ИИ работает с тем, что есть. Но чем плотнее карточка, тем точнее результат."
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
      page="brand-brief"
      title="Настройте ИИ под голос вашего бренда"
      body="Бесплатный тариф — 1 бренд. Этого достаточно, чтобы попробовать и понять, насколько узнаваемо ИИ начинает писать. Без карты, без обязательств."
      cta-label="Создать бренд"
      cta-to="/app/workspaces"
    />
  </FeaturePageShell>
</template>
