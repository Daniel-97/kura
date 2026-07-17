export interface SummaryStats {
  avg: number
  min: number
  max: number
  count: number
}

export function computeSummaryStats(values: number[]): SummaryStats | null {
  if (values.length === 0) return null
  return {
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  }
}
