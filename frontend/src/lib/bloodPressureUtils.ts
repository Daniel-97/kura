import type { BloodPressureRecord } from './types'

export type ChartPreset = '7d' | '30d' | '3m' | 'all'

export interface ChartPoint {
  date: string
  diastolic: number
  range: number
  systolic: number
  pulse: number | null
}

export function filterByPreset(
  measurements: BloodPressureRecord[],
  preset: ChartPreset,
): BloodPressureRecord[] {
  if (preset === 'all') return measurements
  const cutoff = new Date()
  if (preset === '7d') cutoff.setDate(cutoff.getDate() - 7)
  else if (preset === '30d') cutoff.setDate(cutoff.getDate() - 30)
  else cutoff.setMonth(cutoff.getMonth() - 3)
  return measurements.filter((m) => new Date(m.measured_at) >= cutoff)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function toChartData(measurements: BloodPressureRecord[]): ChartPoint[] {
  return [...measurements]
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
    .map((m) => ({
      date: formatDate(m.measured_at),
      diastolic: m.diastolic,
      range: m.systolic - m.diastolic,
      systolic: m.systolic,
      pulse: m.pulse ?? null,
    }))
}
