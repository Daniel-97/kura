/** Calendar days between now and the given date (0 = today, 1 = tomorrow). */
export function daysUntil(dateStr: string, now = new Date()): number {
  const target = new Date(dateStr)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const ms = startOfDay(target).getTime() - startOfDay(now).getTime()
  return Math.round(ms / 86_400_000)
}

/** Design system §9: dates in metadata as "GG mmm AAAA" (e.g. "12 lug 2026").
 *  Plain "en" resolves to en-US (month first): pin en-GB for day-first order. */
export function formatMetaDate(dateStr: string, locale: string): string {
  const dayFirst = locale === 'en' ? 'en-GB' : locale
  return new Intl.DateTimeFormat(dayFirst, {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr)).replace(/\./g, '')
}

/** Measurements within the last n days, input order preserved. */
export function lastNDays<T extends { measured_at: string }>(
  measurements: T[],
  n: number,
  now = new Date(),
): T[] {
  const cutoff = now.getTime() - n * 86_400_000
  return measurements.filter((m) => new Date(m.measured_at).getTime() >= cutoff)
}
