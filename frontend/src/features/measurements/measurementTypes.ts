import type { MeasurementType } from '@/lib/types'

interface MeasurementTypeConfig {
  unit: string
  /** Client-side plausibility range; the DB only enforces wide bounds. */
  min: number
  max: number
  step: number
  /** Chart stroke. §1.1: un solo accento nel sistema — niente più un
   *  colore per tipo di misurazione (non appaiono mai sullo stesso grafico). */
  chartColor: string
}

/** Adding a vital sign = one select value in init.js + one entry here. */
export const MEASUREMENT_TYPES: Record<MeasurementType, MeasurementTypeConfig> = {
  weight:  { unit: 'kg',    min: 20, max: 300, step: 0.1, chartColor: 'var(--brand-accent)' },
  glucose: { unit: 'mg/dL', min: 20, max: 600, step: 1,   chartColor: 'var(--brand-accent)' },
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
