import { describe, it, expect } from 'vitest'
import { MEASUREMENT_TYPES, validateMeasurement } from './measurementTypes'

describe('MEASUREMENT_TYPES', () => {
  it('defines weight and glucose with unit and range', () => {
    expect(MEASUREMENT_TYPES.weight.unit).toBe('kg')
    expect(MEASUREMENT_TYPES.glucose.unit).toBe('mg/dL')
    for (const cfg of Object.values(MEASUREMENT_TYPES)) {
      expect(cfg.min).toBeLessThan(cfg.max)
      expect(cfg.step).toBeGreaterThan(0)
    }
  })
})

describe('validateMeasurement', () => {
  it('accepts values inside the per-type range', () => {
    expect(validateMeasurement('weight', 72.5)).toBeNull()
    expect(validateMeasurement('glucose', 92)).toBeNull()
  })

  it('rejects values outside the range', () => {
    expect(validateMeasurement('weight', 400)).toBe('range')
    expect(validateMeasurement('weight', 10)).toBe('range')
    expect(validateMeasurement('glucose', 800)).toBe('range')
  })

  it('rejects non-numeric input', () => {
    expect(validateMeasurement('weight', NaN)).toBe('invalid')
  })
})
