import type { MeasurementType } from '@/lib/types'

interface MeasurementTypeConfig {
  unit: string
  /** Client-side plausibility range; the DB only enforces wide bounds. */
  min: number
  max: number
  step: number
  /** Chart stroke; design system §2.1 for green, --info for the blue. */
  chartColor: string
}

/** Adding a vital sign = one select value in init.js + one entry here. */
export const MEASUREMENT_TYPES: Record<MeasurementType, MeasurementTypeConfig> = {
  weight:  { unit: 'kg',    min: 20, max: 300, step: 0.1, chartColor: '#10B981' },
  glucose: { unit: 'mg/dL', min: 20, max: 600, step: 1,   chartColor: '#0284C7' },
}

export type MeasurementValidationError = 'invalid' | 'range'

export function validateMeasurement(
  type: MeasurementType,
  value: number,
): MeasurementValidationError | null {
  if (!Number.isFinite(value)) return 'invalid'
  const { min, max } = MEASUREMENT_TYPES[type]
  if (value < min || value > max) return 'range'
  return null
}
