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
        content: 'Весна пришла — и мы решили порадовать вас! До конца марта скидка 20% на все виды латте: классический, карамельный, ванильный и наш фирменный "Бодрость".\n\nПриходите согреться и насладиться любимым напитком по приятной цене. Ждём вас каждый день с 8:00 до 22:00!',
        type: 'post',
        status: 'published',
        networks: ['vk', 'telegram'],
        tags: ['tag-cs-1'],
        date: '2026-03-15',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Latte',
        conversationId: 'conv-demo-1',
        publishedLinks: {
          vk: 'https://vk.com/wall-123456_789',
          telegram: 'https://t.me/coffeshop_bodrost/42'
        },
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
        content: 'Встречайте новинку в нашем меню — итальянский тирамису по авторскому рецепту нашего шефа!\n\nНежные слои савоярди, пропитанные эспрессо, воздушный крем маскарпоне и лёгкая горчинка какао — идеальное сочетание для настоящих ценителей.',
        type: 'story',
        status: 'draft',
        networks: ['instagram'],
        tags: ['tag-cs-3'],
        date: '2026-03-18',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Tiramisu',
        conversationId: 'conv-demo-3',
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
        content: 'Милые дамы! Поздравляем вас с Международным женским днём!\n\nСегодня всем девушкам — кофе в подарок к любому заказу. Приходите за хорошим настроением и ароматным напитком!\n\nС любовью, команда "Бодрость" ❤️',
        type: 'post',
        status: 'published',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-cs-4', 'tag-cs-3'],
        date: '2026-03-08',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=8+March',
        conversationId: 'conv-demo-2',
        publishedLinks: {
          vk: 'https://vk.com/wall-123456_788',
          telegram: 'https://t.me/coffeshop_bodrost/41',
          instagram: 'https://instagram.com/p/ABC123'
        },
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
      },
      {
        id: 'cs-6',
        title: 'Кофе с собой',
        content: 'Спешите на работу? Возьмите кофе с собой! Горячий, ароматный, в удобном стакане. Готовим за 2 минуты.',
        type: 'story',
        status: 'published',
        networks: ['instagram', 'vk'],
        tags: ['tag-cs-1'],
        date: '2026-03-10',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Coffee+To+Go',
        previews: {
          instagram: { text: 'Кофе с собой за 2 минуты!', likes: 456, comments: 12 },
          vk: { text: 'Горячий кофе с собой — готовим за 2 минуты!', likes: 189, comments: 8, shares: 5 }
        }
      },
      {
        id: 'cs-7',
        title: 'Знакомьтесь: наш бариста',
        content: 'Сергей работает у нас уже 3 года. Он знает более 50 рецептов и готовит лучший раф в городе!',
        type: 'reels',
        status: 'ready',
        networks: ['instagram', 'youtube', 'vk'],
        tags: ['tag-cs-4', 'tag-cs-2'],
        date: '2026-03-12',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Barista',
        previews: {
          instagram: { text: 'Знакомьтесь — наш бариста Сергей!', likes: 1230, comments: 89 },
          youtube: { text: 'Лучший бариста города | Бодрость', likes: 890, comments: 45 },
          vk: { text: 'Наш бариста Сергей: 50 рецептов в голове!', likes: 567, comments: 34, shares: 23 }
        }
      },
      {
        id: 'cs-8',
        title: 'Рецепт домашнего латте',
        content: 'Делимся секретом идеального латте дома. Вам понадобится: эспрессо, молоко 3.2%, питчер...',
        type: 'post',
        status: 'draft',
        networks: ['telegram', 'vk'],
        tags: ['tag-cs-2'],
        date: '2026-03-19',
        previews: {
          telegram: { text: 'Как приготовить латте дома: пошаговый рецепт', views: 0 },
          vk: { text: 'Секрет идеального латте — рецепт от нашего бариста' }
        }
      },
      {
        id: 'cs-9',
        title: 'Утренняя акция 7-9',
        content: 'Каждое утро с 7 до 9 — скидка 15% на все напитки. Бодрое начало дня гарантировано!',
        type: 'post',
        status: 'published',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-cs-1', 'tag-cs-3'],
        date: '2026-03-05',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Morning+Sale',
        publishedLinks: {
          vk: 'https://vk.com/wall-123456_785',
          telegram: 'https://t.me/coffeshop_bodrost/38'
        },
        previews: {
          vk: { text: 'Утренняя акция! -15% с 7 до 9 утра', likes: 345, comments: 28, shares: 19 },
          telegram: { text: 'Скидка 15% на всё с 7 до 9!', views: 2100 },
          instagram: { text: 'Morning special: 15% off 7-9 AM', likes: 678, comments: 45 }
        }
      },
      {
        id: 'cs-10',
        title: 'День рождения кофейни',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-cs-3', 'tag-cs-4'],
        date: '2026-04-01',
        previews: {
          vk: { text: 'Нам 5 лет! Праздничные скидки весь день' },
          telegram: { text: '5 лет Бодрости! Праздник для всех' },
          instagram: { text: 'Happy 5th Birthday to us!' }
        }
      },
      {
        id: 'cs-11',
        title: 'Новая кофемашина',
        content: 'Мы обновили оборудование! Новая La Marzocco делает кофе ещё вкуснее. Приходите пробовать!',
        type: 'story',
        status: 'published',
        networks: ['instagram'],
        tags: ['tag-cs-2'],
        date: '2026-03-03',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=New+Machine',
        previews: {
          instagram: { text: 'Новая кофемашина La Marzocco!', likes: 892, comments: 67 }
        }
      },
      {
        id: 'cs-12',
        title: 'Викторина про кофе',
        type: 'story',
        status: 'ready',
        networks: ['instagram', 'telegram'],
        tags: ['tag-cs-3'],
        date: '2026-03-24',
        previews: {
          instagram: { text: 'Угадай сорт кофе — получи скидку!' },
          telegram: { text: 'Викторина! Угадай сорт — получи промокод', views: 0 }
        }
      },
      {
        id: 'cs-13',
        title: 'Летнее меню',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'instagram'],
        tags: ['tag-cs-1', 'tag-cs-3'],
        date: '2026-04-15',
        previews: {
          vk: { text: 'Анонс летнего меню: холодный кофе и лимонады' },
          instagram: { text: 'Summer menu coming soon!' }
        }
      },
      {
        id: 'cs-14',
        title: 'Отзыв клиента',
        content: 'Спасибо Марии за тёплые слова! "Лучший кофе в районе, хожу только сюда уже 2 года"',
        type: 'post',
        status: 'draft',
        networks: ['vk', 'telegram'],
        tags: ['tag-cs-4'],
        date: '2026-03-26',
        previews: {
          vk: { text: 'Отзыв нашей постоянной гостьи Марии' },
          telegram: { text: 'Спасибо за отзыв!', views: 0 }
        }
      },
      {
        id: 'cs-15',
        title: 'Кофейный мастер-класс',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'instagram', 'telegram'],
        tags: ['tag-cs-2', 'tag-cs-3'],
        date: '2026-04-05',
        previews: {
          vk: { text: 'Приглашаем на мастер-класс по латте-арту!' },
          instagram: { text: 'Latte art workshop — sign up now!' },
          telegram: { text: 'МК по латте-арту: запись открыта', views: 0 }
        }
      }
    ],
    infoEvents: [
      { id: 'ie-1', title: 'Масленица', date: '2026-03-01', description: 'Прощёное воскресенье, последний день Масленицы' },
      { id: 'ie-2', title: '8 Марта', date: '2026-03-08', description: 'Международный женский день' },
      { id: 'ie-3', title: 'День числа Пи', date: '2026-03-14', description: '3.14 — праздник математиков и гиков' },
      { id: 'ie-4', title: 'День счастья', date: '2026-03-20', description: 'Международный день счастья' },
      { id: 'ie-5', title: 'День театра', date: '2026-03-27', description: 'Международный день театра' },
      { id: 'ie-6', title: 'Пасха', date: '2026-04-12', description: 'Православная Пасха' },
      { id: 'ie-7', title: '1 Мая', date: '2026-05-01', description: 'День труда' }
    ],
    news: [
      {
        id: 'n-1',
        title: 'Цены на кофе выросли на 15%',
        description: 'Мировые цены на кофе достигли максимума за последние 10 лет из-за засухи в Бразилии. Эксперты прогнозируют дальнейший рост цен в ближайшие месяцы.',
        source: 'РБК',
        date: '2026-03-20',
        url: 'https://rbc.ru/business/coffee-prices-2026'
      },
      {
        id: 'n-2',
        title: 'Тренд: овсяное молоко обогнало миндальное',
        description: 'По данным исследования Nielsen, продажи овсяного молока в России выросли на 340% за год. Потребители выбирают его за экологичность и нейтральный вкус.',
        source: 'VC.ru',
        date: '2026-03-18',
        url: 'https://vc.ru/food/oat-milk-trend'
      },
      {
        id: 'n-3',
        title: 'Starbucks открыл 100-ю кофейню в России',
        description: 'Американская сеть кофеен отмечает юбилей на российском рынке. Компания планирует открыть ещё 50 точек до конца года.',
        source: 'Коммерсант',
        date: '2026-03-15',
        url: 'https://kommersant.ru/starbucks-100'
      }
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
      { id: 'ie-ba-1', title: 'Масленица', date: '2026-03-01', description: 'Прощёное воскресенье' },
      { id: 'ie-ba-2', title: '8 Марта', date: '2026-03-08', description: 'Международный женский день' },
      { id: 'ie-ba-3', title: 'День счастья', date: '2026-03-20', description: 'Делаем контент про позитив' },
      { id: 'ie-ba-4', title: 'День театра', date: '2026-03-27', description: 'Коллаб с театром?' },
      { id: 'ie-ba-5', title: 'День блогера', date: '2026-04-17' }
    ],
    news: [
      {
        id: 'n-ba-1',
        title: 'Instagram тестирует новый алгоритм рекомендаций',
        description: 'Соцсеть начала тестировать AI-алгоритм, который лучше понимает интересы пользователей. Блогеры отмечают рост охватов на 20-30%.',
        source: 'TechCrunch',
        date: '2026-03-19',
        url: 'https://techcrunch.com/instagram-algorithm-2026'
      },
      {
        id: 'n-ba-2',
        title: 'YouTube Shorts обгоняет TikTok по просмотрам',
        description: 'Короткие видео на YouTube набирают 50 млрд просмотров в день. Платформа запускает новую программу монетизации для авторов Shorts.',
        source: 'The Verge',
        date: '2026-03-17',
        url: 'https://theverge.com/youtube-shorts-tiktok'
      }
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
      { id: 'ie-es-1', title: '8 Марта', date: '2026-03-08', description: 'Скидки на подарки для женщин' },
      { id: 'ie-es-2', title: 'День числа Пи', date: '2026-03-14', description: 'Скидка 3.14% для гиков' },
      { id: 'ie-es-3', title: 'День счастья', date: '2026-03-20', description: 'Акция «Счастливые часы»' },
      { id: 'ie-es-4', title: 'Чёрная пятница', date: '2026-11-27' }
    ],
    news: [
      {
        id: 'n-es-1',
        title: 'Apple представит новые MacBook в апреле',
        description: 'Компания готовит обновление линейки ноутбуков с процессорами M4. Ожидается увеличение автономности до 24 часов и новый дизайн.',
        source: 'Bloomberg',
        date: '2026-03-21',
        url: 'https://bloomberg.com/apple-macbook-m4'
      },
      {
        id: 'n-es-2',
        title: 'Samsung выпустит складной планшет',
        description: 'Корейский гигант анонсировал первый в мире складной планшет с диагональю 17 дюймов. Старт продаж запланирован на осень 2026.',
        source: 'The Verge',
        date: '2026-03-18',
        url: 'https://theverge.com/samsung-foldable-tablet'
      },
      {
        id: 'n-es-3',
        title: 'Xiaomi выходит на рынок электромобилей',
        description: 'Xiaomi SU7 поступит в продажу в России уже летом. Электромобиль разгоняется до 100 км/ч за 2.8 секунды и проезжает до 800 км на одной зарядке.',
        source: 'Reuters',
        date: '2026-03-15',
        url: 'https://reuters.com/xiaomi-ev-russia'
      }
    ]
  }
]
