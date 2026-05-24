# Feature Detail Pages (RU-only landing satellites)

**Status:** approved
**Date:** 2026-05-22
**Author:** shara (via Claude)

## Goal

Создать 4 публичные посадочные страницы — по одной на каждую фичу — чтобы:
1. **Прокачать понимание сайта LLM-краулерами** (GPTbot, ClaudeBot, PerplexityBot и т.п.): каждая страница даёт плотную фактуру про конкретную фичу — что это, зачем, как пользоваться, какие параметры/лимиты.
2. **Расширить SEO-присутствие** через высокочастотные RU-запросы, под которые лендинг сейчас не оптимизирован.
3. **Дать пользователю с лендинга «копать глубже»** через иконку-кнопку рядом с заголовком каждой фичевой секции.

## Scope (этой итерации)

- 4 страницы, **только RU-локаль** (EN добавим позже, проверив, что копия работает)
- Иконка-кнопка `ArrowUpRight` рядом с `<h2>` каждой из 4 фичевых секций лендинга
- Sitemap расширяется на 4 новых URL
- Prerender + SSR через `routeRules` и `nitro.prerender.routes`

**Не входит:**
- EN-копии (отложено)
- Динамика/CMS — копия захардкожена в Vue (i18n не нужен для RU-only)
- Новые навигационные элементы в шапке/футере лендинга

## URL map

| Фича | URL | Целевые запросы |
|---|---|---|
| Тренды Instagram | `/poisk-trendov-v-instagrame` | «поиск трендов в инстаграм», «тренды инстаграм» |
| Контент-календарь | `/kontent-plan-dlya-smm` | «контент-план SMM», «контент-план для инстаграм» |
| Разбор Reels | `/ai-razbor-reels` | «AI разбор рилс», «анализ рилс ИИ» |
| Бриф бренда | `/brif-brenda-dlya-ai` | «бриф бренда», «бриф для ИИ» |

