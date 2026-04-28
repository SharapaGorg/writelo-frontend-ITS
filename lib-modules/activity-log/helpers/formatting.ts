import type { ActivityLogItemDto, DayGroup } from '../types'

// === Тип сущности (entityType) → подпись ===
//
// Бэкенд отдаёт сырые snake_case-коды; покрываем популярные.
// Неизвестный тип отдаётся как есть (см. labelEntity).
const ENTITY_LABELS: Record<string, string> = {
  post: 'пост',
  conversation: 'диалог',
  message: 'сообщение',
  workspace: 'воркспейс',
  member: 'участник',
  invite: 'приглашение',
  social_account: 'соц-аккаунт',
  socialAccount: 'соц-аккаунт',
  account: 'аккаунт',
  tag: 'тег',
  image: 'картинка',
  draft: 'черновик',
}

function labelEntity(type: string | null | undefined): string {
  if (!type) return ''
  return ENTITY_LABELS[type] ?? type.replace(/[._]/g, ' ')
}

// === Глаголы (последний сегмент action) → русский ===
const VERB_LABELS: Record<string, string> = {
  created: 'создал',
  updated: 'изменил',
  edited: 'изменил',
  changed: 'изменил',
  deleted: 'удалил',
  removed: 'убрал',
  archived: 'архивировал',
  invited: 'пригласил',
  revoked: 'отозвал',
  accepted: 'принял',
  expired: 'истёк',
  joined: 'вступил',
  left: 'покинул',
  linked: 'привязал',
  unlinked: 'отвязал',
  connected: 'подключил',
  disconnected: 'отключил',
  published: 'опубликовал',
  scheduled: 'запланировал',
  unpublished: 'снял с публикации',
  uploaded: 'загрузил',
  generated: 'сгенерил',
  renamed: 'переименовал',
  transferred: 'передал',
}

function lastSegment(action: string): string {
  const parts = action.split(/[.:_/-]/).filter(Boolean)
  return parts[parts.length - 1] ?? action
}

// === Полезные поля из payload ===
//
// Payload приходит JSON-объектом произвольной формы. Достаём типичные
// «человеческие» подписи, которые помогают понять что произошло.
function quote(s: unknown): string {
  if (typeof s !== 'string' || !s.trim()) return ''
  const trimmed = s.length > 60 ? `${s.slice(0, 60)}…` : s
  return `«${trimmed}»`
}

export function payloadSummary(item: ActivityLogItemDto): string | null {
  const p = item.payload
  if (!p || typeof p !== 'object') return null
  const obj = p as Record<string, unknown>

  // Заголовок поста / диалога / сущности.
  if (typeof obj.title === 'string') return quote(obj.title)
  if (typeof obj.name === 'string') return quote(obj.name)

  // Email + роль (инвайты).
  if (typeof obj.email === 'string') {
    const role = typeof obj.role === 'string' ? ` как ${roleLabel(obj.role)}` : ''
    return `${obj.email}${role}`
  }

  // Смена роли участника: oldRole → newRole.
  if (typeof obj.oldRole === 'string' && typeof obj.newRole === 'string') {
    return `${roleLabel(obj.oldRole)} → ${roleLabel(obj.newRole)}`
  }
  if (typeof obj.role === 'string' && !obj.email) {
    return roleLabel(obj.role)
  }

  // Соц-сети.
  if (typeof obj.network === 'string') {
    const username =
      typeof obj.username === 'string' ? obj.username :
      typeof obj.accountName === 'string' ? obj.accountName : null
    return username ? `${networkLabel(obj.network)} · ${username}` : networkLabel(obj.network)
  }

  return null
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'владелец',
  admin: 'админ',
  editor: 'редактор',
  viewer: 'зритель',
}

function roleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role
}

const NETWORK_LABEL: Record<string, string> = {
  telegram: 'Telegram',
  vk: 'VK',
  instagram: 'Instagram',
  youtube: 'YouTube',
}

function networkLabel(network: string): string {
  return NETWORK_LABEL[network.toLowerCase()] ?? network
}

// === Точечные оверрайды для известных action-кодов ===
//
// Заполняется по мере того, как реальные коды появляются с бекенда.
// Фоллбэк ниже сам справится с большинством snake_case-кодов вида
// "post.created" → "создал пост" + payloadSummary.
const ACTION_OVERRIDES: Record<string, (item: ActivityLogItemDto) => string> = {
  // Пример (заполнить когда узнаем точные строки):
  // 'post.published': (i) => {
  //   const tail = payloadSummary(i)
  //   return tail ? `опубликовал пост ${tail}` : 'опубликовал пост'
  // },
}

export function mapAction(item: ActivityLogItemDto): string {
  const override = ACTION_OVERRIDES[item.action]
  if (override) return override(item)

  // Фоллбэк: глагол + сущность + хвост из payload.
  const verb = VERB_LABELS[lastSegment(item.action)]
  const entity = labelEntity(item.entityType)
  const tail = payloadSummary(item)

  if (verb && entity) {
    return tail ? `${verb} ${entity} ${tail}` : `${verb} ${entity}`
  }
  if (verb) {
    return tail ? `${verb} ${tail}` : verb
  }

  // Совсем непонятный код — отдаём как есть, но с хвостом.
  return tail ? `${item.action} ${tail}` : item.action
}

// Подпись типа сущности для второй (мелкой) строки.
export function entityCaption(item: ActivityLogItemDto): string {
  return labelEntity(item.entityType)
}

function dayKey(iso: string): string {
  return iso.slice(0, 10) // YYYY-MM-DD
}

export function groupByDay<T extends { createdAt: string }>(items: T[]): DayGroup<T>[] {
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString())

  const buckets = new Map<string, T[]>()
  for (const it of items) {
    const k = dayKey(it.createdAt)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(it)
  }

  const labelFor = (k: string) => {
    if (k === today) return 'Сегодня'
    if (k === yesterday) return 'Вчера'
    return new Date(k).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: labelFor(key), items }))
}
