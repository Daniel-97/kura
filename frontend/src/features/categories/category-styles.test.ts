import { describe, it, expect } from 'vitest'
import { getCategoryStyles, CATEGORY_COLORS, SWATCH_CLASSES } from './category-styles'
import type { CategoryColor } from '@/lib/types'

describe('CATEGORY_COLORS', () => {
  it('contains 8 distinct colors', () => {
    expect(CATEGORY_COLORS).toHaveLength(8)
    expect(new Set(CATEGORY_COLORS).size).toBe(8)
  })
})

describe('SWATCH_CLASSES', () => {
  it('has an entry for every color in the palette', () => {
    for (const color of CATEGORY_COLORS) {
      expect(SWATCH_CLASSES[color]).toMatch(/^bg-/)
    }
  })
})

describe('getCategoryStyles', () => {
  it('returns the indigo classes for "indigo"', () => {
    expect(getCategoryStyles('indigo')).toEqual({
      dot: 'bg-indigo-500 ring-indigo-500',
      outline: 'ring-indigo-500',
    })
  })

  it('returns the slate classes for "slate"', () => {
    expect(getCategoryStyles('slate')).toEqual({
      dot: 'bg-slate-400 ring-slate-400',
      outline: 'ring-slate-400',
    })
  })

  it('returns distinct classes for every color in the palette', () => {
    const all = CATEGORY_COLORS.map((c) => getCategoryStyles(c))
    const uniqueDots = new Set(all.map((s) => s.dot))
    expect(uniqueDots.size).toBe(CATEGORY_COLORS.length)
  })

  it('returns the neutral fallback for null', () => {
    expect(getCategoryStyles(null)).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
    })
  })

  it('returns the neutral fallback for an unknown color', () => {
    expect(getCategoryStyles('not-a-color')).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
    })
  })

  it('returns the neutral fallback for an empty string', () => {
    expect(getCategoryStyles('')).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
    })
  })
})

describe('CategoryColor type guard', () => {
  it('CATEGORY_COLORS values are valid CategoryColor literals', () => {
    const colors: CategoryColor[] = CATEGORY_COLORS
    expect(colors.length).toBeGreaterThan(0)
  })
})
