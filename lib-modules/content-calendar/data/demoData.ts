import type { DemoProject, SocialAccount } from '../types'

// Coffee Shop accounts
const coffeeShopAccounts: SocialAccount[] = [
  { id: 'coffee-vk-1', network: 'vk', name: 'Кофейня Бодрость', username: '@coffeebodrost' },
  { id: 'coffee-tg-1', network: 'telegram', name: 'Кофейня Бодрость', username: '@coffeebodrost_tg' },
  { id: 'coffee-ig-1', network: 'instagram', name: 'Кофейня Бодрость', username: '@coffee.bodrost' },
  { id: 'coffee-yt-1', network: 'youtube', name: 'Кофейня Бодрость', username: '@CoffeeBodrost' }
]

// Blogger Anya accounts
const bloggerAnyaAccounts: SocialAccount[] = [
  { id: 'anya-ig-1', network: 'instagram', name: 'Аня Lifestyle', username: '@anya_lifestyle' },
  { id: 'anya-yt-1', network: 'youtube', name: 'Аня Vlog', username: '@AnyaVlog' },
  { id: 'anya-tg-1', network: 'telegram', name: 'Аня Blog', username: '@anya_blog' }
]

// Electronics Store accounts
const electronicsStoreAccounts: SocialAccount[] = [
  { id: 'tech-vk-1', network: 'vk', name: 'ТехноМаркет VK', username: '@technomarket' },
  { id: 'tech-yt-1', network: 'youtube', name: 'ТехноМаркет YouTube', username: '@TechnoMarket' },
  { id: 'tech-tg-1', network: 'telegram', name: 'ТехноМаркет TG', username: '@technomarket_tg' },
  { id: 'tech-ig-1', network: 'instagram', name: 'ТехноМаркет IG', username: '@techno.market' }
]

