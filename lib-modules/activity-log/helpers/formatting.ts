import type { ActivityLogItemDto, DayGroup } from '../types'

type Translator = (key: string, params?: Record<string, unknown>) => string

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase()).replace(/^_/, '')
}

// Backend hands out raw snake_case codes; we have a curated dictionary in
// i18n.activityLog.entities. Unknown codes fall back to a humanised form.
const ENTITY_KEYS = new Set([
  'post', 'post_media', 'conversation', 'message',
  'workspace', 'workspace_member', 'member',
  'workspace_invite', 'invite',
  'social_account', 'account',
  'tag', 'image', 'draft', 'brand_brief',
])

function labelEntity(t: Translator, type: string | null | undefined): string {
  if (!type) return ''
  const snake = toSnake(type)
  if (ENTITY_KEYS.has(snake)) return t(`activityLog.entities.${snake}`)
  return type.replace(/[._]/g, ' ')
}

// Action verbs. Backend mixes short ("create") with composite ("publish_now",
// "change_role"). Try full snake form first, then last segment.
const VERB_FULL: Record<string, string> = {
  publish_now: 'publish',
  publish_scheduled: 'publishScheduled',
  change_role: 'changeRole',
  role_changed: 'changeRole',
  transfer_ownership: 'transferOwnership',
  ownership_transferred: 'transferOwnership',
  add_media: 'addMedia',
  remove_media: 'removeMedia',
  upload_media: 'uploadMedia',
  upsert_media: 'upsertMedia',
  schedule_post: 'schedule',
}

const VERB_LAST_SEGMENT: Record<string, string> = {
  create: 'create',
  created: 'create',
  update: 'update',
  updated: 'update',
  edit: 'update',
  edited: 'update',
  change: 'update',
  changed: 'update',
  delete: 'delete',
  deleted: 'delete',
  remove: 'remove',
  removed: 'remove',
  archive: 'archive',
  archived: 'archive',
  invite: 'invite',
  invited: 'invite',
  revoke: 'revoke',
  revoked: 'revoke',
  accept: 'accept',
  accepted: 'accept',
  expire: 'expire',
  expired: 'expire',
  join: 'join',
  joined: 'join',
  leave: 'leave',
  left: 'leave',
  link: 'link',
  linked: 'link',
  unlink: 'unlink',
  unlinked: 'unlink',
  connect: 'connect',
  connected: 'connect',
  disconnect: 'disconnect',
  disconnected: 'disconnect',
  publish: 'publish',
  published: 'publish',
  schedule: 'schedule',
  scheduled: 'schedule',
  unpublish: 'unpublish',
  unpublished: 'unpublish',
  upload: 'upload',
  uploaded: 'upload',
  generate: 'generate',
  generated: 'generate',
  rename: 'rename',
  renamed: 'rename',
  transfer: 'transfer',
  transferred: 'transfer',
  resend: 'resend',
  resent: 'resend',
  send: 'send',
  sent: 'send',
  cancel: 'cancel',
  cancelled: 'cancel',
  canceled: 'cancel',
  reschedule: 'reschedule',
  rescheduled: 'reschedule',
}

// Verbs that already include their object — don't append the entity word.
const COMPOUND_VERB_KEYS = new Set<string>([
  'changeRole', 'transferOwnership', 'publish', 'publishScheduled',
  'invite', 'revoke', 'accept',
  'link', 'unlink', 'connect', 'disconnect',
  'resend', 'send', 'cancel', 'reschedule', 'unpublish',
  'addMedia', 'removeMedia', 'uploadMedia', 'upsertMedia',
  'rename',
])

function lastSegment(action: string): string {
  const parts = action.split(/[.:_/-]/).filter(Boolean)
  return parts[parts.length - 1] ?? action
}

function lookupVerbKey(action: string): string | undefined {
  const snake = toSnake(action)
  if (VERB_FULL[snake]) return VERB_FULL[snake]
  const seg = lastSegment(snake)
  return VERB_LAST_SEGMENT[seg]
}

function quote(s: unknown): string {
  if (typeof s !== 'string' || !s.trim()) return ''
  const trimmed = s.length > 60 ? `${s.slice(0, 60)}…` : s
  return `«${trimmed}»`
}

const ROLE_KEYS = new Set(['owner', 'admin', 'editor', 'viewer'])
function roleLabel(t: Translator, role: string): string {
  return ROLE_KEYS.has(role) ? t(`activityLog.roles.${role}`) : role
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

export function payloadSummary(t: Translator, item: ActivityLogItemDto): string | null {
  const p = item.payload
  if (!p || typeof p !== 'object') return null
  const obj = p as Record<string, unknown>

  if (typeof obj.title === 'string') return quote(obj.title)
  if (typeof obj.name === 'string') return quote(obj.name)

  if (typeof obj.email === 'string') {
    const role =
      typeof obj.role === 'string'
        ? ` ${t('activityLog.payload.asRole', { role: roleLabel(t, obj.role) })}`
        : ''
    return `${obj.email}${role}`
  }

  if (typeof obj.oldRole === 'string' && typeof obj.newRole === 'string') {
    return `${roleLabel(t, obj.oldRole)} → ${roleLabel(t, obj.newRole)}`
  }
  if (typeof obj.role === 'string' && !obj.email) {
    return roleLabel(t, obj.role)
  }

  if (typeof obj.network === 'string') {
    const username =
      typeof obj.username === 'string' ? obj.username :
      typeof obj.accountName === 'string' ? obj.accountName : null
    return username ? `${networkLabel(obj.network)} · ${username}` : networkLabel(obj.network)
  }

  return null
}

export function mapAction(t: Translator, item: ActivityLogItemDto): string {
  const verbKey = lookupVerbKey(item.action)
  const verb = verbKey ? t(`activityLog.verbs.${verbKey}`) : null
  const entity = labelEntity(t, item.entityType)
  const tail = payloadSummary(t, item)
  const wantsEntity = verbKey ? !COMPOUND_VERB_KEYS.has(verbKey) : true

  if (verb && entity && wantsEntity) {
    return tail ? `${verb} ${entity} ${tail}` : `${verb} ${entity}`
  }
  if (verb) {
    return tail ? `${verb} ${tail}` : verb
  }

  // Verb not recognised — show a humanised raw action as a fallback.
  const humanAction = item.action.replace(/[._:/-]+/g, ' ').trim()
  if (entity) {
    return tail ? `${humanAction} · ${entity} ${tail}` : `${humanAction} · ${entity}`
  }
  return tail ? `${humanAction} ${tail}` : humanAction
}

export function entityCaption(t: Translator, item: ActivityLogItemDto): string {
  return labelEntity(t, item.entityType)
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function groupByDay<T extends { createdAt: string }>(
  t: Translator,
  items: T[],
  locale: string,
): DayGroup<T>[] {
  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString())

  const buckets = new Map<string, T[]>()
  for (const it of items) {
    const k = dayKey(it.createdAt)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k)!.push(it)
  }

  const localeTag = locale === 'en' ? 'en-US' : 'ru-RU'
  const labelFor = (k: string) => {
    if (k === today) return t('activityLog.today')
    if (k === yesterday) return t('activityLog.yesterday')
    return new Date(k).toLocaleDateString(localeTag, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, items]) => ({ key, label: labelFor(key), items }))
}
