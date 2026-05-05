// Snake-case enum codes from the analyser → readable Russian labels.
// Curated for the codes seen in production; unknown codes fall through
// to a sentence-case formatter (`expert_explanation` → "Expert explanation").

const NICHE_LABELS: Record<string, string> = {
  content_making_blogging: 'Контент и блогинг',
  marketing_smm: 'Маркетинг и SMM',
  photo_video: 'Фото и видео',
  self_development_productivity: 'Саморазвитие и продуктивность',
  beauty: 'Бьюти',
  fitness: 'Фитнес',
  food: 'Еда',
  fashion: 'Мода',
  travel: 'Путешествия',
  business: 'Бизнес',
  finance: 'Финансы',
  education: 'Образование',
  parenting: 'Родительство',
  health: 'Здоровье',
  tech: 'Технологии',
}

const FORMAT_LABELS: Record<string, string> = {
  expert_explanation: 'Экспертное объяснение',
  lifehack_tutorial: 'Лайфхак / туториал',
  before_after: 'До / после',
  talking_head: 'Говорящая голова',
  storytelling: 'Сторителлинг',
  reaction: 'Реакция',
  unboxing: 'Распаковка',
  behind_the_scenes: 'Бэкстейдж',
  vlog: 'Влог',
  review: 'Обзор',
  comparison: 'Сравнение',
  case_study: 'Кейс',
  challenge: 'Челлендж',
  meme: 'Мем',
  quote: 'Цитата',
  q_and_a: 'Вопросы и ответы',
}

const TRAFFIC_LABELS: Record<string, string> = {
  instagram_profile_visit: 'Переход в профиль Instagram',
  external_link: 'Внешняя ссылка',
  website_visit: 'Переход на сайт',
  dm: 'Личные сообщения',
  comments: 'Комментарии',
  saves: 'Сохранения',
  shares: 'Репосты',
  follow: 'Подписка',
  none: 'Не определено',
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
