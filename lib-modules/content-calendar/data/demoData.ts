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
      },
      {
        id: 'cs-16',
        title: 'История кофе: от Эфиопии до вашей чашки',
        content: 'Кофе прошёл долгий путь от диких лесов Эфиопии до современных кофеен. Рассказываем, как пастух Калди открыл бодрящие свойства красных ягод, и как кофе завоевал весь мир...',
        type: 'article',
        status: 'published',
        networks: ['telegram', 'vk'],
        tags: ['tag-cs-2'],
        date: '2026-03-02',
        publishedLinks: {
          telegram: 'https://t.me/coffeshop_bodrost/35',
          vk: 'https://vk.com/@coffeebodrost-history'
        },
        previews: {
          telegram: { text: 'Лонгрид: История кофе от Эфиопии до наших дней', views: 4500 },
          vk: { text: 'Статья: Как кофе завоевал мир', likes: 234, comments: 45, shares: 78 }
        }
      },
      {
        id: 'cs-17',
        title: 'Гид по альтернативным способам заваривания',
        content: 'Пуровер, аэропресс, кемекс, френч-пресс — разбираемся в альтернативных способах заваривания кофе. Плюсы, минусы и для кого подойдёт каждый метод.',
        type: 'article',
        status: 'ready',
        networks: ['telegram', 'vk'],
        tags: ['tag-cs-2'],
        date: '2026-03-15',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Brewing',
        previews: {
          telegram: { text: 'Полный гид по альтернативному завариванию кофе', views: 0 },
          vk: { text: 'Статья: Пуровер, аэропресс, кемекс — что выбрать?' }
        }
      },
      {
        id: 'cs-18',
        title: 'Кофе и здоровье: мифы и факты',
        content: 'Вреден ли кофе? Сколько чашек можно пить в день? Разбираем популярные мифы о кофе с точки зрения науки.',
        type: 'article',
        status: 'draft',
        networks: ['telegram'],
        tags: ['tag-cs-2'],
        date: '2026-03-28',
        previews: {
          telegram: { text: 'Статья: Мифы о кофе — что правда, а что нет', views: 0 }
        }
      },
      {
        id: 'cs-19',
        title: 'Новый сорт: Кения АА',
        content: 'Привезли свежую партию зерна из Кении! Яркая кислотность, ноты чёрной смородины и цитрусов.',
        type: 'post',
        status: 'published',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-cs-1', 'tag-cs-2'],
        date: '2026-03-08',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Kenya+AA',
        publishedLinks: {
          vk: 'https://vk.com/wall-123456_787',
          telegram: 'https://t.me/coffeshop_bodrost/40'
        },
        previews: {
          vk: { text: 'Новинка! Кения АА — яркий и фруктовый', likes: 178, comments: 23, shares: 12 },
          telegram: { text: 'Привезли Кению АА! Пробуем?', views: 1890 },
          instagram: { text: 'New arrival: Kenya AA beans!', likes: 456, comments: 34 }
        }
      },
      {
        id: 'cs-20',
        title: 'Завтраки в Бодрости',
        content: 'Теперь у нас можно позавтракать! Круассаны, тосты, яичница и овсянка — всё свежее и вкусное.',
        type: 'post',
        status: 'ready',
        networks: ['vk', 'instagram'],
        tags: ['tag-cs-1', 'tag-cs-3'],
        date: '2026-03-22',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Breakfast',
        previews: {
          vk: { text: 'Открываем завтраки! Круассаны, тосты и не только', likes: 0, comments: 0, shares: 0 },
          instagram: { text: 'Breakfast is served! 8-11 AM', likes: 0, comments: 0 }
        }
      },
      {
        id: 'cs-21',
        title: 'Как правильно хранить кофе дома',
        content: 'Многие хранят кофе неправильно и теряют весь аромат. Рассказываем о главных ошибках и как их избежать.',
        type: 'article',
        status: 'published',
        networks: ['telegram', 'vk'],
        tags: ['tag-cs-2'],
        date: '2026-03-09',
        publishedLinks: {
          telegram: 'https://t.me/coffeshop_bodrost/39'
        },
        previews: {
          telegram: { text: 'Как хранить кофе, чтобы он не терял аромат', views: 3200 },
          vk: { text: 'Статья: 5 ошибок хранения кофе дома', likes: 145, comments: 28, shares: 56 }
        }
      },
      {
        id: 'cs-22',
        title: 'Флэт уайт vs Капучино',
        type: 'reels',
        status: 'ready',
        networks: ['instagram', 'youtube'],
        tags: ['tag-cs-2', 'tag-cs-3'],
        date: '2026-03-12',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Flat+White',
        previews: {
          instagram: { text: 'В чём разница? Флэт уайт vs Капучино', likes: 0, comments: 0 },
          youtube: { text: 'Флэт уайт и Капучино: в чём разница | Бодрость', likes: 0, comments: 0 }
        }
      },
      {
        id: 'cs-23',
        title: 'Весенний плейлист',
        content: 'Собрали плейлист для весеннего настроения. Слушайте у нас или в Яндекс.Музыке!',
        type: 'story',
        status: 'published',
        networks: ['instagram'],
        tags: ['tag-cs-4', 'tag-cs-3'],
        date: '2026-03-15',
        previews: {
          instagram: { text: 'Весенний плейлист от Бодрости!', likes: 567, comments: 23 }
        }
      },
      {
        id: 'cs-24',
        title: 'Раф: история и рецепт',
        content: 'Раф-кофе — российское изобретение! Рассказываем историю создания и делимся классическим рецептом.',
        type: 'article',
        status: 'draft',
        networks: ['telegram', 'vk'],
        tags: ['tag-cs-2'],
        date: '2026-03-30',
        previews: {
          telegram: { text: 'Как появился раф-кофе и почему он такой вкусный', views: 0 },
          vk: { text: 'История раф-кофе: от бара «Кофе Бин» до всей России' }
        }
      },
      {
        id: 'cs-25',
        title: 'Субботний бранч',
        type: 'story',
        status: 'idea',
        networks: ['instagram', 'vk'],
        tags: ['tag-cs-3', 'tag-cs-1'],
        date: '2026-03-22',
        previews: {
          instagram: { text: 'Субботний бранч в Бодрости!' },
          vk: { text: 'Приглашаем на субботний бранч', likes: 0, comments: 0, shares: 0 }
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
      },
      {
        id: 'tr-cs-3',
        name: '#MorningRoutine',
        hashtag: '#MorningRoutine',
        tweetsCount: 42300,
        category: 'Лайфстайл',
        url: 'https://twitter.com/search?q=%23MorningRoutine'
      },
      {
        id: 'tr-cs-4',
        name: '#SmallBusiness',
        hashtag: '#SmallBusiness',
        tweetsCount: 28900,
        category: 'Бизнес',
        url: 'https://twitter.com/search?q=%23SmallBusiness'
      },
      {
        id: 'tr-cs-5',
        name: 'Латте арт',
        tweetsCount: 5600,
        category: 'Творчество',
        url: 'https://twitter.com/search?q=latte%20art'
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
      },
      {
        id: 'ba-4',
        title: 'Мой гардероб на весну',
        content: 'Показываю капсульный гардероб на весну 2026. 15 вещей — 30 образов!',
        type: 'reels',
        status: 'published',
        networks: ['instagram', 'youtube'],
        tags: ['tag-ba-4', 'tag-ba-1'],
        date: '2026-03-08',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Wardrobe',
        publishedLinks: {
          instagram: 'https://instagram.com/p/wardrobe2026'
        },
        previews: {
          instagram: { text: 'Капсульный гардероб на весну | 15 вещей', likes: 18500, comments: 890 },
          youtube: { text: 'Капсульный гардероб весна 2026 | 30 образов из 15 вещей', likes: 12300, comments: 456 }
        }
      },
      {
        id: 'ba-5',
        title: 'Влог из Дубая',
        type: 'reels',
        status: 'ready',
        networks: ['youtube', 'instagram'],
        tags: ['tag-ba-4', 'tag-ba-1'],
        date: '2026-03-22',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Dubai',
        previews: {
          youtube: { text: 'Влог из Дубая | Что посмотреть за 3 дня', likes: 0, comments: 0 },
          instagram: { text: 'Dubai vlog is coming!', likes: 0, comments: 0 }
        }
      },
      {
        id: 'ba-6',
        title: 'Распаковка PR-посылок',
        type: 'story',
        status: 'published',
        networks: ['instagram'],
        tags: ['tag-ba-2', 'tag-ba-3'],
        date: '2026-03-10',
        previews: {
          instagram: { text: 'Распаковка посылок от брендов!', likes: 8900, comments: 234 }
        }
      },
      {
        id: 'ba-7',
        title: 'Мой уход за кожей',
        content: 'Полная рутина ухода: утро и вечер. Все средства с ценами!',
        type: 'reels',
        status: 'draft',
        networks: ['instagram', 'youtube'],
        tags: ['tag-ba-4', 'tag-ba-1'],
        date: '2026-03-28',
        previews: {
          instagram: { text: 'Мой уход за кожей 2026 | Утро + Вечер' },
          youtube: { text: 'Уход за кожей: полная рутина с ценами' }
        }
      },
      {
        id: 'ba-8',
        title: 'Челлендж: неделя без телефона',
        type: 'reels',
        status: 'idea',
        networks: ['youtube', 'instagram'],
        tags: ['tag-ba-3', 'tag-ba-1'],
        date: '2026-04-01',
        previews: {
          youtube: { text: 'Неделя без телефона | Эксперимент' },
          instagram: { text: 'Phone detox challenge!' }
        }
      },
      {
        id: 'ba-9',
        title: 'Покупки на Wildberries',
        content: 'Заказала 20 вещей — показываю что пришло и стоит ли брать',
        type: 'reels',
        status: 'ready',
        networks: ['instagram', 'youtube'],
        tags: ['tag-ba-4'],
        date: '2026-03-14',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Haul',
        previews: {
          instagram: { text: 'Haul с Wildberries | Честный обзор', likes: 0, comments: 0 },
          youtube: { text: 'Покупки на WB: 20 вещей за 15000₽', likes: 0, comments: 0 }
        }
      },
      {
        id: 'ba-10',
        title: 'День со мной',
        type: 'story',
        status: 'published',
        networks: ['instagram'],
        tags: ['tag-ba-1'],
        date: '2026-03-05',
        previews: {
          instagram: { text: 'День со мной в сторис', likes: 15600, comments: 0 }
        }
      },
      {
        id: 'ba-11',
        title: 'Интеграция: приложение для медитации',
        type: 'story',
        status: 'draft',
        networks: ['instagram'],
        tags: ['tag-ba-2'],
        date: '2026-03-30',
        previews: {
          instagram: { text: 'Реклама приложения для медитации' }
        }
      },
      {
        id: 'ba-12',
        title: 'Макияж за 5 минут',
        content: 'Быстрый повседневный макияж для тех, кто вечно опаздывает',
        type: 'reels',
        status: 'idea',
        networks: ['instagram', 'youtube'],
        tags: ['tag-ba-4', 'tag-ba-3'],
        date: '2026-04-08',
        previews: {
          instagram: { text: '5 minute makeup tutorial' },
          youtube: { text: 'Макияж за 5 минут | Быстро и красиво' }
        }
      },
      {
        id: 'ba-13',
        title: 'Мои любимые книги',
        type: 'post',
        status: 'idea',
        networks: ['telegram', 'instagram'],
        tags: ['tag-ba-1', 'tag-ba-3'],
        date: '2026-04-03',
        previews: {
          telegram: { text: 'Топ-10 книг, которые изменили мою жизнь', views: 0 },
          instagram: { text: 'Books that changed my life' }
        }
      },
      {
        id: 'ba-14',
        title: 'Отвечаю хейтерам',
        type: 'reels',
        status: 'draft',
        networks: ['youtube'],
        tags: ['tag-ba-1', 'tag-ba-3'],
        date: '2026-03-18',
        previews: {
          youtube: { text: 'Читаю комментарии хейтеров | Без цензуры' }
        }
      },
      {
        id: 'ba-15',
        title: 'Рецепт ПП-завтрака',
        content: 'Вкусный и полезный завтрак за 10 минут. Овсянка, но не скучная!',
        type: 'reels',
        status: 'ready',
        networks: ['instagram'],
        tags: ['tag-ba-4'],
        date: '2026-03-12',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Breakfast',
        previews: {
          instagram: { text: 'ПП-завтрак за 10 минут', likes: 0, comments: 0 }
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
    ],
    trends: [
      {
        id: 'tr-ba-1',
        name: '#OOTD',
        hashtag: '#OOTD',
        tweetsCount: 89200,
        category: 'Мода',
        url: 'https://twitter.com/search?q=%23OOTD'
      },
      {
        id: 'tr-ba-2',
        name: '#ContentCreator',
        hashtag: '#ContentCreator',
        tweetsCount: 34500,
        category: 'Блогинг',
        url: 'https://twitter.com/search?q=%23ContentCreator'
      },
      {
        id: 'tr-ba-3',
        name: '#SkinCare',
        hashtag: '#SkinCare',
        tweetsCount: 67800,
        category: 'Красота',
        url: 'https://twitter.com/search?q=%23SkinCare'
      },
      {
        id: 'tr-ba-4',
        name: '#TravelBlogger',
        hashtag: '#TravelBlogger',
        tweetsCount: 23400,
        category: 'Путешествия',
        url: 'https://twitter.com/search?q=%23TravelBlogger'
      },
      {
        id: 'tr-ba-5',
        name: 'Весенний макияж',
        tweetsCount: 12100,
        category: 'Красота',
        url: 'https://twitter.com/search?q=spring%20makeup'
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
      },
      {
        id: 'es-4',
        title: 'Сравнение Galaxy S26 vs iPhone 17',
        content: 'Детальное сравнение двух флагманов 2026 года. Камеры, производительность, автономность.',
        type: 'reels',
        status: 'ready',
        networks: ['youtube', 'vk'],
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-03-10',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Comparison',
        previews: {
          youtube: { text: 'Galaxy S26 vs iPhone 17 | Полное сравнение', likes: 8900, comments: 1234 },
          vk: { text: 'Битва флагманов: Samsung vs Apple', likes: 2340, comments: 456, shares: 189 }
        }
      },
      {
        id: 'es-5',
        title: 'Новинки с MWC 2026',
        type: 'post',
        status: 'published',
        networks: ['telegram', 'vk'],
        tags: ['tag-es-2'],
        date: '2026-03-03',
        publishedLinks: {
          telegram: 'https://t.me/techstore/234',
          vk: 'https://vk.com/wall-techstore_567'
        },
        previews: {
          telegram: { text: 'Главные новинки MWC 2026: краткий обзор', views: 12400 },
          vk: { text: 'MWC 2026: все анонсы в одном посте', likes: 890, comments: 123, shares: 67 }
        }
      },
      {
        id: 'es-6',
        title: 'Розыгрыш AirPods Pro 3',
        type: 'post',
        status: 'ready',
        networks: ['instagram', 'vk', 'telegram'],
        tags: ['tag-es-4', 'tag-es-1'],
        date: '2026-03-20',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Giveaway',
        previews: {
          instagram: { text: 'GIVEAWAY! AirPods Pro 3 — условия в посте', likes: 0, comments: 0 },
          vk: { text: 'Розыгрыш наушников AirPods Pro 3!', likes: 0, comments: 0, shares: 0 },
          telegram: { text: 'Розыгрыш AirPods Pro 3 — участвуй!', views: 0 }
        }
      },
      {
        id: 'es-7',
        title: 'Как выбрать ноутбук',
        content: 'Гайд по выбору ноутбука в 2026: на что обратить внимание, какие характеристики важны',
        type: 'post',
        status: 'draft',
        networks: ['vk', 'telegram'],
        tags: ['tag-es-2'],
        date: '2026-03-25',
        previews: {
          vk: { text: 'Как выбрать ноутбук в 2026: полный гайд' },
          telegram: { text: 'Гайд: выбираем ноутбук правильно', views: 0 }
        }
      },
      {
        id: 'es-8',
        title: 'Краш-тест смартфонов',
        type: 'reels',
        status: 'idea',
        networks: ['youtube', 'instagram'],
        tags: ['tag-es-3'],
        date: '2026-04-05',
        previews: {
          youtube: { text: 'Краш-тест: роняем флагманы 2026' },
          instagram: { text: 'Phone drop test!' }
        }
      },
      {
        id: 'es-9',
        title: 'Умный дом: с чего начать',
        content: 'Собираем умный дом с нуля: колонки, лампочки, датчики. Бюджет от 10 000₽',
        type: 'reels',
        status: 'ready',
        networks: ['youtube', 'vk'],
        tags: ['tag-es-2'],
        date: '2026-03-18',
        image: 'https://placehold.co/600x750/1a1a2e/ffffff?text=Smart+Home',
        previews: {
          youtube: { text: 'Умный дом за 10000₽ | С чего начать', likes: 0, comments: 0 },
          vk: { text: 'Собираем умный дом с нуля: гайд для новичков' }
        }
      },
      {
        id: 'es-10',
        title: 'Обзор PlayStation 6',
        type: 'reels',
        status: 'idea',
        networks: ['youtube'],
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-04-15',
        previews: {
          youtube: { text: 'PlayStation 6: первые впечатления' }
        }
      },
      {
        id: 'es-11',
        title: 'Скидки на аксессуары',
        type: 'story',
        status: 'published',
        networks: ['instagram'],
        tags: ['tag-es-1', 'tag-es-4'],
        date: '2026-03-12',
        previews: {
          instagram: { text: 'Аксессуары со скидкой до 40%!', likes: 567, comments: 23 }
        }
      },
      {
        id: 'es-12',
        title: 'Лайфхаки для iPhone',
        content: '10 скрытых функций iOS, о которых вы не знали',
        type: 'reels',
        status: 'draft',
        networks: ['instagram', 'youtube'],
        tags: ['tag-es-2'],
        date: '2026-03-22',
        previews: {
          instagram: { text: '10 секретных функций iPhone' },
          youtube: { text: 'Скрытые функции iOS 19 | 10 лайфхаков' }
        }
      },
      {
        id: 'es-13',
        title: 'Распродажа ко Дню космонавтики',
        type: 'post',
        status: 'idea',
        networks: ['vk', 'telegram', 'instagram'],
        tags: ['tag-es-1', 'tag-es-4'],
        date: '2026-04-12',
        previews: {
          vk: { text: 'Космические скидки 12 апреля!' },
          telegram: { text: 'День космонавтики — скидки до 25%', views: 0 },
          instagram: { text: 'Space sale! Up to 25% off' }
        }
      },
      {
        id: 'es-14',
        title: 'Ответы на вопросы',
        type: 'story',
        status: 'ready',
        networks: ['instagram'],
        tags: ['tag-es-2'],
        date: '2026-03-26',
        previews: {
          instagram: { text: 'Q&A: отвечаем на ваши вопросы о технике' }
        }
      },
      {
        id: 'es-15',
        title: 'Новый робот-пылесос',
        content: 'Обзор Xiaomi Robot Vacuum X20 Max: тестируем в реальной квартире',
        type: 'reels',
        status: 'draft',
        networks: ['youtube', 'vk'],
        tags: ['tag-es-2', 'tag-es-3'],
        date: '2026-04-02',
        previews: {
          youtube: { text: 'Xiaomi X20 Max: честный обзор робота-пылесоса' },
          vk: { text: 'Обзор нового робота-пылесоса Xiaomi' }
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
    ],
    trends: [
      {
        id: 'tr-es-1',
        name: '#TechNews',
        hashtag: '#TechNews',
        tweetsCount: 156000,
        category: 'Технологии',
        url: 'https://twitter.com/search?q=%23TechNews'
      },
      {
        id: 'tr-es-2',
        name: '#AI',
        hashtag: '#AI',
        tweetsCount: 892000,
        category: 'Технологии',
        url: 'https://twitter.com/search?q=%23AI'
      },
      {
        id: 'tr-es-3',
        name: '#Gadgets',
        hashtag: '#Gadgets',
        tweetsCount: 45600,
        category: 'Технологии',
        url: 'https://twitter.com/search?q=%23Gadgets'
      },
      {
        id: 'tr-es-4',
        name: '#SmartHome',
        hashtag: '#SmartHome',
        tweetsCount: 34200,
        category: 'Технологии',
        url: 'https://twitter.com/search?q=%23SmartHome'
      },
      {
        id: 'tr-es-5',
        name: 'iPhone 17',
        tweetsCount: 234000,
        category: 'Гаджеты',
        url: 'https://twitter.com/search?q=iPhone%2017'
      }
    ]
  }
]
