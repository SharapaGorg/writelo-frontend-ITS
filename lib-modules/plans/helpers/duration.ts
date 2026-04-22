const ISO_DURATION = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/

export function formatDuration(duration: string | null | undefined): string {
  if (!duration) return ''
  const match = ISO_DURATION.exec(duration)
  if (!match) return ''

  const [, yearsStr, monthsStr, daysStr] = match
  const years = Number(yearsStr ?? 0)
  const months = Number(monthsStr ?? 0)
  const days = Number(daysStr ?? 0)

  if (years > 0) return years === 1 ? 'год' : `${years} г.`
  if (months > 0) return months === 1 ? 'месяц' : `${months} мес.`
  if (days > 0) {
    if (days % 30 === 0) {
      const m = days / 30
      return m === 1 ? 'месяц' : `${m} мес.`
    }
    return `${days} дн.`
  }
  return ''
}
