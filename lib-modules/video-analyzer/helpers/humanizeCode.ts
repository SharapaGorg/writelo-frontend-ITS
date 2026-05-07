// Snake-case enum codes from the analyser → readable Russian labels.
// Lists mirror the public-API taxonomy enums (ShortVideoNiche,
// ShortVideoFormat, ShortVideoTrafficDestination, ShortVideoLanguage).
// Unknown codes fall through to a sentence-case formatter
// (`expert_explanation` → "Expert explanation").

const NICHE_LABELS: Record<string, string> = {
  finance_invest: 'Финансы и инвестиции',
  marketing_smm: 'Маркетинг и SMM',
  business_sales: 'Бизнес и продажи',
  psychology_relations: 'Психология и отношения',
  mindset_therapy: 'Майндсет и терапия',
  education_languages: 'Образование и языки',
  mama_blogs: 'Мама-блоги',
  beauty_health: 'Красота и здоровье',
  fitness_sport: 'Фитнес и спорт',
  fashion_style: 'Мода и стиль',
  law_taxes: 'Право и налоги',
  real_estate: 'Недвижимость',
  esoterics_astrology: 'Эзотерика и астрология',
  food_cooking: 'Еда и кулинария',
  home_interior: 'Дом и интерьер',
  travel_tourism: 'Путешествия и туризм',
  lifestyle_blog: 'Лайфстайл-блог',
  pets_animals: 'Питомцы и животные',
  games_geek_culture: 'Игры и гик-культура',
  music_art: 'Музыка и искусство',
  tattoos_piercing: 'Татуировки и пирсинг',
  career_freelance: 'Карьера и фриланс',
  cars_moto: 'Авто и мото',
  handmade_creativity: 'Хендмейд и творчество',
  kids_parenting: 'Дети и родительство',
  tech_ai_news_tutorials: 'Технологии и AI',
  ai_generated_art: 'AI-арт',
  ai_avatars_digital_humans: 'AI-аватары и цифровые люди',
  humor_sketches: 'Юмор и скетчи',
  health_wellness: 'Здоровье и велнес',
  nutrition: 'Нутрициология',
  medical_blogs: 'Медицинские блоги',
  dentistry: 'Стоматология',
  self_development_productivity: 'Саморазвитие и продуктивность',
  history_facts: 'История и факты',
  science: 'Наука',
  politics_society: 'Политика и общество',
  tech_gadgets: 'Гаджеты и техника',
  apps_digital_services: 'Приложения и цифровые сервисы',
  garden_plants: 'Сад и растения',
  weddings_events: 'Свадьбы и мероприятия',
  photo_video: 'Фото и видео',
  content_making_blogging: 'Контент и блогинг',
  ecology_zero_waste: 'Экология и zero waste',
  spiritual_practices: 'Духовные практики',
  astrology: 'Астрология',
  crypto: 'Криптовалюта',
  investments: 'Инвестиции',
  clothing_items: 'Одежда и аксессуары',
  restaurants_cafes_reviews: 'Обзоры ресторанов и кафе',
  graphic_design: 'Графический дизайн',
  other: 'Другое',
}

const FORMAT_LABELS: Record<string, string> = {
  talking_head: 'Говорящая голова',
  expert_explanation: 'Экспертное объяснение',
  camera_monologue: 'Монолог в камеру',
  dialogue_qa: 'Диалог / Q&A',
  interview_style: 'Интервью',
  roleplay_sketch: 'Ролевой скетч',
  storytelling: 'Сторителлинг',
  pov_scenario: 'POV-сценарий',
  lifehack_tutorial: 'Лайфхак / туториал',
  checklist_instruction: 'Чек-лист / инструкция',
  top_n_selection: 'Топ-N подборка',
  screencast_demo: 'Скринкаст / демо',
  product_review: 'Обзор продукта',
  comparison_vs: 'Сравнение / VS',
  mistake_analysis: 'Разбор ошибок',
  myth_busting: 'Разрушение мифов',
  slide_show_infographic: 'Слайд-шоу / инфографика',
  text_overlay_reading: 'Чтение с текстом на экране',
  brand_aesthetic_match_cut: 'Брендовая эстетика / match-cut',
  satisfying_asmr: 'Satisfying / ASMR',
  caption_hook_short_loop: 'Короткий цикл с хук-субтитром',
  comment_myth_reaction: 'Реакция на комментарий / миф',
  backstage_observation: 'Бэкстейдж / наблюдение',
  viral_meme: 'Вирусный мем',
  viewer_address: 'Обращение к зрителю',
  micro_lecture: 'Микролекция',
  case_study_results: 'Кейс / результаты',
  before_after: 'До / после',
}

const TRAFFIC_LABELS: Record<string, string> = {
  instagram_profile_visit: 'Переход в профиль Instagram',
  telegram_channel_redirect: 'Переход в Telegram-канал',
  keyword_automation: 'Автоматизация по ключевому слову',
  marketplace_search_target: 'Поиск в маркетплейсе',
  external_website_link: 'Внешняя ссылка',
  algorithmic_views_only: 'Только алгоритмические просмотры',
  offline_visit: 'Офлайн-визит',
}

const LANGUAGE_LABELS: Record<string, string> = {
  ru: 'Русский',
  en: 'Английский',
  other: 'Другой',
}

function fallback(code: string): string {
  const cleaned = code.replace(/[_-]+/g, ' ').trim()
  if (!cleaned) return code
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function humanizeNiche(code: string): string {
  return NICHE_LABELS[code] ?? fallback(code)
}

export function humanizeFormat(code: string): string {
  return FORMAT_LABELS[code] ?? fallback(code)
}

export function humanizeTrafficDestination(code: string): string {
  return TRAFFIC_LABELS[code] ?? fallback(code)
}

export function humanizeLanguage(code: string): string {
  return LANGUAGE_LABELS[code] ?? fallback(code)
}
