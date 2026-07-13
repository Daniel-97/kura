import { describe, it, expect } from 'vitest'
import { daysUntil, formatMetaDate, lastNDays } from './dashboardUtils'

const NOW = new Date('2026-07-13T10:00:00Z')

describe('daysUntil', () => {
  it('returns 0 for a date later the same day', () => {
    expect(daysUntil('2026-07-13 18:00:00.000Z', NOW)).toBe(0)
  })

  it('returns 1 for tomorrow even when fewer than 24h away', () => {
    expect(daysUntil('2026-07-14 08:00:00.000Z', NOW)).toBe(1)
  })

  it('counts calendar days for later dates', () => {
    expect(daysUntil('2026-07-20 10:30:00.000Z', NOW)).toBe(7)
  })
})

describe('formatMetaDate', () => {
  it('formats as "GG mmm AAAA" in italian', () => {
    expect(formatMetaDate('2026-07-20 10:30:00.000Z', 'it')).toBe('20 lug 2026')
  })

  it('formats in english', () => {
    expect(formatMetaDate('2026-07-20 10:30:00.000Z', 'en')).toBe('20 Jul 2026')
  })
})

describe('lastNDays', () => {
  const m = (iso: string) => ({ measured_at: iso })

  it('keeps only measurements within the window', () => {
    const items = [
      m('2026-07-10 08:00:00.000Z'),
      m('2026-06-20 08:00:00.000Z'),
      m('2026-05-01 08:00:00.000Z'),
    ]
    expect(lastNDays(items, 30, NOW)).toEqual([
      m('2026-07-10 08:00:00.000Z'),
      m('2026-06-20 08:00:00.000Z'),
    ])
  })

  it('returns empty for no recent measurements', () => {
    expect(lastNDays([m('2025-01-01 08:00:00.000Z')], 30, NOW)).toEqual([])
  })
})
