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
  slug: 'kontent-plan-dlya-smm',
  shortTitle: 'Контент-план для SMM',
  seoTitle: 'Контент-план для SMM — календарь публикаций с автопостингом | Writelo',
  description:
    'Планируйте посты на месяц вперёд и публикуйте в Instagram, Telegram и VK по расписанию из одного календаря. Сетки день/неделя/месяц, статусы, превью под каждую сеть.',
  keywords:
    'контент-план для smm, контент-план instagram, календарь постов, автопостинг в инстаграм, smm-планировщик, контент-календарь, планирование публикаций в соцсетях',
}

const useCases: FeatureUseCaseItem[] = [
  {
    badge: 'SMM-щик с 3+ аккаунтов',
    title: 'Все клиенты в одной сетке',
    body: 'Цветовая маркировка по бренду, переключение между аккаунтами одной кнопкой. Не путаетесь, что куда и когда.',
  },
  {
    badge: 'Агентство',
    title: 'Команда с согласованиями',
    body: 'Контент-мейкер ставит пост в очередь, аккаунт-менеджер согласовывает, клиент одобряет — каждый шаг в одном календаре, без переписки в чатах.',
  },
  {
    badge: 'Автор с рубриками',
    title: 'Регулярные сетки',
    body: 'Шаблоны под повторяющиеся рубрики («понедельник — мемы», «среда — длинный пост»). Создаёте раз — дальше календарь сам подсказывает слоты.',
  },
]

const steps: FeatureStepItem[] = [
  {
    title: 'Подключите аккаунты',
    body: 'Instagram через Facebook Business, Telegram-канал через бота, VK через OAuth. Один бренд — несколько площадок, каждая привязывается отдельно.',
  },
  {
    title: 'Создайте пост',
    body: 'Один редактор на все сети. Текст, медиа, превью. Под каждую площадку можно адаптировать — обрезать длину, заменить картинку, убрать ссылку.',
  },
  {
    title: 'Выберите площадки',
    body: 'Чекбоксы — куда публикуем. Календарь подсветит, если в выбранный слот уже что-то стоит на этом аккаунте.',
  },
  {
    title: 'Запланируйте время',
    body: 'Перетащите карточку в нужный день и час. Drag-and-drop по сетке месяца, недели или дня. Часовой пояс — по бренду.',
  },
  {
    title: 'Дождитесь публикации',
    body: 'В момент X пост уходит автоматически. Если соцсеть вернула ошибку — статус «ошибка» с пояснением и кнопкой «повторить».',
  },
]

const params: FeatureParamRow[] = [
  { name: 'Сетки', values: 'День / Неделя / Месяц', note: 'Месяц — обзор на 30 дней; неделя — час-по-час; день — детальный таймлайн' },
  { name: 'Статусы', values: 'Черновик / На согласовании / В очереди / Опубликовано / Ошибка', note: 'Цветовая маркировка по периметру карточки' },
  { name: 'Площадки', values: 'Instagram (Feed/Reels/Stories), Telegram-каналы, VK', note: 'TikTok и YouTube Shorts — в дорожной карте' },
  { name: 'Фильтры', values: 'По бренду, площадке, статусу, тегу' },
  { name: 'Drag-and-drop', values: 'Перенос карточек по сетке мышью', note: 'Сразу обновляет запланированное время; на мобиле — через долгое нажатие' },
  { name: 'Адаптация под сеть', values: 'Свой текст, своё медиа, свой превью-кадр для каждой площадки' },
  { name: 'Командные роли', values: 'Owner / Editor / Approver / Viewer', note: 'Approver видит ленту «На согласовании», аппрувит одной кнопкой' },
]

