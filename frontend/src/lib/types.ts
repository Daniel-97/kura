export type CategoryColor =
  | 'indigo' | 'sky' | 'emerald' | 'amber'
  | 'rose'   | 'violet' | 'teal'  | 'slate'

export interface Category {
  id: string
  name: string
  color: CategoryColor
  user: string
  created: string
  updated: string
}

export interface HealthRecord {
  id: string
  title: string
  /** ISO 8601 UTC datetime */
  date: string
  description: string
  /** ID della Category collegata, oppure null (mai stata assegnata o eliminata) */
  category: string | null
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

export type MeasurementType = 'weight' | 'glucose'

export interface Measurement {
  id: string
  type: MeasurementType
  value: number
  measured_at: string
  notes: string
  user: string
  created: string
  updated: string
}

export interface Therapy {
  id: string
  name: string
  dosage: string
  notes: string
  /** 0 = no recurrence (PocketBase empty number) */
  every: number
  unit: '' | 'day' | 'week' | 'month' | 'year'
  /** HH:MM, empty when no recurrence */
  time: string
  start_date: string
  end_date: string
  email_enabled: boolean
  /** Next occurrence, materialized; advanced by the cron */
  next_due: string
  expiry: string
  expiry_notice_at: string
  expiry_notified: string
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
