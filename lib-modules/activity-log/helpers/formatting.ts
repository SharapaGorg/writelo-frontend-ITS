import type { ActivityLogItemDto, DayGroup } from '../types'

// === Тип сущности (entityType) → подпись ===
//
// Бэкенд отдаёт сырые snake_case-коды; покрываем популярные.
// Неизвестный тип отдаётся как есть (см. labelEntity).
const ENTITY_LABELS: Record<string, string> = {
  post: 'пост',
  post_media: 'медиа поста',
  postMedia: 'медиа поста',
  conversation: 'диалог',
  message: 'сообщение',
  workspace: 'воркспейс',
  workspace_member: 'участник',
  workspaceMember: 'участник',
  member: 'участник',
  workspace_invite: 'приглашение',
  workspaceInvite: 'приглашение',
  invite: 'приглашение',
  social_account: 'соц-аккаунт',
  socialAccount: 'соц-аккаунт',
  account: 'аккаунт',
  tag: 'тег',
  image: 'картинка',
  draft: 'черновик',
  brand_brief: 'бриф',
  brandBrief: 'бриф',
}

function labelEntity(type: string | null | undefined): string {
  if (!type) return ''
  return ENTITY_LABELS[type] ?? type.replace(/[._]/g, ' ')
}

// === Глаголы (action или последний сегмент action) → русский ===
//
// Бекенд кидает как короткие глаголы ("create", "update"), так и
// составные ("publish_now", "change_role"). Lookup пробует полную
// строку, потом последний сегмент после `.:_/-`.
const VERB_LABELS: Record<string, string> = {
  // короткие
  create: 'создал',
  created: 'создал',
  update: 'изменил',
  updated: 'изменил',
  edit: 'изменил',
  edited: 'изменил',
  change: 'изменил',
  changed: 'изменил',
  delete: 'удалил',
  deleted: 'удалил',
  remove: 'убрал',
  removed: 'убрал',
  archive: 'архивировал',
  archived: 'архивировал',
  invite: 'пригласил',
  invited: 'пригласил',
  revoke: 'отозвал',
  revoked: 'отозвал',
  accept: 'принял',
  accepted: 'принял',
  expire: 'истёк',
  expired: 'истёк',
  join: 'вступил',
  joined: 'вступил',
  leave: 'покинул',
  left: 'покинул',
  link: 'привязал',
  linked: 'привязал',
  unlink: 'отвязал',
  unlinked: 'отвязал',
  connect: 'подключил',
  connected: 'подключил',
  disconnect: 'отключил',
  disconnected: 'отключил',
  publish: 'опубликовал',
  published: 'опубликовал',
  schedule: 'запланировал',
  scheduled: 'запланировал',
  unpublish: 'снял с публикации',
  unpublished: 'снял с публикации',
  upload: 'загрузил',
  uploaded: 'загрузил',
  generate: 'сгенерил',
  generated: 'сгенерил',
  rename: 'переименовал',
  renamed: 'переименовал',
  transfer: 'передал',
  transferred: 'передал',

  // составные
  publish_now: 'опубликовал',
  publishNow: 'опубликовал',
  publish_scheduled: 'запланировал публикацию',
  publishScheduled: 'запланировал публикацию',
  schedule_post: 'запланировал',
  reschedule: 'перенёс',
  rescheduled: 'перенёс',
  change_role: 'сменил роль',
  changeRole: 'сменил роль',
  role_changed: 'сменил роль',
  transfer_ownership: 'передал владение',
  transferOwnership: 'передал владение',
  ownership_transferred: 'передал владение',
  add_media: 'добавил медиа',
  addMedia: 'добавил медиа',
  remove_media: 'удалил медиа',
  removeMedia: 'удалил медиа',
  upload_media: 'загрузил медиа',
  uploadMedia: 'загрузил медиа',
  upsert_media: 'обновил медиа',
  upsertMedia: 'обновил медиа',
  resend: 'переотправил',
  resent: 'переотправил',
  send: 'отправил',
  sent: 'отправил',
  cancel: 'отменил',
  cancelled: 'отменил',
  canceled: 'отменил',
}

// Глагол → требует ли он именительное дополнение (entity).
// "сменил роль", "опубликовал", "пригласил" — самодостаточны, дополнение
// сужается до payloadSummary. "создал", "удалил", "изменил" — нужно
// сказать ЧТО (создал ПОСТ, удалил ПРИГЛАШЕНИЕ).
const VERB_TAKES_ENTITY: Record<string, boolean> = {
  'сменил роль': false,
  'передал владение': false,
  'опубликовал': false,
  'пригласил': false,
  'отозвал': false,
  'принял': false,
  'привязал': false,
  'отвязал': false,
  'подключил': false,
  'отключил': false,
  'переотправил': false,
  'отправил': false,
  'отменил': false,
  'перенёс': false,
  'снял с публикации': false,
  'запланировал публикацию': false,
  'добавил медиа': false,
  'удалил медиа': false,
  'загрузил медиа': false,
  'обновил медиа': false,
  'переименовал': false,
}

function lastSegment(action: string): string {
  const parts = action.split(/[.:_/-]/).filter(Boolean)
  return parts[parts.length - 1] ?? action
}

function lookupVerb(action: string): string | undefined {
  // 1) полное совпадение (publish_now, change_role)
  if (VERB_LABELS[action]) return VERB_LABELS[action]
  // 2) последний сегмент (post.created → created)
  return VERB_LABELS[lastSegment(action)]
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

  const verb = lookupVerb(item.action)
  const entity = labelEntity(item.entityType)
  const tail = payloadSummary(item)
  const wantsEntity = verb !== undefined && VERB_TAKES_ENTITY[verb] !== false

  if (verb && entity && wantsEntity) {
    return tail ? `${verb} ${entity} ${tail}` : `${verb} ${entity}`
  }
  if (verb) {
    return tail ? `${verb} ${tail}` : verb
  }

  // Глагол не распознали — пытаемся хотя бы человеческий вид:
  // "post_media:upload" → "post media · upload" + хвост.
  const humanAction = item.action.replace(/[._:/-]+/g, ' ').trim()
  if (entity) {
    return tail ? `${humanAction} · ${entity} ${tail}` : `${humanAction} · ${entity}`
  }
  return tail ? `${humanAction} ${tail}` : humanAction
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