const limits: FeatureLimitRow[] = [
  { feature: 'Брендов в аккаунте', free: '1', pro: '10', business: 'Безлимит' },
  { feature: 'Постов в очереди', free: '10', pro: 'Безлимит', business: 'Безлимит' },
  { feature: 'Подключённых соцсетей на бренд', free: '1', pro: '3 (IG + TG + VK)', business: '3 + несколько TG-каналов' },
  { feature: 'История публикаций', free: '30 дней', pro: '12 месяцев', business: 'Без ограничения' },
  { feature: 'Согласования', free: 'Нет', pro: 'Простое (Owner ↔ Approver)', business: 'Многоуровневые цепочки' },
  { feature: 'Командных ролей', free: 'Только владелец', pro: '3 пользователя', business: 'Безлимит' },
]

const faq: FeatureFaqItem[] = [
  {
    question: 'В какие соцсети можно публиковать?',
    answer: 'Instagram (Feed, Reels, Stories), Telegram-каналы, VK-сообщества. TikTok и YouTube Shorts — в дорожной карте, появятся в ближайших релизах.',
  },
  {
    question: 'Можно ли публиковать Reels автоматически?',
    answer: 'Да, через Instagram Graph API. Аккаунт должен быть Business или Creator и связан с Facebook-страницей — это требование Meta, не наше. Stories — также автоматически.',
  },
  {
    question: 'Что с лимитами Instagram API?',
    answer: 'Meta разрешает до 25 постов и 100 Stories в сутки с одного аккаунта. Если в очереди больше — Writelo предупредит и предложит перенести часть на следующий день. Reels — отдельный лимит, до 100 в сутки.',
  },
  {
    question: 'Можно ли работать командой?',
    answer: 'На Pro — до 3 пользователей с базовыми ролями. На Business — без ограничений, с многоуровневыми согласованиями. Каждое действие в логе: кто что когда поменял.',
  },
  {
    question: 'Что будет, если соцсеть вернёт ошибку при публикации?',
    answer: 'Пост получает статус «Ошибка» с расшифровкой (например, «токен Instagram истёк» или «медиа слишком большое»). Можно нажать «Повторить» после исправления или удалить.',
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
      breadcrumb="Контент-план для SMM"
      title="Контент-план"
      title-accent="для SMM"
      lead="Планируйте посты на месяц вперёд и публикуйте в Instagram, Telegram и VK из одного календаря. Сетки день/неделя/месяц, drag-and-drop, статусы, превью под каждую сеть."
      cta-label="Открыть календарь"
      cta-to="/app/calendar"
    />

    <FeatureSection
      label="Что это"
      title="Контент-календарь с кросс-постингом"
      lead="Один пост — несколько площадок. Под каждую сеть можно адаптировать текст и медиа, чтобы в Instagram не висел телеграмный «жирный markdown», а в VK — гифка, которой не место в Reels."
    >
      <p
        class="lnf-body text-[15px] md:text-[16px] leading-[1.65] text-[#5f5f5f] dark:text-[#a8a094] max-w-[64ch]"
      >
        Не отдельный «инстаграм-планер» + отдельный «телеграм-планер» + отдельный «вк-планер» — одна сетка, в которой видны все ваши бренды и все площадки. Это критично, когда вы ведёте 5-10 аккаунтов и помните, кому в какой день что обещали выпустить.
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
      title="От подключения аккаунта до автопостинга"
      lead="Один раз настраиваете связку «бренд ↔ соцсети», дальше работаете в одном окне. Самое долгое — авторизация в Instagram через Facebook Business; остальное занимает минуты."
    >
      <FeatureSteps :steps="steps" />
    </FeatureSection>

    <FeatureSection
      label="Параметры"
      title="Что можно настроить"
      lead="Все параметры — на уровне бренда, чтобы клиентский контент не пересекался с вашими тестовыми постами."
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
      page="calendar"
      title="Соберите контент-план на месяц за один вечер"
      body="Бесплатный тариф — 1 бренд и 10 постов в очереди. Хватит, чтобы попробовать кросс-постинг и понять, нравится ли вам Writelo. Без карты, без обязательств."
      cta-label="Открыть календарь"
      cta-to="/app/calendar"
    />
  </FeaturePageShell>
</template>