Slug'и в корне (а не под `/ru/...`), потому что:
- `i18n.strategy: 'no_prefix'` уже у нас стоит — RU по умолчанию без префикса
- Короче URL = выигрыш в RU SEO
- Когда добавим EN, оно ляжет в `/en/<en-slug>` (или просто отдельные англоязычные slug'и; решим тогда)

## Architecture

### Новый модуль: `lib-modules/landing-features/`

```
lib-modules/landing-features/
├── components/
│   ├── FeaturePageShell.vue       # шапка/футер из landing-new + контейнер
│   ├── FeatureHero.vue            # title + lead + breadcrumb + CTA в /app
│   ├── FeatureSection.vue         # generic секция (label + heading + slot)
│   ├── FeatureSteps.vue           # нумерованный список (1..N)
│   ├── FeatureParamsTable.vue     # компактная таблица параметров/фильтров
│   ├── FeatureLimitsTable.vue     # таблица «Free / Pro / Business»
│   └── FeatureUseCases.vue        # карточки use-кейсов по нишам
├── helpers/
│   └── seo.ts                     # buildFeaturePageSchema(page) → SoftwareApplication + BreadcrumbList
├── types.ts
└── index.ts                       # публичный API
```

**Шаринг с `landing-new`:**
- Те же шрифты (`Unbounded`, `IBM Plex Sans`, `JetBrains Mono`) — подключаются через `GOOGLE_FONTS_HREF` из `landing-new`
- Те же классы типографики (`lnf-display`, `lnf-body`, `lnf-mono`)
- Тёмная/светлая тема (`dark:bg-[#0a0a0a]`, `--brand` rust `#d4683f`)
- Шапка и футер копируются один-в-один из `LandingNewPage.vue` (можно вынести в общий `LandingShell` потом — пока копия, чтобы не трогать существующий лендинг)
- Максимальная ширина контента — 1200px (как у `BriefSection`)

### Структура каждой страницы

```
pages/poisk-trendov-v-instagrame.vue
  ↓
FeaturePageShell
  ├─ <header>  (lift from LandingNewPage)
  ├─ FeatureHero
  │    ├─ breadcrumb: «Главная / [Название фичи]»
  │    ├─ <h1> с акцентным span
  │    ├─ lead-параграф
  │    └─ CTA «Открыть в приложении» → /app/...
  ├─ FeatureSection «Что это»
  ├─ FeatureSection «Для кого / Когда полезно»
  │    └─ FeatureUseCases (3-4 ниши)
  ├─ FeatureSection «Как пользоваться»
  │    └─ FeatureSteps (4-6 шагов)
  ├─ FeatureSection «Параметры и фильтры»
  │    └─ FeatureParamsTable
  ├─ FeatureSection «Лимиты по тарифам»
  │    └─ FeatureLimitsTable
  ├─ FeatureSection «Частые вопросы» (3-4 Q/A, попадают в JSON-LD FAQPage)
  ├─ FeatureSection финальный CTA → /app/...
  └─ <footer> (lift from LandingNewPage)
```

## SEO

Каждая страница:

```ts
useSeoMeta({
  robots: 'index, follow',
  title: '<Уникальный title под slug, до 60 символов>',
  description: '<до 160 символов, плотно по сути>',
  keywords: '<разные ключи на каждую страницу>',
  ogTitle, ogDescription, ogImage: '/og-image.svg',
  ogUrl: 'https://writelo.io/<slug>',
  ogLocale: 'ru_RU',
  ogType: 'website',
})

useHead({
  htmlAttrs: { lang: 'ru' },
  link: [
    { rel: 'canonical', href: 'https://writelo.io/<slug>' },
    { rel: 'alternate', hreflang: 'ru', href: 'https://writelo.io/<slug>' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://writelo.io/<slug>' },
    // EN добавим позже
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(buildFeaturePageSchema(...)) },
  ],
})
```

`buildFeaturePageSchema` возвращает `@graph` из:
- `BreadcrumbList` (Главная → текущая страница)
- `SoftwareApplication` (с url=canonicalUrl, как в landing-new)
- `FAQPage` (из Q/A на странице)

### routeRules + prerender

В `nuxt.config.ts`:
```ts
routeRules: {
  // ...existing...
  '/poisk-trendov-v-instagrame': { ssr: true, prerender: true },
  '/kontent-plan-dlya-smm':       { ssr: true, prerender: true },
  '/ai-razbor-reels':             { ssr: true, prerender: true },
  '/brif-brenda-dlya-ai':         { ssr: true, prerender: true },
  // '/**': { ssr: false }  ← остаётся как было
},
nitro: {
  prerender: {
    routes: [
      ...existing,
      '/poisk-trendov-v-instagrame',
      '/kontent-plan-dlya-smm',
      '/ai-razbor-reels',
      '/brif-brenda-dlya-ai',
    ],
  },
}
```

### Sitemap

Дописываю 4 `<url>` в `public/sitemap.xml`:
```xml
<url>
  <loc>https://writelo.io/poisk-trendov-v-instagrame</loc>
  <lastmod>2026-05-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<!-- ... остальные три ... -->
```

## Landing integration

В 4 секциях лендинга (`TrendsSection`, `CalendarSection`, `ReelsSection`, `BriefSection`) рядом с `<h2>` добавляется маленькая иконка-кнопка-ссылка:

```vue
<NuxtLink
  :to="/<slug>"
  class="inline-flex items-center justify-center w-9 h-9 align-middle ml-3 text-[#5f5f5f] dark:text-[#a8a094] hover:text-[#d4683f] hover:rotate-[-12deg] transition-all"
  :aria-label="`Подробнее: ${title}`"
  @click="$trackGoal('landing_section_deeplink', { section: 'trends' })"
>
  <ArrowUpRight class="w-5 h-5" />
</NuxtLink>
```

Поведение:
- Inline с h2, не ломает текущий layout
- Hover — лёгкий поворот + смена цвета на rust accent
- На мобиле — остаётся видимой (важная конверсионная точка)
- Аналитика: `landing_section_deeplink` с именем секции

`SectionHeader.vue` принимает опциональный `detailUrl?: string` и `detailLabel?: string` (для aria-label), рендерит иконку если url задан. `ReelsSection` использует не `SectionHeader`, а свою верстку — там добавляем иконку рядом с h2 напрямую.

## Контент-черновики

> **Заметка:** копию пишем прямо в Vue (без i18n keys), потому что RU-only и MVP-итерация. Если решим добавить EN — выносим в `i18n/ru.json` + `i18n/en.json`.

### `/poisk-trendov-v-instagrame` — «Поиск трендов в Instagram»

- **Title:** Поиск трендов в Instagram — ИИ-аналитика виральных Reels | Writelo
- **Lead:** База из тысяч свежих Reels, обновление каждые 5 минут, фильтрация под вашу нишу. Видите, какие форматы взлетают сейчас, до того как их подхватят конкуренты.
- **Что это:** Тренд-радар по Instagram Reels. Парсим публичные Reels, считаем динамику просмотров, маркируем «виральные» по соотношению охватов к подписчикам, режем по нишам и языкам.
- **Для кого:** SMM-фрилансеры (быстрый ресёрч под клиента), агентства (бэклог идей на спринт), бренды-инхаус (мониторинг конкурентов).
- **Как пользоваться:** 6 шагов (выбрать нишу → задать фильтры → отсортировать → открыть карточку → сохранить в календарь → скопировать сценарий).
- **Параметры:** ниша, язык, период (24ч/7д/30д), мин. охваты, viral-score, автор, дата публикации.
- **Лимиты:** Free 5 запросов/день, Pro безлимит, Business — приоритет очереди.
- **FAQ:** Откуда данные? Можно ли скачать видео? Как часто обновляется? Можно ли получить виральные посты конкретного аккаунта?

### `/kontent-plan-dlya-smm` — «Контент-план для SMM»

- **Title:** Контент-план для SMM — календарь публикаций с автопостингом | Writelo
- **Lead:** Планируйте посты на месяц вперёд, публикуйте в Instagram, Telegram и VK по расписанию из одного календаря. Шапка-сетка, drag-and-drop, статусы, превью под каждую сеть.
- **Что это:** Контент-календарь с кросс-постингом. Один пост — несколько площадок, под каждую можно адаптировать текст и медиа.
- **Для кого:** SMM-щики, ведущие 3+ аккаунтов; агентства с командной модерацией; авторы с регулярными рубриками.
- **Как пользоваться:** 5 шагов (подключить аккаунты → создать пост → выбрать площадки → запланировать → дождаться публикации).
- **Параметры:** сетки (день/неделя/месяц), статусы (черновик/в очереди/опубликовано/ошибка), фильтр по бренду, drag-and-drop.
- **Лимиты:** Free 1 бренд / 10 постов в очереди; Pro 10 брендов / безлимит; Business — командные роли + аппрувы.
- **FAQ:** Какие соцсети? Можно ли публиковать Reels автоматом? Что с лимитами Instagram API? Можно ли работать командой?

### `/ai-razbor-reels` — «AI разбор Reels»

- **Title:** AI разбор Reels — анализ хука, удержания и CTA по ссылке | Writelo
- **Lead:** Скиньте ссылку на свой или чужой Reels — получите покадровый разбор: где зашёл хук, в какой момент теряется аудитория, что в CTA, какие приёмы сработали.
- **Что это:** Видеоаналитика Reels через мультимодальную ИИ-модель. Транскрипция, кадровая разметка, метрики удержания, разбор сценарной структуры.
- **Для кого:** контент-мейкеры, проверяющие свои Reels; продюсеры, изучающие конкурентов; коучи/инфобиз, ищущие эталоны.
- **Как пользоваться:** 4 шага (вставить ссылку → дождаться обработки → прочитать разбор → скопировать рекомендации в редактор).
- **Параметры:** глубина анализа (быстрый/детальный), фокус (хук/удержание/CTA/всё), сравнение с эталонной структурой.
- **Лимиты:** Free 3 разбора/день; Pro 50/день; Business — безлимит + API.
- **FAQ:** Какие форматы? Можно ли разобрать TikTok? Что с приватными аккаунтами? Сколько занимает обработка?

### `/brif-brenda-dlya-ai` — «Бриф бренда для ИИ»

- **Title:** Бриф бренда для ИИ — настройка ИИ под Tone of Voice и нишу | Writelo
- **Lead:** Один раз заполняете карточку бренда — ниша, описание, ЦА, Tone of Voice, стоп-слова, примеры удачных постов — и весь генерируемый контент подстраивается под ваш стиль.
- **Что это:** Структурированный бриф, который ИИ использует как системный промпт. Влияет на тексты постов, разборы Reels, подбор трендов.
- **Для кого:** агентства, ведущие нескольких клиентов; бренды с чётким TOV; авторы, у которых «свой голос» важнее массовости.
- **Как пользоваться:** 5 шагов (создать workspace бренда → заполнить поля → загрузить примеры → проверить генерацию → подкрутить).
- **Параметры:** ниша, описание бизнеса, целевая аудитория, Tone of Voice, стоп-слова, примеры постов, гайдлайны.
- **Лимиты:** Free 1 бренд; Pro до 10 брендов; Business — без ограничений + командный доступ.
- **FAQ:** Что попадёт в системный промпт? Можно ли менять задним числом? Видны ли данные другим командам? Используются ли для тренировки ИИ?

## Phasing (фаза = 1 проверка в браузере)

1. **Шасси + первая страница «Тренды»** — модуль `landing-features`, `FeaturePageShell` + все sub-компоненты, page `/poisk-trendov-v-instagrame`, иконка в `TrendsSection`, sitemap и nuxt.config обновления, JSON-LD. → проверка в браузере.
2. **Страница «Календарь»** + иконка в `CalendarSection`. → проверка.
3. **Страница «AI разбор Reels»** + иконка в `ReelsSection`. → проверка.
4. **Страница «Бриф бренда»** + иконка в `BriefSection`. → проверка.

Каждая фаза = одно коммитабельное состояние; коммит только по «работает» от пользователя.

## Open questions

Нет — все ключевые решения согласованы в чате.
