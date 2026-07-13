import type { CategoryColor } from '@/lib/types'

export const CATEGORY_COLORS: CategoryColor[] = [
  'indigo', 'sky', 'emerald', 'amber',
  'rose',   'violet', 'teal',  'slate',
]

export const SWATCH_CLASSES: Record<CategoryColor, string> = {
  indigo:  'bg-indigo-500',
  sky:     'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  violet:  'bg-violet-500',
  teal:    'bg-teal-500',
  slate:   'bg-slate-400',
}

const CLASSES: Record<CategoryColor, { dot: string; outline: string }> = {
  indigo:  { dot: 'bg-indigo-500 ring-indigo-500',   outline: 'ring-indigo-500' },
  sky:     { dot: 'bg-sky-500 ring-sky-500',         outline: 'ring-sky-500' },
  emerald: { dot: 'bg-emerald-500 ring-emerald-500', outline: 'ring-emerald-500' },
  amber:   { dot: 'bg-amber-500 ring-amber-500',     outline: 'ring-amber-500' },
  rose:    { dot: 'bg-rose-500 ring-rose-500',       outline: 'ring-rose-500' },
  violet:  { dot: 'bg-violet-500 ring-violet-500',   outline: 'ring-violet-500' },
  teal:    { dot: 'bg-teal-500 ring-teal-500',       outline: 'ring-teal-500' },
  slate:   { dot: 'bg-slate-400 ring-slate-400',     outline: 'ring-slate-400' },
}

const NEUTRAL = { dot: 'bg-muted ring-muted', outline: 'ring-muted' }

export function getCategoryStyles(color: string | null): { dot: string; outline: string } {
  if (!color || !(color in CLASSES)) return NEUTRAL
  return CLASSES[color as CategoryColor]
}
