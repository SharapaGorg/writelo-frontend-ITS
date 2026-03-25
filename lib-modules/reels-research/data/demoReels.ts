import type { ReelItem } from '../types'

export const demoReels: ReelItem[] = [
  // === TRENDING (3 reels, views: 1.8M - 3.2M) ===
  {
    id: 'reel-1',
    url: 'https://instagram.com/reel/ABC123',
    author: '@viral_content',
    authorAvatar: 'https://placehold.co/100x100/e91e63/ffffff?text=V',
    description: 'POV: когда наконец понял как работает алгоритм Instagram',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Viral',
    views: 3200000,
    likes: 245000,
    comments: 8900,
    category: 'trending'
  },
  {
    id: 'reel-2',
    url: 'https://instagram.com/reel/DEF456',
    author: '@trendwatch_ru',
    authorAvatar: 'https://placehold.co/100x100/9c27b0/ffffff?text=T',
    description: 'Этот тренд взорвал интернет за 24 часа. Повторяем?',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Trend',
    views: 2400000,
    likes: 189000,
    comments: 5600,
    category: 'trending'
  },
  {
    id: 'reel-3',
    url: 'https://instagram.com/reel/GHI789',
    author: '@hype_master',
    authorAvatar: 'https://placehold.co/100x100/673ab7/ffffff?text=H',
    description: 'Почему все сейчас снимают именно так? Разбираем главный тренд недели',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Hype',
    views: 1850000,
    likes: 156000,
    comments: 4200,
    category: 'trending'
  },

  // === EDUCATIONAL (3 reels, views: 450K - 890K) ===
  {
    id: 'reel-4',
    url: 'https://instagram.com/reel/JKL012',
    author: '@smm_pro',
    authorAvatar: 'https://placehold.co/100x100/2196f3/ffffff?text=S',
    description: '5 ошибок в Reels, которые убивают охваты. Сохраняй!',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=SMM',
    views: 890000,
    likes: 67000,
    comments: 2100,
    category: 'educational'
  },
  {
    id: 'reel-5',
    url: 'https://instagram.com/reel/MNO345',
    author: '@content_academy',
    authorAvatar: 'https://placehold.co/100x100/03a9f4/ffffff?text=C',
    description: 'Как я набрал 100К подписчиков за 3 месяца. Пошаговый разбор стратегии',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Growth',
    views: 720000,
    likes: 54000,
    comments: 1850,
    category: 'educational'
  },
  {
    id: 'reel-6',
    url: 'https://instagram.com/reel/PQR678',
    author: '@digital_mentor',
    authorAvatar: 'https://placehold.co/100x100/00bcd4/ffffff?text=D',
    description: 'Нейросети для контента: топ-5 инструментов, которые сэкономят тебе часы',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=AI',
    views: 456000,
    likes: 38000,
    comments: 1200,
    category: 'educational'
  },

  // === ENTERTAINMENT (3 reels, views: 980K - 2.1M) ===
  {
    id: 'reel-7',
    url: 'https://instagram.com/reel/STU901',
    author: '@comedy_rus',
    authorAvatar: 'https://placehold.co/100x100/ff5722/ffffff?text=C',
    description: 'Типичное утро контент-мейкера. Узнал себя?',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Fun',
    views: 2100000,
    likes: 198000,
    comments: 7800,
    category: 'entertainment'
  },
  {
    id: 'reel-8',
    url: 'https://instagram.com/reel/VWX234',
    author: '@meme_factory',
    authorAvatar: 'https://placehold.co/100x100/ff9800/ffffff?text=M',
    description: 'SMM-щики поймут. Когда клиент просит "сделать вирусный контент"',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Meme',
    views: 1450000,
    likes: 142000,
    comments: 5400,
    category: 'entertainment'
  },
  {
    id: 'reel-9',
    url: 'https://instagram.com/reel/YZA567',
    author: '@fun_content',
    authorAvatar: 'https://placehold.co/100x100/ffc107/ffffff?text=F',
    description: 'Ожидание vs Реальность: съемка Reels дома',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Real',
    views: 985000,
    likes: 89000,
    comments: 3200,
    category: 'entertainment'
  },

  // === LIFESTYLE (3 reels, views: 560K - 920K) ===
  {
    id: 'reel-10',
    url: 'https://instagram.com/reel/BCD890',
    author: '@life_balance',
    authorAvatar: 'https://placehold.co/100x100/4caf50/ffffff?text=L',
    description: 'Мой утренний ритуал продуктивности. 5:00 подъем изменил все',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Morning',
    views: 920000,
    likes: 72000,
    comments: 2800,
    category: 'lifestyle'
  },
  {
    id: 'reel-11',
    url: 'https://instagram.com/reel/EFG123',
    author: '@aesthetic_daily',
    authorAvatar: 'https://placehold.co/100x100/8bc34a/ffffff?text=A',
    description: 'Эстетика рабочего места фрилансера. Как организовать пространство для творчества',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Desk',
    views: 745000,
    likes: 58000,
    comments: 1900,
    category: 'lifestyle'
  },
  {
    id: 'reel-12',
    url: 'https://instagram.com/reel/HIJ456',
    author: '@creator_life',
    authorAvatar: 'https://placehold.co/100x100/cddc39/ffffff?text=C',
    description: 'День из жизни контент-криейтора. От идеи до публикации за 12 часов',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Day',
    views: 568000,
    likes: 45000,
    comments: 1600,
    category: 'lifestyle'
  },

  // === BUSINESS (3 reels, views: 340K - 680K) ===
  {
    id: 'reel-13',
    url: 'https://instagram.com/reel/KLM789',
    author: '@business_tips',
    authorAvatar: 'https://placehold.co/100x100/607d8b/ffffff?text=B',
    description: 'Как я монетизирую блог с 10К подписчиков. Реальные цифры',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Money',
    views: 678000,
    likes: 52000,
    comments: 2400,
    category: 'business'
  },
  {
    id: 'reel-14',
    url: 'https://instagram.com/reel/NOP012',
    author: '@startup_ru',
    authorAvatar: 'https://placehold.co/100x100/795548/ffffff?text=S',
    description: '3 способа найти первых клиентов через Instagram. Работает в 2024',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Clients',
    views: 523000,
    likes: 41000,
    comments: 1800,
    category: 'business'
  },
  {
    id: 'reel-15',
    url: 'https://instagram.com/reel/QRS345',
    author: '@marketing_guru',
    authorAvatar: 'https://placehold.co/100x100/9e9e9e/ffffff?text=M',
    description: 'Личный бренд vs Продуктовый аккаунт: что выбрать для старта бизнеса',
    thumbnail: 'https://placehold.co/400x712/1a1a2e/ffffff?text=Brand',
    views: 345000,
    likes: 28000,
    comments: 1100,
    category: 'business'
  }
]
