import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert UTC ISO datetime string → "YYYY-MM-DDTHH:MM" in local timezone (for datetime-local input) */
export function toLocalInputValue(iso: string): string {
  const d = new Date(iso.replace(" ", "T"))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Convert local "YYYY-MM-DDTHH:MM" (from datetime-local input) → UTC ISO string */
export function fromLocalInputValue(local: string): string {
  return new Date(local).toISOString()
}

/** Format offset_value (minutes) into a human readable string */
export function formatOffset(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`
  return `${Math.round(minutes / 1440)} g`
}

/** Format offset_value into a label key prefix for i18n */
export function offsetUnit(minutes: number): 'minutes' | 'hours' | 'days' {
  if (minutes < 60) return 'minutes'
  if (minutes < 1440) return 'hours'
  return 'days'
}
