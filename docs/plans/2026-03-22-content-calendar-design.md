# Content Calendar Demo — Design Document

**Дата:** 2026-03-22
**Статус:** Approved

## Обзор

Демо-страница с контент-календарём для SMM-планирования. Публичная страница без бекенда, все данные захардкожены. Доступна с лендинга по ссылке `/ideas`.

## Цели

- Показать потенциальным пользователям, как выглядит планирование контента
- Продемонстрировать интеграцию с разными соцсетями
- RAT (Rapid Application Test) перед разработкой полноценной фичи

## Функциональность

### Основной Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: [Logo] ───────────────── [Проект ▼] ─── [Назад на лендинг] │
├─────────────────────────────────────────────────────────────────────┤
│  Фильтры: [VK] [YouTube] [Telegram] [Instagram]  ← чипсы-тогглы     │
├───────────────────────────────────────────────────────┬─────────────┤
│                                                       │             │
│              КАЛЕНДАРЬ (месячная сетка)               │   НОВОСТИ   │
│                                                       │   ОТРАСЛИ   │
│     ◄ Март 2026 ►                                     │             │
│   Пн  Вт  Ср  Чт  Пт  Сб  Вс                          │  [Карточка] │
│   ┌───┬───┬───┬───┬───┬───┬───┐                       │  [Карточка] │
│   │   │   │   │ ★ │   │   │   │  ← ★ = инфоповод      │  [Карточка] │
│   │   │ ■ │   │ ■ │   │   │   │  ← ■ = пост           │             │
│   └───┴───┴───┴───┴───┴───┴───┘                       │             │
│                                                       │             │
├───────────────────────────────────────────────────────┴─────────────┤
│  ДЕТАЛЬНАЯ ПАНЕЛЬ (при клике на день)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                             │
│  │ Пост 1   │ │ Сторис 2 │ │ Рилс 3   │  + Инфоповод: 8 Марта       │
│  │ [VK][TG] │ │ [IG]     │ │ [YT]     │                             │
│  │ ● Готов  │ │ ○ Идея   │ │ ◐ Черн.  │                             │
│  └──────────┘ └──────────┘ └──────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Превью поста

При клике на карточку поста — боковая панель справа (заменяет новости) с превью:

```
┌─────────────────────────┐
│  × Закрыть              │
├─────────────────────────┤
│  [VK] [YouTube]  ← табы │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │    [Фото]       │    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  Текст поста для VK...  │
│                         │
│  ❤️ 1.2K  💬 56         │
│  ● Готов к публикации   │
└─────────────────────────┘
```

## Типы данных

```typescript
// Тип контента (определяет цвет)
type ContentType = 'post' | 'story' | 'reels'

// Соцсети
type SocialNetwork = 'vk' | 'youtube' | 'telegram' | 'instagram'

// Статус поста
type PostStatus = 'idea' | 'draft' | 'ready'

// Превью для соцсети
interface SocialPreviewData {
  text: string
  image?: string
  likes?: number
  comments?: number
  shares?: number
  views?: number
}

// Пост в календаре
interface CalendarPost {
  id: string
  title: string
  description?: string
  type: ContentType
  status: PostStatus
  networks: SocialNetwork[]
  date: string // 'YYYY-MM-DD'
  image?: string
  previews: Partial<Record<SocialNetwork, SocialPreviewData>>
}

// Инфоповод (праздник, событие)
interface InfoEvent {
  id: string
  title: string
  date: string
  description?: string
}

// Новость отрасли
interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  url?: string
}

// Демо-проект
interface DemoProject {
  id: string
  name: string
  posts: CalendarPost[]
  infoEvents: InfoEvent[]
  news: NewsItem[]
}
```

## Визуальное оформление

### Цвета по типу контента

| Тип | Цвет | Tailwind |
|-----|------|----------|
| Post | Синий | `bg-blue-500/20 border-blue-500` |
| Story | Фиолетовый | `bg-purple-500/20 border-purple-500` |
| Reels | Розовый | `bg-pink-500/20 border-pink-500` |

### Иконки статуса

| Статус | Иконка | Стиль |
|--------|--------|-------|
| Idea | ○ (круг пустой) | `text-gray-400` |
| Draft | ◐ (полукруг) | `text-yellow-500` |
| Ready | ● (круг полный) | `text-green-500` |

