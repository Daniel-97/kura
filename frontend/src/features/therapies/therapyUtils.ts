export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year'

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

const applyTime = (date: Date, time: string): Date => {
  const [h, m] = time ? time.split(':').map(Number) : [0, 0]
  const out = new Date(date)
  out.setHours(h || 0, m || 0, 0, 0)
  return out
}

/**
 * The occurrence after `from` for an every/unit interval, keeping the
 * time of day. Month/year steps clamp to the end of the target month
 * (Jan 31 + 1 month = Feb 28) instead of overflowing.
 *
 * NB: the therapies cron in pb_hooks/therapies.pb.js duplicates this
 * algorithm (jsvm handlers can't share frontend code) — keep in sync.
 */
export function nextOccurrence(from: Date, every: number, unit: RecurrenceUnit, time: string): Date {
  const out = new Date(from)
  if (unit === 'day') {
    out.setDate(out.getDate() + every)
  } else if (unit === 'week') {
    out.setDate(out.getDate() + every * 7)
  } else {
    const months = unit === 'month' ? every : every * 12
    const total = out.getMonth() + months
    const year = out.getFullYear() + Math.floor(total / 12)
    const month = total % 12
    const day = Math.min(out.getDate(), daysInMonth(year, month))
    out.setFullYear(year, month, day)
  }
  return applyTime(out, time)
}

/** First occurrence >= now starting at start_date: after downtime the
 *  schedule resumes at the next future slot (one email, not a backlog). */
export function computeNextDue(
  startDate: string,
  every: number,
  unit: RecurrenceUnit,
  time: string,
  now = new Date(),
): Date {
  let occurrence = applyTime(new Date(startDate), time)
  while (occurrence < now) {
    occurrence = nextOccurrence(occurrence, every, unit, time)
  }
  return occurrence
}

/** Warning date for a package expiry: expiry minus the notice days. */
export function expiryNoticeAt(expiry: string, noticeDays: number): Date {
  const out = new Date(expiry)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - noticeDays)
  return out
}

type TFunction = (key: string, opts?: Record<string, unknown>) => string

/** "ogni 2 giorni alle 08:00" via i18n keys (plurals handled by i18next). */
export function humanizeSchedule(
  every: number,
  unit: RecurrenceUnit,
  time: string,
  t: TFunction,
): string {
  const base = t(`therapies.every_${unit}`, { count: every })
  return time ? `${base} ${t('therapies.atTime', { time })}` : base
}

/** Active = inside [start_date, end_date]; missing dates don't restrict. */
export function isActive(
  therapy: { start_date: string; end_date: string },
  now = new Date(),
): boolean {
  if (therapy.start_date && new Date(therapy.start_date) > now) return false
  if (therapy.end_date && new Date(therapy.end_date) < now) return false
  return true
}
