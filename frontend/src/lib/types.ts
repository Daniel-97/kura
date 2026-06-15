export const CATEGORIES = ['visita', 'esame', 'referto', 'altro'] as const
export type RecordCategory = (typeof CATEGORIES)[number]

export interface HealthRecord {
  id: string
  title: string
  /** ISO 8601 UTC datetime */
  date: string
  description: string
  category: RecordCategory
  /** Comma-separated free-form tags */
  tags: string
  file: string[]
  user: string
  created: string
  updated: string
}

export interface BloodPressureRecord {
  id: string
  systolic: number
  diastolic: number
  pulse?: number
  measured_at: string
  notes: string
  user: string
  created: string
  updated: string
}

export type ReminderKind = 'offset' | 'custom'

export interface Reminder {
  id: string
  record: string
  user: string
  fire_at: string
  sent_at?: string
  message?: string
  created: string
  updated: string
}
