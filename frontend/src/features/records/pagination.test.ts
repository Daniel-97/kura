import { describe, it, expect } from 'vitest'
import { nextPageParam } from './useRecords'
import type { ListResult } from 'pocketbase'
import type { HealthRecord } from '@/lib/types'

const page = (n: number, totalPages: number): ListResult<HealthRecord> => ({
  page: n,
  perPage: 100,
  totalItems: totalPages * 100,
  totalPages,
  items: [],
})

describe('nextPageParam', () => {
  it('returns the next page while more pages exist', () => {
    expect(nextPageParam(page(1, 3))).toBe(2)
    expect(nextPageParam(page(2, 3))).toBe(3)
  })

  it('returns undefined on the last page', () => {
    expect(nextPageParam(page(3, 3))).toBeUndefined()
    expect(nextPageParam(page(1, 1))).toBeUndefined()
  })

  it('returns undefined for an empty result set', () => {
    expect(nextPageParam(page(1, 0))).toBeUndefined()
  })
})
