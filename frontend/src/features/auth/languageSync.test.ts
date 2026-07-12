import { describe, it, expect } from 'vitest'
import { pickUserLanguage } from './languageSync'

describe('pickUserLanguage', () => {
  it('returns a supported language as-is', () => {
    expect(pickUserLanguage('it')).toBe('it')
    expect(pickUserLanguage('en')).toBe('en')
  })

  it('returns null for unsupported or empty values', () => {
    expect(pickUserLanguage('')).toBeNull()
    expect(pickUserLanguage('fr')).toBeNull()
    expect(pickUserLanguage('IT')).toBeNull()
  })

  it('returns null for non-string values', () => {
    expect(pickUserLanguage(undefined)).toBeNull()
    expect(pickUserLanguage(null)).toBeNull()
    expect(pickUserLanguage(42)).toBeNull()
  })
})
