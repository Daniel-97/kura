import { describe, it, expect } from 'vitest'
import {
  nextOccurrence, computeNextDue, expiryNoticeAt, humanizeSchedule, isActive,
} from './therapyUtils'

const d = (iso: string) => new Date(iso)

describe('nextOccurrence', () => {
  it('advances by days keeping the time of day', () => {
    expect(nextOccurrence(d('2026-07-13T08:00:00'), 2, 'day', '08:00'))
      .toEqual(d('2026-07-15T08:00:00'))
  })

  it('advances by weeks', () => {
    expect(nextOccurrence(d('2026-07-13T18:30:00'), 1, 'week', '18:30'))
      .toEqual(d('2026-07-20T18:30:00'))
  })

  it('clamps month-end overflow (Jan 31 + 1 month = Feb 28)', () => {
    expect(nextOccurrence(d('2026-01-31T08:00:00'), 1, 'month', '08:00'))
      .toEqual(d('2026-02-28T08:00:00'))
  })

  it('clamps Feb 29 + 1 year to Feb 28 on non-leap years', () => {
    expect(nextOccurrence(d('2028-02-29T08:00:00'), 1, 'year', '08:00'))
      .toEqual(d('2029-02-28T08:00:00'))
  })

  it('supports multi-year intervals', () => {
    expect(nextOccurrence(d('2026-07-13T09:00:00'), 5, 'year', '09:00'))
      .toEqual(d('2031-07-13T09:00:00'))
  })
})

describe('computeNextDue', () => {
  const now = d('2026-07-13T10:00:00')

  it('returns the start itself when still in the future', () => {
    expect(computeNextDue('2026-07-20', 1, 'day', '08:00', now))
      .toEqual(d('2026-07-20T08:00:00'))
  })

  it('skips past occurrences to the first one >= now (single email after downtime)', () => {
    // started 10 days ago, every 3 days at 08:00 → 13th 08:00 already past
    expect(computeNextDue('2026-07-03', 3, 'day', '08:00', now))
      .toEqual(d('2026-07-15T08:00:00'))
  })

  it('returns today occurrence if its time is still ahead', () => {
    expect(computeNextDue('2026-07-03', 1, 'day', '18:00', now))
      .toEqual(d('2026-07-13T18:00:00'))
  })
})

describe('expiryNoticeAt', () => {
  it('subtracts the notice days', () => {
    expect(expiryNoticeAt('2027-03-31', 30)).toEqual(d('2027-03-01T00:00:00'))
  })
})

describe('humanizeSchedule', () => {
  const t = (key: string, opts?: Record<string, unknown>) =>
    opts ? `${key}:${JSON.stringify(opts)}` : key

  it('builds the every-unit key with count and appends the time', () => {
    expect(humanizeSchedule(2, 'day', '08:00', t)).toBe(
      'therapies.every_day:{"count":2} therapies.atTime:{"time":"08:00"}',
    )
  })

  it('omits the time part when absent', () => {
    expect(humanizeSchedule(1, 'year', '', t)).toBe('therapies.every_year:{"count":1}')
  })
})

describe('isActive', () => {
  const now = d('2026-07-13T10:00:00')

  it('is active between start and end, or without end', () => {
    expect(isActive({ start_date: '2026-07-01 00:00:00Z', end_date: '' }, now)).toBe(true)
    expect(isActive({ start_date: '2026-07-01 00:00:00Z', end_date: '2026-08-01 00:00:00Z' }, now)).toBe(true)
  })

  it('is inactive before start or after end', () => {
    expect(isActive({ start_date: '2026-08-01 00:00:00Z', end_date: '' }, now)).toBe(false)
    expect(isActive({ start_date: '2026-01-01 00:00:00Z', end_date: '2026-06-01 00:00:00Z' }, now)).toBe(false)
  })

  it('a therapy without schedule dates is always active (cabinet item)', () => {
    expect(isActive({ start_date: '', end_date: '' }, now)).toBe(true)
  })
})
