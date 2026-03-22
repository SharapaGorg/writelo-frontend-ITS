import type { DemoProject } from '../types'

export const demoProjects: DemoProject[] = [
  {
    id: 'coffee-shop',
    name: 'Кофейня "Бодрость"',
    tags: [
      { id: 'tag-cs-1', name: 'Продающий', color: 'bg-emerald-500' },
      { id: 'tag-cs-2', name: 'Экспертный', color: 'bg-indigo-500' },
      { id: 'tag-cs-3', name: 'Охватный', color: 'bg-orange-500' },
      { id: 'tag-cs-4', name: 'Личный', color: 'bg-rose-500' }
    ],
    posts: [
      {
        id: 'cs-1',
        title: 'Весенняя акция -20%',
        description: 'Скидка на все латте до конца марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram'],
        tags: ['tag-cs-1'],
        date: '2026-03-15',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Latte',
        previews: {
          vk: {
            text: 'Весна пришла — латте подешевел! Скидка 20% на все латте до конца марта. Ждём вас!',
            likes: 234,
            comments: 18,
            shares: 12
          },
          telegram: {
            text: 'Весенняя акция в Бодрости! Латте -20% весь март',
            views: 1520
          }
        }
      },
      {
        id: 'cs-2',
        title: 'Новый десерт: тирамису',
        type: 'story',
        status: 'draft',
        networks: ['instagram'],
        tags: ['tag-cs-3'],
        date: '2026-03-18',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Tiramisu',
        previews: {
          instagram: {
            text: 'Новинка! Итальянский тирамису по авторскому рецепту',
            likes: 0,
            comments: 0
          }
        }
      },
      {
        id: 'cs-3',
        title: 'Как мы варим кофе',
        type: 'reels',
        status: 'idea',
        networks: ['instagram', 'youtube'],
        tags: ['tag-cs-2'],
        date: '2026-03-22',
        previews: {
          instagram: { text: 'Закулисье: от зерна до чашки' },
          youtube: { text: 'Как мы варим идеальный кофе | Бодрость' }
        }
      },
      {
        id: 'cs-4',
        title: 'Поздравление с 8 марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-cs-4', 'tag-cs-3'],
        date: '2026-03-08',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=8+March',
        previews: {
          vk: { text: 'Милые дамы! Поздравляем с 8 марта! Сегодня всем девушкам кофе в подарок', likes: 567, comments: 42, shares: 89 },
          telegram: { text: 'С 8 марта! Девушкам — кофе бесплатно', views: 3200 },
          instagram: { text: 'Happy 8th March! Free coffee for ladies today', likes: 892, comments: 56 }
        }
      },
      {
        id: 'cs-5',
        title: 'Пасхальные куличи',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'instagram'],
        tags: ['tag-cs-1', 'tag-cs-4'],
        date: '2026-04-12',
        previews: {
          vk: { text: 'Принимаем заказы на пасхальные куличи!' },
          instagram: { text: 'Easter cakes pre-order is open!' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-1', title: '8 Марта', date: '2026-03-08', description: 'Международный женский день' },
      { id: 'ie-2', title: 'Пасха', date: '2026-04-12', description: 'Православная Пасха' },
      { id: 'ie-3', title: '1 Мая', date: '2026-05-01', description: 'День труда' }
    ],
    news: [
      { id: 'n-1', title: 'Цены на кофе выросли на 15%', source: 'РБК', date: '2026-03-20' },
      { id: 'n-2', title: 'Тренд: овсяное молоко обогнало миндальное', source: 'VC.ru', date: '2026-03-18' },
      { id: 'n-3', title: 'Starbucks открыл 100-ю кофейню в России', source: 'Коммерсант', date: '2026-03-15' }
    ]
  },
  {
    id: 'blogger-anya',
    name: 'Блогер Аня',
    tags: [
      { id: 'tag-ba-1', name: 'Личный', color: 'bg-pink-500' },
      { id: 'tag-ba-2', name: 'Реклама', color: 'bg-amber-500' },
      { id: 'tag-ba-3', name: 'Вовлекающий', color: 'bg-cyan-500' },
      { id: 'tag-ba-4', name: 'Лайфстайл', color: 'bg-violet-500' }
    ],
    posts: [
      {
        id: 'ba-1',
        title: 'Утренняя рутина',
        type: 'reels',
        status: 'ready',
        networks: ['instagram', 'youtube'],
        tags: ['tag-ba-1', 'tag-ba-4'],
        date: '2026-03-16',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Morning',
        previews: {
          instagram: { text: 'Мое идеальное утро за 60 секунд', likes: 12400, comments: 342 },
          youtube: { text: 'Моя утренняя рутина 2026 | Продуктивное утро', likes: 8900, comments: 234 }
        }
      },
      {
        id: 'ba-2',
        title: 'Коллаб с брендом',
        type: 'post',
        status: 'draft',
        networks: ['instagram', 'telegram'],
        tags: ['tag-ba-2'],
        date: '2026-03-20',
        previews: {
          instagram: { text: 'Реклама нового бренда косметики' },
          telegram: { text: 'Новый пост о косметике', views: 0 }
        }
      },
      {
        id: 'ba-3',
        title: 'Q&A сессия',
        type: 'story',
        status: 'idea',
        networks: ['instagram'],
        tags: ['tag-ba-3'],
        date: '2026-03-25',
        previews: {
          instagram: { text: 'Отвечаю на ваши вопросы!' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-ba-1', title: '8 Марта', date: '2026-03-08' },
      { id: 'ie-ba-2', title: 'День блогера', date: '2026-04-17' }
    ],
    news: [
      { id: 'n-ba-1', title: 'Instagram тестирует новый алгоритм рекомендаций', source: 'TechCrunch', date: '2026-03-19' },
      { id: 'n-ba-2', title: 'YouTube Shorts обгоняет TikTok по просмотрам', source: 'The Verge', date: '2026-03-17' }
    ]
  },
  {
    id: 'electronics-store',
    name: 'Магазин электроники',
    tags: [
      { id: 'tag-es-1', name: 'Продающий', color: 'bg-emerald-500' },
      { id: 'tag-es-2', name: 'Экспертный', color: 'bg-indigo-500' },
      { id: 'tag-es-3', name: 'Обзор', color: 'bg-blue-500' },
      { id: 'tag-es-4', name: 'Акция', color: 'bg-red-500' }
    ],
    posts: [
      {
        id: 'es-1',
        title: 'Обзор iPhone 17',
        type: 'reels',
        status: 'ready',
        networks: ['youtube', 'vk'],
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-03-14',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=iPhone',
        previews: {
          youtube: { text: 'iPhone 17 — честный обзор | Стоит ли покупать?', likes: 4500, comments: 678 },
          vk: { text: 'Обзор нового iPhone 17 уже на канале!', likes: 890, comments: 123, shares: 45 }
        }
      },
      {
        id: 'es-2',
        title: 'Распродажа к 8 марта',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-es-1', 'tag-es-4'],
        date: '2026-03-07',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Sale',
        previews: {
          vk: { text: 'Скидки до 30% на технику для любимых!', likes: 234, comments: 45, shares: 67 },
          telegram: { text: 'Распродажа к 8 марта — скидки до 30%!', views: 5600 },
          instagram: { text: 'Sale up to 30% off!', likes: 1200, comments: 89 }
        }
      },
      {
        id: 'es-3',
        title: 'Топ-5 наушников 2026',
        type: 'post',
        status: 'draft',
        networks: ['vk', 'youtube'],
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-03-28',
        previews: {
          vk: { text: 'Какие наушники выбрать в 2026?' },
          youtube: { text: 'ТОП-5 наушников 2026 года | Сравнение' }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-es-1', title: '8 Марта', date: '2026-03-08' },
      { id: 'ie-es-2', title: 'Чёрная пятница', date: '2026-11-27' }
    ],
    news: [
      { id: 'n-es-1', title: 'Apple представит новые MacBook в апреле', source: 'Bloomberg', date: '2026-03-21' },
      { id: 'n-es-2', title: 'Samsung выпустит складной планшет', source: 'The Verge', date: '2026-03-18' },
      { id: 'n-es-3', title: 'Xiaomi выходит на рынок электромобилей', source: 'Reuters', date: '2026-03-15' }
    ]
  }
]
