import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { filterByPreset, toChartData } from './bloodPressureUtils'
import type { BloodPressureRecord } from './types'

const make = (overrides: Partial<BloodPressureRecord> = {}): BloodPressureRecord => ({
  id: '1', systolic: 120, diastolic: 80, pulse: 70,
  measured_at: new Date().toISOString(),
  notes: '', user: 'u1', created: '', updated: '',
  ...overrides,
})

describe('filterByPreset', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-12T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns all items for "all" preset', () => {
    const items = [make({ measured_at: '2020-01-01T00:00:00Z' })]
    expect(filterByPreset(items, 'all')).toHaveLength(1)
  })

  it('filters to last 7 days', () => {
    const recent = make({ id: 'r', measured_at: '2026-06-10T00:00:00Z' })
    const old    = make({ id: 'o', measured_at: '2026-06-01T00:00:00Z' })
    expect(filterByPreset([recent, old], '7d')).toEqual([recent])
  })

  it('filters to last 30 days', () => {
    const recent = make({ id: 'r', measured_at: '2026-06-01T00:00:00Z' })
    const old    = make({ id: 'o', measured_at: '2026-04-01T00:00:00Z' })
    expect(filterByPreset([recent, old], '30d')).toEqual([recent])
  })

  it('filters to last 3 months', () => {
    const recent = make({ id: 'r', measured_at: '2026-04-01T00:00:00Z' })
    const old    = make({ id: 'o', measured_at: '2026-01-01T00:00:00Z' })
    expect(filterByPreset([recent, old], '3m')).toEqual([recent])
  })
})

describe('toChartData', () => {
  it('sorts measurements ascending by date', () => {
    const a = make({ measured_at: '2026-06-10T10:00:00Z', systolic: 130, diastolic: 85 })
    const b = make({ measured_at: '2026-06-08T10:00:00Z', systolic: 120, diastolic: 80 })
    const result = toChartData([a, b])
    expect(result[0].diastolic).toBe(80)
    expect(result[1].diastolic).toBe(85)
  })

  it('computes range as systolic minus diastolic', () => {
    const m = make({ systolic: 130, diastolic: 80 })
    expect(toChartData([m])[0].range).toBe(50)
  })

  it('preserves systolic for tooltip', () => {
    const m = make({ systolic: 130, diastolic: 80 })
    expect(toChartData([m])[0].systolic).toBe(130)
  })

  it('sets pulse to null when undefined', () => {
    const m = make({ pulse: undefined })
    expect(toChartData([m])[0].pulse).toBeNull()
  })

  it('formats date label as dd/MM HH:mm', () => {
    const m = make({ measured_at: '2026-06-12T09:05:00Z' })
    expect(toChartData([m])[0].date).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/)
  })
})
