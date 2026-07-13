import { describe, it, expect } from 'vitest'
import { buildFilter } from './useRecords'

describe('buildFilter', () => {
  it('returns an empty string with no filters', () => {
    expect(buildFilter({})).toBe('')
  })

  it('builds category and tag clauses', () => {
    expect(buildFilter({ category: 'abc123' })).toBe("category = 'abc123'")
    expect(buildFilter({ category: 'abc123', tag: 'cuore' })).toBe(
      "category = 'abc123' && tags ~ 'cuore'",
    )
  })

  it('neutralizes filter injection through quoted values', () => {
    // With naive interpolation this would close the string and inject
    // an extra clause; pb.filter keeps it inside a quoted literal.
    expect(buildFilter({ tag: 'x" || user != "' })).toBe(
      "tags ~ 'x\" || user != \"'",
    )
  })

  it('escapes single quotes in values', () => {
    expect(buildFilter({ tag: "it's" })).toBe("tags ~ 'it\\'s'")
  })
})