export const demoProjects: DemoProject[] = [
  {
    id: 'coffee-shop',
    name: 'Кофейня "Бодрость"',
    accounts: coffeeShopAccounts,
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
        content: 'Весна пришла — и мы решили порадовать вас! До конца марта скидка 20% на все виды латте.',
        type: 'post',
        status: 'published',
        accountId: 'coffee-vk-1',
        tags: ['tag-cs-1'],
        date: '2026-05-15',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Latte',
        conversationId: 'conv-demo-1',
        publishedLink: 'https://vk.com/wall-123456_789'
      },
      {
        id: 'cs-2',
        title: 'Новый десерт: тирамису',
        content: 'Встречайте новинку в нашем меню — итальянский тирамису по авторскому рецепту нашего шефа!',
        type: 'story',
        status: 'draft',
        accountId: 'coffee-ig-1',
        tags: ['tag-cs-3'],
        date: '2026-05-18',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Tiramisu'
      },
      {
        id: 'cs-3',
        title: 'Как мы варим кофе',
        type: 'reels',
        status: 'idea',
        accountId: 'coffee-yt-1',
        tags: ['tag-cs-2'],
        date: '2026-05-22'
      },
      {
        id: 'cs-4',
        title: 'Поздравление с Днём Победы',
        content: '9 мая — день, который объединяет всех нас. Помним. Гордимся.',
        type: 'post',
        status: 'published',
        accountId: 'coffee-tg-1',
        tags: ['tag-cs-4', 'tag-cs-3'],
        date: '2026-05-09',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Victory+Day',
        publishedLink: 'https://t.me/coffeshop_bodrost/41'
      },
      {
        id: 'cs-5',
        title: 'Пасхальные куличи',
        type: 'post',
        status: 'idea',
        accountId: 'coffee-vk-1',
        tags: ['tag-cs-1', 'tag-cs-4'],
        date: '2026-04-12'
      },
      {
        id: 'cs-6',
        title: 'Кофе с собой',
        content: 'Спешите на работу? Возьмите кофе с собой! Готовим за 2 минуты.',
        type: 'story',
        status: 'published',
        accountId: 'coffee-ig-1',
        tags: ['tag-cs-1'],
        date: '2026-05-10',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Coffee+To+Go'
      },
      {
        id: 'cs-7',
        title: 'Знакомьтесь: наш бариста',
        content: 'Сергей работает у нас уже 3 года. Он знает более 50 рецептов!',
        type: 'reels',
        status: 'ready',
        accountId: 'coffee-ig-1',
        tags: ['tag-cs-4', 'tag-cs-2'],
        date: '2026-05-12',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Barista'
      },
      {
        id: 'cs-8',
        title: 'Рецепт домашнего латте',
        content: 'Делимся секретом идеального латте дома.',
        type: 'post',
        status: 'draft',
        accountId: 'coffee-tg-1',
        tags: ['tag-cs-2'],
        date: '2026-05-19'
      },
      {
        id: 'cs-9',
        title: 'Утренняя акция 7-9',
        content: 'Каждое утро с 7 до 9 — скидка 15% на все напитки.',
        type: 'post',
        status: 'published',
        accountId: 'coffee-vk-1',
        tags: ['tag-cs-1', 'tag-cs-3'],
        date: '2026-05-05',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Morning+Sale',
        publishedLink: 'https://vk.com/wall-123456_785'
      },
      {
        id: 'cs-10',
        title: 'День рождения кофейни',
        type: 'post',
        status: 'idea',
        accountId: 'coffee-ig-1',
        tags: ['tag-cs-3', 'tag-cs-4'],
        date: '2026-04-01'
      }
    ],
    infoEvents: [
      { id: 'ie-1', title: 'Праздник Весны и Труда', date: '2026-05-01', description: '1 мая — выходной, поток в город' },
      { id: 'ie-2', title: 'День Победы', date: '2026-05-09', description: 'Главный праздник мая' },
      { id: 'ie-3', title: 'День семьи', date: '2026-05-15', description: 'Международный день семей' },
      { id: 'ie-4', title: 'День музеев', date: '2026-05-18', description: 'Ночь музеев — повод для коллабов' },
      { id: 'ie-5', title: 'День славянской письменности', date: '2026-05-24', description: 'День славянской письменности и культуры' },
      { id: 'ie-6', title: 'Пасха', date: '2026-04-12', description: 'Православная Пасха' }
    ],
    news: [
      {
        id: 'n-1',
        title: 'Цены на кофе выросли на 15%',
        description: 'Мировые цены на кофе достигли максимума за последние 10 лет.',
        source: 'РБК',
        date: '2026-05-20',
        url: 'https://rbc.ru/business/coffee-prices-2026'
      },
      {
        id: 'n-2',
        title: 'Тренд: овсяное молоко обогнало миндальное',
        description: 'Продажи овсяного молока в России выросли на 340% за год.',
        source: 'VC.ru',
        date: '2026-05-18',
        url: 'https://vc.ru/food/oat-milk-trend'
      }
    ],
    trends: [
      {
        id: 'tr-cs-1',
        name: '#CoffeeTrends',
        hashtag: '#CoffeeTrends',
        tweetsCount: 15200,
        category: 'Еда и напитки',
        url: 'https://twitter.com/search?q=%23CoffeeTrends'
      },
      {
        id: 'tr-cs-2',
        name: '#SpecialtyCoffee',
        hashtag: '#SpecialtyCoffee',
        tweetsCount: 8400,
        category: 'Еда и напитки',
        url: 'https://twitter.com/search?q=%23SpecialtyCoffee'
      }
    ]
  },
  {
    id: 'blogger-anya',
    name: 'Блогер Аня',
    accounts: bloggerAnyaAccounts,
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
        accountId: 'anya-ig-1',
        tags: ['tag-ba-1', 'tag-ba-4'],
        date: '2026-05-16',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Morning'
      },
      {
        id: 'ba-2',
        title: 'Коллаб с брендом',
        type: 'post',
        status: 'draft',
        accountId: 'anya-ig-1',
        tags: ['tag-ba-2'],
        date: '2026-05-20'
      },
      {
        id: 'ba-3',
        title: 'Q&A сессия',
        type: 'story',
        status: 'idea',
        accountId: 'anya-ig-1',
        tags: ['tag-ba-3'],
        date: '2026-05-25'
      },
      {
        id: 'ba-4',
        title: 'Мой гардероб на весну',
        content: 'Показываю капсульный гардероб на весну 2026.',
        type: 'reels',
        status: 'published',
        accountId: 'anya-yt-1',
        tags: ['tag-ba-4', 'tag-ba-1'],
        date: '2026-05-08',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Wardrobe',
        publishedLink: 'https://youtube.com/watch?v=wardrobe2026'
      },
      {
        id: 'ba-5',
        title: 'Влог из Дубая',
        type: 'reels',
        status: 'ready',
        accountId: 'anya-yt-1',
        tags: ['tag-ba-4', 'tag-ba-1'],
        date: '2026-05-22',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Dubai'
      }
    ],
    infoEvents: [
      { id: 'ie-ba-1', title: 'Праздник Весны и Труда', date: '2026-05-01', description: 'Майские — пора лайфстайл-контента' },
      { id: 'ie-ba-2', title: 'День Победы', date: '2026-05-09', description: 'Главный праздник мая' },
      { id: 'ie-ba-3', title: 'День музеев', date: '2026-05-18', description: 'Ночь музеев — выход в свет' }
    ],
    news: [
      {
        id: 'n-ba-1',
        title: 'Instagram тестирует новый алгоритм',
        description: 'Соцсеть начала тестировать AI-алгоритм рекомендаций.',
        source: 'TechCrunch',
        date: '2026-05-19',
        url: 'https://techcrunch.com/instagram-algorithm-2026'
      }
    ],
    trends: [
      {
        id: 'tr-ba-1',
        name: '#OOTD',
        hashtag: '#OOTD',
        tweetsCount: 89200,
        category: 'Мода',
        url: 'https://twitter.com/search?q=%23OOTD'
      }
    ]
  },
  {
    id: 'electronics-store',
    name: 'Магазин электроники',
    accounts: electronicsStoreAccounts,
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
        accountId: 'tech-yt-1',
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-05-14',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=iPhone'
      },
      {
        id: 'es-2',
        title: 'Распродажа к 9 мая',
        type: 'post',
        status: 'ready',
        accountId: 'tech-vk-1',
        tags: ['tag-es-1', 'tag-es-4'],
        date: '2026-05-07',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Sale'
      },
      {
        id: 'es-3',
        title: 'Топ-5 наушников 2026',
        type: 'post',
        status: 'draft',
        accountId: 'tech-vk-1',
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-05-28'
      },
      {
        id: 'es-4',
        title: 'Galaxy S26 vs iPhone 17',
        content: 'Детальное сравнение двух флагманов 2026 года.',
        type: 'reels',
        status: 'ready',
        accountId: 'tech-yt-1',
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-05-10',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Comparison'
      },
      {
        id: 'es-5',
        title: 'Новинки с MWC 2026',
        type: 'post',
        status: 'published',
        accountId: 'tech-tg-1',
        tags: ['tag-es-2'],
        date: '2026-05-03',
        publishedLink: 'https://t.me/techstore/234'
      }
    ],
    infoEvents: [
      { id: 'ie-es-1', title: 'Праздник Весны и Труда', date: '2026-05-01', description: 'Длинные выходные — пик продаж' },
      { id: 'ie-es-2', title: 'День Победы', date: '2026-05-09', description: 'Скидки и тематические подборки' },
      { id: 'ie-es-3', title: 'Последний звонок', date: '2026-05-25', description: 'Гаджеты выпускникам' }
    ],
    news: [
      {
        id: 'n-es-1',
        title: 'Apple представит новые MacBook в апреле',
        description: 'Компания готовит обновление с процессорами M4.',
        source: 'Bloomberg',
        date: '2026-05-21',
        url: 'https://bloomberg.com/apple-macbook-m4'
      }
    ],
    trends: [
      {
        id: 'tr-es-1',
        name: '#TechNews',
        hashtag: '#TechNews',
        tweetsCount: 156000,
        category: 'Технологии',
        url: 'https://twitter.com/search?q=%23TechNews'
      }
    ]
  }
]
