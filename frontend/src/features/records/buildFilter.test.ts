import { describe, it, expect } from 'vitest'
import { buildFilter } from './useRecords'

describe('buildFilter', () => {
  it('returns an empty string with no filters', () => {
    expect(buildFilter({})).toBe('')
  })

  it('builds the category clause', () => {
    expect(buildFilter({ category: 'abc123' })).toBe("category = 'abc123'")
  })

  it('builds a grouped full-text clause over title, description and tags', () => {
    expect(buildFilter({ search: 'cuore' })).toBe(
      "(title ~ 'cuore' || description ~ 'cuore' || tags ~ 'cuore')",
    )
  })

  it('combines category and search with AND around the grouped clause', () => {
    expect(buildFilter({ category: 'abc123', search: 'cuore' })).toBe(
      "category = 'abc123' && (title ~ 'cuore' || description ~ 'cuore' || tags ~ 'cuore')",
    )
  })

  it('neutralizes filter injection through quoted values', () => {
    // With naive interpolation this would close the string and inject
    // an extra clause; pb.filter keeps it inside a quoted literal.
    expect(buildFilter({ search: 'x" || user != "' })).toBe(
      "(title ~ 'x\" || user != \"' || description ~ 'x\" || user != \"' || tags ~ 'x\" || user != \"')",
    )
  })

  it('escapes single quotes in values', () => {
    expect(buildFilter({ search: "it's" })).toContain("title ~ 'it\\'s'")
  })
})