### Инфоповод

Звёздочка ★ в углу ячейки дня, `text-amber-400`

## Размеры изображений для превью

| Соцсеть | Размер | Aspect Ratio | UI-элементы |
|---------|--------|--------------|-------------|
| Instagram | 1080×1350 px | 4:5 | Аватар, имя, ❤️ 💬 🔖 |
| VK | 510×510 px | 1:1 | Аватар, имя, лайки, репосты, комменты |
| YouTube | 1280×720 px | 16:9 | Аватар, имя, 👍👎, комменты |
| Telegram | 1280×1280 px | 1:1 | Имя канала, 👁 просмотры, реакции |

## Структура модуля

```
lib-modules/content-calendar/
├── components/
│   ├── ContentCalendarPage.vue   # Главный layout
│   ├── CalendarHeader.vue        # Логотип + проект + назад
│   ├── SocialFilters.vue         # Чипсы-тогглы соцсетей
│   ├── CalendarGrid.vue          # Сетка месяца + навигация
│   ├── DayCell.vue               # Ячейка дня
│   ├── DayDetailPanel.vue        # Панель снизу при клике
│   ├── PostCard.vue              # Карточка поста
│   ├── NewsSidebar.vue           # Правая панель с новостями
│   ├── NewsCard.vue              # Карточка новости
│   ├── PostPreviewPanel.vue      # Боковая панель превью
│   └── previews/
│       ├── InstagramPreview.vue  # Мокап поста Instagram
│       ├── VkPreview.vue         # Мокап поста VK
│       ├── YouTubePreview.vue    # Мокап community post
│       └── TelegramPreview.vue   # Мокап поста в канале
├── composables/
│   └── useContentCalendar.ts     # Состояние и логика
├── data/
│   └── demoData.ts               # Захардкоженные данные
├── types/
│   └── index.ts                  # Все типы
└── index.ts                      # Публичный экспорт
```

## Состояние

```typescript
// useContentCalendar.ts
const selectedProject = ref<string>('coffee-shop')
const selectedDate = ref<string | null>(null)
const selectedPost = ref<string | null>(null)
const activeNetworks = ref<SocialNetwork[]>(['vk', 'youtube', 'telegram', 'instagram'])
const currentMonth = ref<Date>(new Date())
```

## Взаимодействия

| Действие | Результат |
|----------|-----------|
| Клик на день | Открывается DayDetailPanel |
| Клик на PostCard | Открывается PostPreviewPanel (заменяет новости) |
| Клик вне / ESC / × | Закрытие панелей |
| Тоггл чипса соцсети | Фильтрация постов |
| ◄ / ► месяц | Навигация по месяцам |
| Смена проекта | Переключение данных |
| Drag новости в день | Toast "Идея добавлена" (демо) |

## Демо-данные

### 3 проекта

| Проект | Тематика |
|--------|----------|
| Кофейня "Бодрость" | Общепит, акции, сезонные напитки |
| Блогер Аня | Лайфстайл, личный контент, коллабы |
| Магазин электроники | E-commerce, распродажи, обзоры |

### Наполнение на проект

- 15-20 постов разных типов и статусов
- 5-7 инфоповодов (8 марта, Пасха, 1 мая, 9 мая и т.д.)
- 8-10 новостей отрасли

### Период

Март-Апрель 2026 (текущий)

## Страница и навигация

- **Роут:** `/ideas`
- **Файл:** `pages/ideas.vue` → рендерит `<ContentCalendarPage />`
- **Ссылка с лендинга:** Добавить в header лендинга рядом с Features, Pricing
- **Mobile:** Только десктоп. На мобайле показать заглушку "Откройте на ПК"

## Источники (размеры изображений)

- [Instagram Post Size Guide 2026 - Buffer](https://buffer.com/resources/instagram-image-size/)
- [Social Media Image Size Guide 2026](https://iformat.io/blog/social-media-image-size-guide-2026-all-platforms)
- [YouTube Community Post Image Size](https://www.thumbnailcreator.com/specs/youtube-community-post-image-size)
- [Telegram Channel Artwork Guide](https://lepakcreator.com/a-comprehensive-guide-to-telegram-channel-artwork-best-sizing-and-requirements/)
